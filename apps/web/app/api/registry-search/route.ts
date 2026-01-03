import { NextResponse } from "next/server";

import { embedSearchQuery } from "@/lib/embeddings";
import {
  getLocalRegistryIndex,
  type RegistryIndexItem,
} from "@/lib/registry-local-index";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_RESULTS = 200;
const DEFAULT_RESULTS = 80;
const DEFAULT_DISTANCE_THRESHOLD = 0.75;

interface RegistrySearchRow {
  id: string;
  registry_namespace: string;
  registry_homepage: string | null;
  name: string;
  title: string | null;
  description: string | null;
  type: string | null;
  tags: string[] | null;
  files: RegistryIndexFile[] | null;
  similarity: number | null;
}

function getLimit(value: string | null) {
  const parsed = Number.parseInt(value ?? "", 10);
  if (Number.isNaN(parsed)) {
    return DEFAULT_RESULTS;
  }

  return Math.min(Math.max(parsed, 1), MAX_RESULTS);
}

function getThreshold(value: string | null) {
  if (!value) {
    return DEFAULT_DISTANCE_THRESHOLD;
  }

  const parsed = Number.parseFloat(value);
  if (Number.isNaN(parsed)) {
    return DEFAULT_DISTANCE_THRESHOLD;
  }

  return Math.min(Math.max(parsed, 0), 1);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";

  if (!query) {
    return NextResponse.json({
      results: [],
      total: 0,
    });
  }

  const limit = getLimit(searchParams.get("limit"));
  const threshold = getThreshold(searchParams.get("threshold"));

  try {
    const embedding = await embedSearchQuery(query);
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.rpc("match_registry_components", {
      query_embedding: embedding,
      match_count: limit,
      match_threshold: threshold,
    });

    if (error) {
      throw new Error(error.message);
    }

    const results = (data as RegistrySearchRow[] | null)?.map((row) => {
      const item: RegistryIndexItem = {
        id: row.id,
        registry: {
          namespace: row.registry_namespace,
          homepage: row.registry_homepage,
        },
        name: row.name,
        title: row.title,
        description: row.description,
        type: row.type,
        files: row.files ?? [],
        tags: row.tags ?? [],
      };

      return {
        item,
        similarity: row.similarity ?? 0,
      };
    });

    return NextResponse.json({
      results: results ?? [],
      total: results?.length ?? 0,
    });
  } catch {
    const fallback = await searchLocalIndex(query, limit);
    return NextResponse.json({
      results: fallback,
      total: fallback.length,
    });
  }
}

async function searchLocalIndex(query: string, limit: number) {
  const index = await getLocalRegistryIndex();
  const items = index.items ?? [];
  const tokens = tokenizeQuery(query);

  const results = items
    .map((item) => {
      const score = scoreItem(item, tokens);
      return score > 0 ? { item, similarity: score } : null;
    })
    .filter((result): result is { item: RegistryIndexItem; similarity: number } =>
      Boolean(result)
    )
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);

  return results;
}

function tokenizeQuery(query: string) {
  const tokens = query
    .toLowerCase()
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2);

  if (tokens.length > 0) {
    return tokens;
  }

  const fallback = query.trim().toLowerCase();
  return fallback ? [fallback] : [];
}

function scoreItem(item: RegistryIndexItem, tokens: string[]) {
  if (tokens.length === 0) {
    return 0;
  }

  const name = item.name.toLowerCase();
  const title = (item.title ?? "").toLowerCase();
  const description = (item.description ?? "").toLowerCase();
  const namespace = item.registry.namespace.toLowerCase();
  const tags = (item.tags ?? []).map((tag) => tag.toLowerCase());

  let score = 0;

  for (const token of tokens) {
    if (name.includes(token)) {
      score += 6;
      if (name.startsWith(token)) {
        score += 2;
      }
    }
    if (title.includes(token)) {
      score += 4;
      if (title.startsWith(token)) {
        score += 1;
      }
    }
    if (namespace.includes(token)) {
      score += 3;
    }
    if (description.includes(token)) {
      score += 1;
    }
    if (tags.some((tag) => tag.includes(token))) {
      score += 2;
    }
  }

  return score;
}
