"use client";
import { Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { cn } from "@/lib/utils";
import { Badge } from "@/registry/new-york-v4/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/new-york-v4/ui/card";
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
  ItemSeparator,
  ItemTitle,
} from "@/registry/new-york-v4/ui/item";

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

const TOP_RESULTS_COUNT = 4;
const MAX_RESULTS = 200;

function highlightMatches(value: string, query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return value;
  }

  const tokens = normalizedQuery
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2);

  if (tokens.length === 0) {
    return value;
  }

  const lowerValue = value.toLowerCase();
  const ranges: Array<[number, number]> = [];

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
  const merged: Array<[number, number]> = [];
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

  merged.forEach(([start, end], index) => {
    if (start > lastIndex) {
      nodes.push(value.slice(lastIndex, start));
    }
    nodes.push(
      <mark
        className="bg-transparent font-semibold text-foreground"
        key={`${start}-${end}-${index}`}
      >
        {value.slice(start, end + 1)}
      </mark>
    );
    lastIndex = end + 1;
  });

  if (lastIndex < value.length) {
    nodes.push(value.slice(lastIndex));
  }

  return nodes;
}

function buildComponentHref(item: RegistryIndexItem) {
  return `/components/${encodeURIComponent(
    item.registry.namespace
  )}/${encodeURIComponent(item.name)}`;
}

export function RegistrySearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryFromParams = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(queryFromParams);
  const [results, setResults] = useState<RegistrySearchResult[]>([]);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [metaError, setMetaError] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setQuery(queryFromParams);
  }, [queryFromParams]);

  useEffect(() => {
    let mounted = true;

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
        setMetaError(
          err instanceof Error ? err.message : "Failed to load search metadata."
        );
      });

    return () => {
      mounted = false;
    };
  }, []);

  const trimmedQuery = query.trim();
  useEffect(() => {
    if (!trimmedQuery) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      setIsSearching(true);
      setSearchError(null);

      fetch(
        `/api/registry-search?q=${encodeURIComponent(
          trimmedQuery
        )}&limit=${MAX_RESULTS}`,
        { signal: controller.signal }
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to search the registry.");
          }
          return response.json();
        })
        .then((data: { results?: RegistrySearchResult[] }) => {
          setResults(Array.isArray(data.results) ? data.results : []);
        })
        .catch((err: unknown) => {
          if ((err as { name?: string }).name === "AbortError") {
            return;
          }
          setSearchError(
            err instanceof Error
              ? err.message
              : "Failed to search the registry."
          );
        })
        .finally(() => {
          setIsSearching(false);
        });
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [trimmedQuery]);

  const topResults = results.slice(0, TOP_RESULTS_COUNT);
  const hasQuery = trimmedQuery.length > 0;
  const error = metaError ?? searchError;
  const isMetaReady = totalCount !== null;

  function updateQuery(nextValue: string) {
    setQuery(nextValue);
    const trimmed = nextValue.trim();
    const target = trimmed
      ? `/search?q=${encodeURIComponent(trimmed)}`
      : "/search";
    const currentTarget = queryFromParams
      ? `/search?q=${encodeURIComponent(queryFromParams)}`
      : "/search";

    if (target === currentTarget) {
      return;
    }

    startTransition(() => {
      router.replace(target, { scroll: false });
    });
  }

  const isSearchRoute = pathname?.startsWith("/search");

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-10 md:px-0">
      {isSearchRoute ? null : (
        <div className="flex flex-col gap-2 text-center">
          <h1 className="font-semibold text-3xl tracking-tight sm:text-4xl">
            Search the registry index
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Find components, blocks, and hooks across open registries.
          </p>
        </div>
      )}

      <div className="mx-auto w-full max-w-3xl">
        <InputGroup className="h-12">
          <InputGroupAddon align="inline-start">
            <Search className="size-4" />
          </InputGroupAddon>
          <InputGroupInput
            autoComplete="off"
            autoFocus
            name="q"
            onChange={(event) => updateQuery(event.target.value)}
            placeholder="Search a component, keyword, or registry…"
            value={query}
          />
          {query ? (
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                aria-label="Clear search"
                onClick={() => updateQuery("")}
                size="icon-xs"
                variant="ghost"
              >
                <X className="size-3.5" />
              </InputGroupButton>
            </InputGroupAddon>
          ) : null}
        </InputGroup>
        <div className="mt-2 flex items-center justify-between text-muted-foreground text-xs">
          <span>
            {totalCount !== null
              ? `${totalCount.toLocaleString()} items indexed.`
              : ""}
          </span>
          <span>
            {isSearching ? "Searching…" : isPending ? "Updating…" : ""}
          </span>
        </div>
      </div>

      {isMetaReady || error ? null : (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
          <div className="flex size-10 items-center justify-center rounded-full border bg-muted/40">
            <Search className="size-4" />
          </div>
          <p>Connecting to semantic search…</p>
        </div>
      )}

      {error ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-destructive text-sm">
          {error}
        </div>
      ) : null}

      {isMetaReady && !hasQuery && isSearchRoute ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20 text-center text-muted-foreground">
          <div className="flex size-10 items-center justify-center rounded-full border bg-muted/40">
            <Search className="size-4" />
          </div>
          <h2 className="font-medium text-base text-foreground">
            Begin your search
          </h2>
          <p className="max-w-md text-sm">
            Enter a component name, keyword, or registry namespace to see
            results instantly.
          </p>
        </div>
      ) : null}

      {hasQuery && !isSearching && results.length === 0 && !searchError ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20 text-center text-muted-foreground">
          <div className="flex size-10 items-center justify-center rounded-full border bg-muted/40">
            <Search className="size-4" />
          </div>
          <h2 className="font-medium text-base text-foreground">
            No results found
          </h2>
          <p className="max-w-md text-sm">
            Try a broader keyword or search the registry namespace directly.
          </p>
        </div>
      ) : null}

      {hasQuery && results.length > 0 ? (
        <div className="flex flex-col gap-10">
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg">Top Results</h2>
              <span className="text-muted-foreground text-xs">
                Showing {results.length} results
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {topResults.map((result) => {
                const item = result.item;
                const displayTitle = item.title ?? item.name;
                const tags = item.tags ?? [];

                return (
                  <Link
                    className="group"
                    href={buildComponentHref(item)}
                    key={item.id}
                  >
                    <Card className="h-full border-border/60 transition-shadow group-hover:shadow-md">
                      <CardHeader className="gap-1">
                        <div className="flex items-center gap-2 text-xs">
                          <Badge variant="secondary">
                            {item.registry.namespace}
                          </Badge>
                          {item.type ? (
                            <Badge variant="outline">{item.type}</Badge>
                          ) : null}
                        </div>
                        <CardTitle className="text-base">
                          {highlightMatches(displayTitle, trimmedQuery)}
                        </CardTitle>
                        {item.description ? (
                          <CardDescription className="line-clamp-2">
                            {highlightMatches(item.description, trimmedQuery)}
                          </CardDescription>
                        ) : null}
                      </CardHeader>
                      <CardContent />
                      <CardFooter className="flex flex-wrap gap-1">
                        {tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </CardFooter>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="font-semibold text-lg">All Results</h2>
            <ItemGroup className="rounded-xl border">
              {results.map((result, index) => {
                const item = result.item;
                const displayTitle = item.title ?? item.name;
                const href = buildComponentHref(item);

                return (
                  <div key={item.id}>
                    <Item
                      asChild
                      className={cn(
                        "rounded-none px-4 py-3 transition-colors hover:bg-muted/40",
                        index === 0 ? "rounded-t-xl" : "",
                        index === results.length - 1 ? "rounded-b-xl" : ""
                      )}
                      size="sm"
                    >
                      <Link href={href}>
                        <ItemContent className="min-w-0">
                          <ItemTitle className="truncate text-sm">
                            {highlightMatches(displayTitle, trimmedQuery)}
                          </ItemTitle>
                          {item.description ? (
                            <ItemDescription className="line-clamp-1">
                              {highlightMatches(item.description, trimmedQuery)}
                            </ItemDescription>
                          ) : null}
                        </ItemContent>
                        <div className="ml-auto flex flex-wrap items-center gap-2">
                          <Badge variant="secondary">
                            {item.registry.namespace}
                          </Badge>
                          {item.type ? (
                            <Badge variant="outline">{item.type}</Badge>
                          ) : null}
                        </div>
                      </Link>
                    </Item>
                    {index < results.length - 1 ? <ItemSeparator /> : null}
                  </div>
                );
              })}
            </ItemGroup>
          </section>
        </div>
      ) : null}
    </div>
  );
}
