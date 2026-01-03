import { NextResponse } from "next/server";

import { embedSearchQuery } from "@/lib/embeddings";
import type { RegistryIndexItem } from "@/lib/registry-local-index";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_RESULTS = 100;
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

    const uniqueResults = dedupeResults(results ?? []);

    return NextResponse.json({
      results: uniqueResults,
      total: uniqueResults.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Search failed.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

function dedupeResults(
  results: Array<{ item: RegistryIndexItem; similarity: number }>
) {
  const seen = new Set<string>();
  return results.filter((result) => {
    const key = result.item.id;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}
