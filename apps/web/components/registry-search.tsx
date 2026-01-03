"use client";
import { Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { createPortal } from "react-dom";

import { toRegistrySlug } from "@/lib/registry-slug";
import { toRegistryTypeLabel } from "@/lib/registry-type";
import { cn } from "@/lib/utils";
import { Badge } from "@/registry/new-york-v4/ui/badge";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/registry/new-york-v4/ui/input-group";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/registry/new-york-v4/ui/item";
import { Skeleton } from "@/registry/new-york-v4/ui/skeleton";
import { Spinner } from "@/registry/new-york-v4/ui/spinner";

interface RegistryIndexFile {
  path: string;
  type: string | null;
}

interface RegistryIndexItem {
  id: string;
  registry: {
    namespace: string;
    homepage: string | null;
  };
  name: string;
  title: string | null;
  description: string | null;
  type: string | null;
  files: RegistryIndexFile[];
  tags: string[];
}

interface RegistrySearchResult {
  item: RegistryIndexItem;
  similarity: number;
}

const MAX_RESULTS = 200;
const SEARCH_DEBOUNCE_MS = 200;
const SEARCH_TIMEOUT_MS = 10_000;
const MAX_DISPLAY_LENGTH = 44;
const INVALID_QUERY_CHARACTERS = /[^a-zA-Z0-9@._/\s-]+/g;
const QUERY_SPLIT_REGEX = /\s+/;
const NORMALIZE_SPACES_REGEX = /\s+/g;
const LIST_SKELETON_KEYS = Array.from(
  { length: 80 },
  (_, index) => `list-skeleton-${index}`
);

function getListItemCornerClasses(index: number, total: number): string {
  const isFirst = index === 0;
  const isLast = index === total - 1;

  return cn(isFirst ? "rounded-t-lg" : "", isLast ? "rounded-b-lg" : "");
}

type SearchErrorKind = "invalid" | "meta" | "network" | "server" | "timeout";

interface SearchErrorState {
  kind: SearchErrorKind;
  title: string;
  message: string;
  actionLabel?: string;
}

function highlightMatches(value: string, query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return value;
  }

  const tokens = normalizedQuery
    .split(QUERY_SPLIT_REGEX)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2);

  if (tokens.length === 0) {
    return value;
  }

  const lowerValue = value.toLowerCase();
  const ranges: [number, number][] = [];

  for (const token of tokens) {
    let startIndex = 0;
    while (startIndex < lowerValue.length) {
      const matchIndex = lowerValue.indexOf(token, startIndex);
      if (matchIndex === -1) {
        break;
      }
      ranges.push([matchIndex, matchIndex + token.length - 1]);
      startIndex = matchIndex + token.length;
    }
  }

  if (ranges.length === 0) {
    return value;
  }

  ranges.sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [];
  for (const [start, end] of ranges) {
    const last = merged.at(-1);
    if (!last || start > last[1] + 1) {
      merged.push([start, end]);
    } else {
      last[1] = Math.max(last[1], end);
    }
  }

  const nodes: Array<string | JSX.Element> = [];
  let lastIndex = 0;

  for (const [start, end] of merged) {
    if (start > lastIndex) {
      nodes.push(value.slice(lastIndex, start));
    }
    nodes.push(
      <span className="font-semibold text-foreground" key={`${start}-${end}`}>
        {value.slice(start, end + 1)}
      </span>
    );
    lastIndex = end + 1;
  }

  if (lastIndex < value.length) {
    nodes.push(value.slice(lastIndex));
  }

  return nodes;
}

function stripInvalidQueryCharacters(value: string) {
  return value.replace(INVALID_QUERY_CHARACTERS, "");
}

function normalizeSearchQuery(value: string) {
  return stripInvalidQueryCharacters(value)
    .replace(NORMALIZE_SPACES_REGEX, " ")
    .trim();
}

function splitForMiddleTruncation(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return { head: value, tail: "", truncated: false };
  }

  const lastSeparator = Math.max(
    value.lastIndexOf("."),
    value.lastIndexOf("-")
  );
  const targetTailLength = Math.min(14, Math.floor(maxLength * 0.4));
  const rawTail =
    lastSeparator > 0
      ? value.slice(lastSeparator)
      : value.slice(-targetTailLength);
  const tail =
    rawTail.length > targetTailLength
      ? rawTail.slice(-targetTailLength)
      : rawTail;
  const headLength = Math.max(4, maxLength - tail.length - 1);
  const head = value.slice(0, headLength);

  return { head, tail, truncated: true };
}

function renderHighlightedValue(value: string, query: string) {
  const { head, tail, truncated } = splitForMiddleTruncation(
    value,
    MAX_DISPLAY_LENGTH
  );

  if (!truncated) {
    return highlightMatches(value, query);
  }

  return (
    <>
      {highlightMatches(head, query)}
      <span className="text-muted-foreground">…</span>
      {highlightMatches(tail, query)}
    </>
  );
}

function renderHighlightedDescription(value: string, query: string) {
  return highlightMatches(value, query);
}

function isDomainLikeQuery(query: string) {
  return query.includes(".") && !query.includes(" ");
}

function domainMatchScore(value: string, query: string) {
  const lowerValue = value.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const matchIndex = lowerValue.lastIndexOf(lowerQuery);

  if (matchIndex === -1) {
    return 0;
  }

  const distanceFromEnd = lowerValue.length - (matchIndex + lowerQuery.length);
  const proximity = 1 - distanceFromEnd / lowerValue.length;
  const endBoost = lowerValue.endsWith(lowerQuery) ? 0.25 : 0;

  return proximity + endBoost;
}

function rankDomainResults(
  results: RegistrySearchResult[],
  query: string
): RegistrySearchResult[] {
  if (!isDomainLikeQuery(query)) {
    return results;
  }

  return [...results].sort((a, b) => {
    const aLabel = a.item.title ?? a.item.name;
    const bLabel = b.item.title ?? b.item.name;
    const aScore = domainMatchScore(aLabel, query);
    const bScore = domainMatchScore(bLabel, query);

    if (aScore !== bScore) {
      return bScore - aScore;
    }

    return b.similarity - a.similarity;
  });
}

function getSearchErrorForStatus(status: number): SearchErrorState {
  if (status === 400) {
    return {
      kind: "invalid",
      title: "Search needs a cleaner query",
      message: "Some characters cannot be matched yet. Try removing symbols.",
    };
  }

  if (status === 429) {
    return {
      kind: "server",
      title: "Too many searches at once",
      message: "Give it a moment and try again.",
      actionLabel: "Retry",
    };
  }

  if (status >= 500) {
    return {
      kind: "server",
      title: "Search is unavailable",
      message: "We could not reach the registry right now.",
      actionLabel: "Retry",
    };
  }

  return {
    kind: "server",
    title: "Search failed",
    message: "We could not complete that search.",
    actionLabel: "Retry",
  };
}

function buildComponentHref(item: RegistryIndexItem, searchQuery?: string) {
  const registrySlug = toRegistrySlug(item.registry.namespace);
  const base = `/components/${encodeURIComponent(
    registrySlug
  )}/${encodeURIComponent(item.name)}`;

  if (!searchQuery) {
    return base;
  }

  const params = new URLSearchParams({ q: searchQuery });
  return `${base}?${params.toString()}`;
}

function isAbortError(error: unknown) {
  return typeof error === "object" && error !== null && "name" in error
    ? (error as { name?: string }).name === "AbortError"
    : false;
}

function isSearchErrorState(error: unknown): error is SearchErrorState {
  return (
    typeof error === "object" &&
    error !== null &&
    "kind" in error &&
    "title" in error &&
    "message" in error
  );
}

function buildNetworkSearchError(error: unknown): SearchErrorState {
  return {
    kind: "network",
    title: "Search failed",
    message:
      error instanceof Error ? error.message : "Failed to search the registry.",
    actionLabel: "Retry",
  };
}

function resolveSearchError(error: unknown, didTimeout: boolean) {
  if (isAbortError(error)) {
    return didTimeout
      ? {
          kind: "timeout",
          title: "Search timed out",
          message: "We could not fetch results fast enough.",
          actionLabel: "Retry",
        }
      : null;
  }

  if (isSearchErrorState(error)) {
    return error;
  }

  return buildNetworkSearchError(error);
}

function useRegistrySearchMeta() {
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [metaError, setMetaError] = useState<SearchErrorState | null>(null);
  const [_retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    let mounted = true;
    setMetaError(null);

    fetch("/api/registry-search/meta")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load search metadata.");
        }
        return response.json();
      })
      .then((data: { count?: number }) => {
        if (!mounted) {
          return;
        }
        setTotalCount(typeof data.count === "number" ? data.count : 0);
      })
      .catch((err: unknown) => {
        if (!mounted) {
          return;
        }
        setMetaError({
          kind: "meta",
          title: "Search metadata unavailable",
          message:
            err instanceof Error
              ? err.message
              : "Failed to load search metadata.",
          actionLabel: "Retry",
        });
      });

    return () => {
      mounted = false;
    };
  }, []);

  return {
    totalCount,
    metaError,
    retry: () => setRetryToken((value) => value + 1),
  };
}

function useRegistrySearchResults(query: string) {
  const [results, setResults] = useState<RegistrySearchResult[]>([]);
  const [searchError, setSearchError] = useState<SearchErrorState | null>(null);
  const [_retryToken, setRetryToken] = useState(0);
  const [isSearching, setIsSearching] = useState(
    () => normalizeSearchQuery(query).trim().length > 0
  );
  const currentRequestIdRef = useRef(0);

  const sanitizedQuery = useMemo(() => normalizeSearchQuery(query), [query]);
  const trimmedQuery = sanitizedQuery.trim();
  const hasInvalidCharacters = stripInvalidQueryCharacters(query) !== query;

  useEffect(() => {
    if (!trimmedQuery) {
      setResults([]);
      setIsSearching(false);
      setSearchError(null);
      return;
    }

    const requestId = currentRequestIdRef.current + 1;
    currentRequestIdRef.current = requestId;
    const controller = new AbortController();
    let didTimeout = false;
    setIsSearching(true);
    setSearchError(null);

    const fetchTimeoutId = window.setTimeout(() => {
      didTimeout = true;
      controller.abort();
    }, SEARCH_TIMEOUT_MS);

    const scheduleId = window.setTimeout(() => {
      fetch(
        `/api/registry-search?q=${encodeURIComponent(
          trimmedQuery
        )}&limit=${MAX_RESULTS}`,
        { signal: controller.signal }
      )
        .then((response) => {
          if (!response.ok) {
            throw getSearchErrorForStatus(response.status);
          }
          return response.json();
        })
        .then((data: { results?: RegistrySearchResult[] }) => {
          if (currentRequestIdRef.current !== requestId) {
            return;
          }
          const incoming = Array.isArray(data.results) ? data.results : [];
          setResults(rankDomainResults(incoming, trimmedQuery));
        })
        .catch((err: unknown) => {
          if (currentRequestIdRef.current !== requestId) {
            return;
          }

          const resolvedError = resolveSearchError(err, didTimeout);
          if (resolvedError) {
            setSearchError(resolvedError);
          }
        })
        .finally(() => {
          if (currentRequestIdRef.current === requestId) {
            setIsSearching(false);
          }
          window.clearTimeout(fetchTimeoutId);
        });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      controller.abort();
      window.clearTimeout(scheduleId);
      window.clearTimeout(fetchTimeoutId);
    };
  }, [trimmedQuery]);

  return {
    results,
    isSearching,
    searchError,
    hasInvalidCharacters,
    trimmedQuery,
    retry: () => setRetryToken((value) => value + 1),
  };
}

function useSearchHeaderSlot() {
  const [headerSlot, setHeaderSlot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setHeaderSlot(document.getElementById("registry-search-slot"));
  }, []);

  return headerSlot;
}

function useSearchInputFocus(inputRef: React.RefObject<HTMLInputElement>) {
  const [isInputFocused, setIsInputFocused] = useState(false);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) {
      return;
    }

    const focusInput = () => {
      if (document.activeElement !== input) {
        input.focus();
      }
    };

    focusInput();
    const timeoutId = window.setTimeout(focusInput, 0);

    const handleFocus = () => setIsInputFocused(true);
    const handleBlur = () => setIsInputFocused(false);

    input.addEventListener("focus", handleFocus);
    input.addEventListener("blur", handleBlur);

    return () => {
      window.clearTimeout(timeoutId);
      input.removeEventListener("focus", handleFocus);
      input.removeEventListener("blur", handleBlur);
    };
  }, [inputRef.current]);

  return isInputFocused;
}

function useCmdFShortcut(inputRef: React.RefObject<HTMLInputElement>) {
  const [isCmdFActive, setIsCmdFActive] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isCmdF =
        (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "f";
      if (!isCmdF) {
        return;
      }

      event.preventDefault();
      setIsCmdFActive(true);
      inputRef.current?.focus();
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key === "f" || key === "meta" || key === "control") {
        setIsCmdFActive(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [inputRef.current?.focus]);

  return isCmdFActive;
}

function RegistrySearchHero({ isVisible }: { isVisible: boolean }) {
  if (!isVisible) {
    return null;
  }

  return (
    <div className="flex min-h-full w-full flex-1 shrink-0 flex-col items-center justify-center">
      <div className="-translate-y-[120px] transform">
        <div className="rounded-2xl p-10 text-center">
          <div className="space-y-3">
            <div>
              <p className="text-heading-40 md:text-heading-48">
                Search the shadcn index
              </p>
              <p className="text-gray-900 text-heading-40 md:text-heading-48">
                Find components, blocks, and hooks.
              </p>
            </div>
            <p className="font-normal text-copy-16 text-muted-foreground">
              Explore shadcn registries in one place.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

type SearchInputVariant = "centered" | "inline";

function RegistrySearchInputSection({
  isVisible,
  searchInput,
  searchMeta,
  maxWidthClass,
  variant,
  isSticky,
}: {
  isVisible: boolean;
  searchInput: ReactNode;
  searchMeta: ReactNode;
  maxWidthClass?: string;
  variant: SearchInputVariant;
  isSticky?: boolean;
}) {
  if (!isVisible) {
    return null;
  }

  if (variant === "centered") {
    return (
      <div className="absolute top-[calc(50vh+10px)] left-1/2 z-20 w-[min(520px,90vw)] -translate-x-1/2">
        <div className="flex flex-col items-center gap-3">{searchInput}</div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex w-full flex-col items-center",
        isSticky &&
          "sticky top-0 z-20 bg-background-200/80 py-3 backdrop-blur supports-[backdrop-filter]:bg-background-200/70"
      )}
    >
      <div className={cn("w-full", maxWidthClass)}>
        {searchInput}
        {searchMeta}
      </div>
    </div>
  );
}

function RegistrySearchErrorNotice({
  error,
  onRetry,
}: {
  error: SearchErrorState | null;
  onRetry: () => void;
}) {
  if (!error) {
    return null;
  }

  return (
    <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm">
      <div className="font-semibold text-destructive">{error.title}</div>
      <p className="mt-1 text-destructive/90">{error.message}</p>
      {error.actionLabel ? (
        <button
          className="mt-3 inline-flex items-center gap-2 text-destructive underline-offset-4 hover:underline"
          onClick={onRetry}
          type="button"
        >
          {error.actionLabel}
        </button>
      ) : null}
    </div>
  );
}

function RegistrySearchEmptyState({
  isVisible,
  title,
  description,
}: {
  isVisible: boolean;
  title: string;
  description: ReactNode;
}) {
  if (!isVisible) {
    return null;
  }

  return (
    <div className="flex size-full flex-col items-center justify-center">
      <div className="flex max-w-md flex-col items-center gap-2 text-center">
        <div className="flex size-9 items-center justify-center rounded-md border border-border/70 bg-muted/30">
          <Search className="size-4 text-muted-foreground" />
        </div>
        <h2 className="font-semibold text-foreground">{title}</h2>
        <p className="text-foreground/80 text-sm">{description}</p>
      </div>
      <div className="flex h-56 md:hidden" />
    </div>
  );
}

function RegistrySearchSkeleton({ isVisible }: { isVisible: boolean }) {
  if (!isVisible) {
    return null;
  }

  return (
    <section className="flex flex-col gap-2 md:gap-3">
      <div className="flex flex-row items-center justify-between gap-2 md:gap-0">
        <Skeleton className="h-6 w-28" />
      </div>
      <div className="grid w-full grid-cols-1 gap-px overflow-hidden rounded-lg border border-border/60 bg-border/40">
        {LIST_SKELETON_KEYS.map((key, index) => (
          <div
            className={cn(
              "flex h-[60px] items-center gap-3 rounded-none bg-card px-4 py-3 md:h-[56px] md:py-2",
              getListItemCornerClasses(index, LIST_SKELETON_KEYS.length)
            )}
            key={key}
          >
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function RegistrySearchResultsSection({
  isVisible,
  dedupedResults,
  trimmedQuery,
}: {
  isVisible: boolean;
  dedupedResults: RegistrySearchResult[];
  trimmedQuery: string;
}) {
  if (!isVisible) {
    return null;
  }

  return (
    <section className="flex flex-col gap-2 md:gap-3">
      <div className="flex flex-row items-center justify-between gap-2 md:gap-0">
        <h2 className="font-semibold text-heading-16 text-lg md:text-2xl md:text-heading-24">
          All results
        </h2>
        <span className="text-muted-foreground text-xs">
          Showing {dedupedResults.length} results
        </span>
      </div>
      <ItemGroup className="grid w-full grid-cols-1 gap-px overflow-hidden rounded-lg border border-border/60 bg-border/40">
        {dedupedResults.map((result, index) => {
          const item = result.item;
          const displayTitle = item.title ?? item.name;
          const href = buildComponentHref(item, trimmedQuery);
          const cornerClasses = getListItemCornerClasses(
            index,
            dedupedResults.length
          );
          const registryLabel = toRegistrySlug(item.registry.namespace);
          const typeLabel = toRegistryTypeLabel(item.type);

          return (
            <div key={item.id}>
              <Item
                asChild
                className={cn(
                  "h-[60px] rounded-none bg-card px-4 py-3 text-[13px] transition-colors focus-visible:bg-muted/60 md:h-[56px] md:py-2",
                  cornerClasses
                )}
                size="sm"
              >
                <Link href={href}>
                  <ItemContent className="min-w-0">
                    <ItemTitle className="line-clamp-1 font-medium text-sm underline-offset-4 transition-colors group-hover/item:underline">
                      {renderHighlightedValue(displayTitle, trimmedQuery)}
                    </ItemTitle>
                    {item.description ? (
                      <ItemDescription className="line-clamp-1 text-muted-foreground/80 text-xs">
                        {renderHighlightedDescription(
                          item.description,
                          trimmedQuery
                        )}
                      </ItemDescription>
                    ) : null}
                  </ItemContent>
                  <div className="ml-auto flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{registryLabel}</Badge>
                    {typeLabel ? (
                      <Badge variant="outline">{typeLabel}</Badge>
                    ) : null}
                  </div>
                </Link>
              </Item>
            </div>
          );
        })}
      </ItemGroup>
    </section>
  );
}

function RegistrySearchView({
  headerSearchNode,
  showHero,
  shouldRenderSearchInline,
  searchInput,
  searchMeta,
  inputMaxWidthClass,
  inputVariant,
  isStickyInput,
  isMetaReady: _isMetaReady,
  error,
  onRetry,
  showBeginState,
  showSanitizedState,
  showNoResultsState,
  showSkeleton,
  showResults,
  dedupedResults,
  trimmedQuery,
}: {
  headerSearchNode: ReactNode;
  showHero: boolean;
  shouldRenderSearchInline: boolean;
  searchInput: ReactNode;
  searchMeta: ReactNode;
  inputMaxWidthClass?: string;
  inputVariant: SearchInputVariant;
  isStickyInput?: boolean;
  isMetaReady: boolean;
  error: SearchErrorState | null;
  onRetry: () => void;
  showBeginState: boolean;
  showSanitizedState: boolean;
  showNoResultsState: boolean;
  showSkeleton: boolean;
  showResults: boolean;
  dedupedResults: RegistrySearchResult[];
  trimmedQuery: string;
}) {
  return (
    <div className="relative flex min-h-full w-full flex-1 flex-col gap-6">
      {headerSearchNode}
      <RegistrySearchHero isVisible={showHero} />
      <RegistrySearchInputSection
        isSticky={isStickyInput}
        isVisible={shouldRenderSearchInline}
        maxWidthClass={inputMaxWidthClass}
        searchInput={searchInput}
        searchMeta={searchMeta}
        variant={inputVariant}
      />
      <RegistrySearchErrorNotice error={error} onRetry={onRetry} />
      <RegistrySearchEmptyState
        description={
          <>
            {"Enter a component name, keyword, or registry namespace"}
            <br />
            {"to see results instantly."}
          </>
        }
        isVisible={showBeginState}
        title="Begin your search"
      />
      <RegistrySearchEmptyState
        description="Try letters, numbers, or a registry namespace query."
        isVisible={showSanitizedState}
        title="We filtered unsupported characters"
      />
      <RegistrySearchEmptyState
        description="Try a broader keyword or search the registry namespace directly."
        isVisible={showNoResultsState}
        title="No results found"
      />
      <RegistrySearchSkeleton isVisible={showSkeleton} />
      <RegistrySearchResultsSection
        dedupedResults={dedupedResults}
        isVisible={showResults}
        trimmedQuery={trimmedQuery}
      />
    </div>
  );
}

function deduplicateResults(
  results: RegistrySearchResult[]
): RegistrySearchResult[] {
  const seen = new Set<string>();
  const uniqueResults: RegistrySearchResult[] = [];

  for (const result of results) {
    const registrySlug = toRegistrySlug(result.item.registry.namespace);
    const key = `${registrySlug}::${result.item.name}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    uniqueResults.push(result);
  }

  return uniqueResults;
}

function computeDisplayState({
  isMetaReady,
  hasRawQuery,
  isSearchResultsRoute,
  hasQuery,
  isSearching,
  resultsLength,
  searchError,
  shouldCenterInput,
  shouldRenderSearchInline,
}: {
  isMetaReady: boolean;
  hasRawQuery: boolean;
  isSearchResultsRoute: boolean;
  hasQuery: boolean;
  isSearching: boolean;
  resultsLength: number;
  searchError: SearchErrorState | null;
  shouldCenterInput: boolean;
  shouldRenderSearchInline: boolean;
}) {
  const showBeginState = isMetaReady && !hasRawQuery && isSearchResultsRoute;
  const showSanitizedState = hasRawQuery && !hasQuery;
  const showNoResultsState =
    hasQuery && !isSearching && resultsLength === 0 && !searchError;
  const showResults = hasQuery && resultsLength > 0;
  const showHero = shouldCenterInput;
  const shouldStickInput = isSearchResultsRoute && shouldRenderSearchInline;
  const showResultsSkeleton =
    hasQuery && isSearching && resultsLength === 0 && !searchError;

  return {
    showBeginState,
    showSanitizedState,
    showNoResultsState,
    showResults,
    showHero,
    shouldStickInput,
    showResultsSkeleton,
  };
}

function createSearchInputElement(
  query: string,
  isSearching: boolean,
  inputRef: React.RefObject<HTMLInputElement>,
  updateQuery: (value: string) => void
) {
  return (
    <InputGroup className="h-12 w-full">
      <InputGroupAddon align="inline-start">
        <Search className="size-4" />
      </InputGroupAddon>
      <InputGroupInput
        autoComplete="off"
        autoFocus
        name="q"
        onChange={(event) => updateQuery(event.target.value)}
        placeholder="Search a component, keyword, or registry…"
        ref={inputRef}
        value={query}
      />
      {isSearching || query ? (
        <InputGroupAddon align="inline-end" className="gap-2">
          {isSearching ? (
            <Spinner aria-hidden="true" className="text-muted-foreground" />
          ) : null}
          {query ? (
            <InputGroupButton
              aria-label="Clear search"
              onClick={() => updateQuery("")}
              size="icon-xs"
              variant="ghost"
            >
              <X className="size-3.5" />
            </InputGroupButton>
          ) : null}
        </InputGroupAddon>
      ) : null}
    </InputGroup>
  );
}

function createHeaderSearchContent(
  inputVariant: SearchInputVariant,
  searchInput: ReactNode,
  isHomeRoute: boolean,
  searchMeta: ReactNode,
  inputMaxWidthClass: string
) {
  if (inputVariant === "centered") {
    return (
      <div className="absolute top-[calc(50vh+10px)] left-1/2 z-20 w-[min(520px,90vw)] -translate-x-1/2">
        <div className="flex flex-col items-center gap-3">{searchInput}</div>
      </div>
    );
  }

  return (
    <div className={cn("mx-auto w-full", inputMaxWidthClass)}>
      {searchInput}
      {isHomeRoute ? null : searchMeta}
    </div>
  );
}

export function RegistrySearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryFromParams = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(queryFromParams);
  const { totalCount, metaError, retry: retryMeta } = useRegistrySearchMeta();
  const {
    results,
    isSearching,
    searchError,
    hasInvalidCharacters,
    trimmedQuery,
    retry: retrySearch,
  } = useRegistrySearchResults(query);
  const [_isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const _isInputFocused = useSearchInputFocus(inputRef);
  const _isCmdFActive = useCmdFShortcut(inputRef);
  const headerSlot = useSearchHeaderSlot();
  const isHomeRoute = pathname === "/";
  const isSearchResultsRoute = pathname?.startsWith("/search") ?? false;
  const isModalRoute = pathname?.startsWith("/components") ?? false;
  const hasSearchParam = queryFromParams.trim().length > 0;
  const isSearchRoute = isHomeRoute || isSearchResultsRoute;

  useEffect(() => {
    setQuery(queryFromParams);
  }, [queryFromParams]);

  const dedupedResults = useMemo(() => deduplicateResults(results), [results]);
  const hasQuery = trimmedQuery.length > 0;
  const hasRawQuery = query.trim().length > 0;
  const error = metaError ?? searchError;
  const isMetaReady = totalCount !== null;
  const showSanitizedHint = hasInvalidCharacters && query.length > 0;
  const shouldCenterInput = isHomeRoute && !hasRawQuery;
  const shouldRenderSearchInHeader = Boolean(
    headerSlot && (isSearchRoute || (isModalRoute && hasSearchParam))
  );
  const shouldRenderSearchInline = !shouldRenderSearchInHeader;
  const inputMaxWidthClass = "max-w-[520px]";
  const inputVariant: SearchInputVariant = shouldCenterInput
    ? "centered"
    : "inline";

  const displayState = computeDisplayState({
    isMetaReady,
    hasRawQuery,
    isSearchResultsRoute,
    hasQuery,
    isSearching,
    resultsLength: results.length,
    searchError,
    shouldCenterInput,
    shouldRenderSearchInline,
  });

  function handleRetry() {
    if (error?.kind === "meta") {
      retryMeta();
      return;
    }

    if (error) {
      retrySearch();
    }
  }

  function updateQuery(nextValue: string) {
    setQuery(nextValue);
    const trimmed = nextValue.trim();
    const target = trimmed
      ? `/search?q=${encodeURIComponent(trimmed)}`
      : "/search";

    let currentTarget: string;
    if (pathname?.startsWith("/search")) {
      currentTarget = queryFromParams
        ? `/search?q=${encodeURIComponent(queryFromParams)}`
        : "/search";
    } else {
      currentTarget = pathname ?? "/";
    }

    if (target === currentTarget) {
      return;
    }

    startTransition(() => {
      router.replace(target, { scroll: false });
    });
  }

  const searchInput = createSearchInputElement(
    query,
    isSearching,
    inputRef,
    updateQuery
  );

  const searchMeta = showSanitizedHint ? (
    <p
      className={cn(
        "text-muted-foreground text-xs",
        isSearchRoute ? "mt-0" : "mt-2"
      )}
    >
      {"Unsupported characters are ignored in results."}
    </p>
  ) : null;
  const searchMetaNode =
    shouldRenderSearchInline && !isHomeRoute ? searchMeta : null;

  const headerSearchContent =
    inputVariant === "centered" ? (
      <div className="absolute top-[calc(50vh+10px)] left-1/2 z-20 w-[min(520px,90vw)] -translate-x-1/2">
        <div className="flex flex-col items-center gap-3">{searchInput}</div>
      </div>
    ) : (
      <div className={cn("mx-auto w-full", inputMaxWidthClass)}>
        {searchInput}
        {isHomeRoute ? null : searchMeta}
      </div>
    );

  const headerSearchNode =
    shouldRenderSearchInHeader && headerSlot
      ? createPortal(headerSearchContent, headerSlot)
      : null;

  return (
    <RegistrySearchView
      dedupedResults={dedupedResults}
      error={error}
      headerSearchNode={headerSearchNode}
      inputMaxWidthClass={inputMaxWidthClass}
      inputVariant={inputVariant}
      isMetaReady={isMetaReady}
      isStickyInput={displayState.shouldStickInput}
      onRetry={handleRetry}
      searchInput={searchInput}
      searchMeta={searchMetaNode}
      shouldRenderSearchInline={shouldRenderSearchInline}
      showBeginState={displayState.showBeginState}
      showHero={displayState.showHero}
      showNoResultsState={displayState.showNoResultsState}
      showResults={displayState.showResults}
      showSanitizedState={displayState.showSanitizedState}
      showSkeleton={displayState.showResultsSkeleton}
      trimmedQuery={trimmedQuery}
    />
  );
}
