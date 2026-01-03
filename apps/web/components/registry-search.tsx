"use client";
import { Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";

import { toRegistrySlug } from "@/lib/registry-slug";
import { toRegistryTypeLabel } from "@/lib/registry-type";
import { cn } from "@/lib/utils";
import { Badge } from "@/registry/new-york-v4/ui/badge";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/registry/new-york-v4/ui/item";
import { Skeleton } from "@/registry/new-york-v4/ui/skeleton";

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

interface RegistryDirectoryMeta {
  title: string;
  description: string | null;
  logo: string | null;
  homepage: string | null;
}

const MAX_RESULTS = 200;
const SEARCH_DEBOUNCE_MS = 200;
const SEARCH_TIMEOUT_MS = 10_000;
const MAX_DISPLAY_LENGTH = 44;
const INVALID_QUERY_CHARACTERS = /[^a-zA-Z0-9@._/\s-]+/g;
const QUERY_SPLIT_REGEX = /\s+/;
const NORMALIZE_SPACES_REGEX = /\s+/g;
const LIST_SKELETON_KEYS = Array.from(
  { length: 5 },
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

function useRegistryDirectory() {
  const [registryDirectory, setRegistryDirectory] = useState<
    Record<string, RegistryDirectoryMeta>
  >({});

  useEffect(() => {
    let mounted = true;

    fetch("/api/registry-directory")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load registry directory.");
        }
        return response.json();
      })
      .then((data: { registries?: Record<string, RegistryDirectoryMeta> }) => {
        if (!mounted) {
          return;
        }
        setRegistryDirectory(data.registries ?? {});
      })
      .catch(() => {
        if (!mounted) {
          return;
        }
        setRegistryDirectory({});
      });

    return () => {
      mounted = false;
    };
  }, []);

  return registryDirectory;
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
              <p className="text-heading-40 text-muted-foreground md:text-heading-48">
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
  registryDirectory,
}: {
  isVisible: boolean;
  dedupedResults: RegistrySearchResult[];
  trimmedQuery: string;
  registryDirectory: Record<string, RegistryDirectoryMeta>;
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
          const registryNamespace = item.registry.namespace;
          const registryLabel = toRegistrySlug(registryNamespace);
          const registryMeta =
            registryDirectory[registryNamespace] ??
            registryDirectory[registryLabel];
          const registryTitle = registryMeta?.title ?? registryLabel;
          const registryDescription = registryMeta?.description ?? null;
          const registryTooltip = registryDescription
            ? `${registryTitle} — ${registryDescription}`
            : registryTitle;
          const typeLabel = toRegistryTypeLabel(item.type);
          const registryLogoMarkup = registryMeta?.logo ?? null;
          const registryLogo =
            typeof registryLogoMarkup === "string"
              ? registryLogoMarkup.trim()
              : "";
          const shouldRenderLogo =
            registryLogo.startsWith("<svg") && registryLogo.includes("</svg>");

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
                    <Badge title={registryTooltip} variant="outline">
                      {shouldRenderLogo ? (
                        <ItemMedia
                          aria-hidden="true"
                          className="size-3 bg-transparent grayscale [&_svg]:size-3 [&_svg]:fill-foreground"
                          // biome-ignore lint/security/noDangerouslySetInnerHtml: SVGs are sourced from a trusted registry directory file.
                          dangerouslySetInnerHTML={{ __html: registryLogo }}
                          variant="default"
                        />
                      ) : null}
                      <span>{registryLabel}</span>
                    </Badge>
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
  showHero,
  searchMeta,
  inputMaxWidthClass,
  isMetaReady: _isMetaReady,
  registryDirectory,
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
  showHero: boolean;
  searchMeta: ReactNode;
  inputMaxWidthClass?: string;
  isMetaReady: boolean;
  registryDirectory: Record<string, RegistryDirectoryMeta>;
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
    <>
      <RegistrySearchHero isVisible={showHero} />

      <div className="mx-auto flex max-w-screen-2xl flex-col gap-6 px-4 pt-3 pb-4 sm:px-5 md:px-12 lg:px-16 xl:px-32">
        <div className="relative flex min-h-full w-full flex-1 flex-col gap-6">
          <div className={cn("mx-auto w-full", inputMaxWidthClass)}>
            {searchMeta}
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
          </div>
          <RegistrySearchSkeleton isVisible={showSkeleton} />
          <RegistrySearchResultsSection
            dedupedResults={dedupedResults}
            isVisible={showResults}
            registryDirectory={registryDirectory}
            trimmedQuery={trimmedQuery}
          />
        </div>
      </div>
    </>
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
}: {
  isMetaReady: boolean;
  hasRawQuery: boolean;
  isSearchResultsRoute: boolean;
  hasQuery: boolean;
  isSearching: boolean;
  resultsLength: number;
  searchError: SearchErrorState | null;
  shouldCenterInput: boolean;
}) {
  const showBeginState = isMetaReady && !hasRawQuery && isSearchResultsRoute;
  const showSanitizedState = hasRawQuery && !hasQuery;
  const showNoResultsState =
    hasQuery && !isSearching && resultsLength === 0 && !searchError;
  const showResults = hasQuery && resultsLength > 0;
  const showHero = shouldCenterInput;
  const showResultsSkeleton =
    hasQuery && isSearching && resultsLength === 0 && !searchError;

  return {
    showBeginState,
    showSanitizedState,
    showNoResultsState,
    showResults,
    showHero,
    showResultsSkeleton,
  };
}

export function RegistrySearch() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryFromParams = searchParams.get("q") ?? "";
  const { totalCount, metaError, retry: retryMeta } = useRegistrySearchMeta();
  const {
    results,
    isSearching,
    searchError,
    hasInvalidCharacters,
    trimmedQuery,
    retry: retrySearch,
  } = useRegistrySearchResults(queryFromParams);
  const registryDirectory = useRegistryDirectory();
  const isHomeRoute = pathname === "/";
  const isSearchResultsRoute = pathname?.startsWith("/search") ?? false;
  const isSearchRoute = isHomeRoute || isSearchResultsRoute;

  const dedupedResults = useMemo(() => deduplicateResults(results), [results]);
  const hasQuery = trimmedQuery.length > 0;
  const hasRawQuery = queryFromParams.trim().length > 0;
  const error = metaError ?? searchError;
  const isMetaReady = totalCount !== null;
  const showSanitizedHint = hasInvalidCharacters && queryFromParams.length > 0;
  const shouldCenterInput = isHomeRoute && !hasRawQuery;
  const inputMaxWidthClass = "max-w-[520px]";

  const displayState = computeDisplayState({
    isMetaReady,
    hasRawQuery,
    isSearchResultsRoute,
    hasQuery,
    isSearching,
    resultsLength: results.length,
    searchError,
    shouldCenterInput,
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
  const searchMetaNode = isHomeRoute ? null : searchMeta;

  return (
    <RegistrySearchView
      dedupedResults={dedupedResults}
      error={error}
      inputMaxWidthClass={inputMaxWidthClass}
      isMetaReady={isMetaReady}
      onRetry={handleRetry}
      registryDirectory={registryDirectory}
      searchMeta={searchMetaNode}
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
