import { NextResponse } from "next/server";

import { embedSearchQuery } from "@/lib/embeddings";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_RESULTS = 200;
const DEFAULT_RESULTS = 80;
const DEFAULT_DISTANCE_THRESHOLD = 0.75;

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
  const embedding = await embedSearchQuery(query);

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.rpc("match_registry_components", {
    query_embedding: embedding,
    match_count: limit,
    match_threshold: threshold,
  });

  if (error) {
    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 }
    );
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
}
