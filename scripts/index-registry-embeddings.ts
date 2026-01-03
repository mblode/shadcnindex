import "dotenv/config";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";

import { openai } from "@ai-sdk/openai";
import { createClient } from "@supabase/supabase-js";
import { embedMany } from "ai";

const DEFAULT_BATCH_SIZE = 100;
const DEFAULT_EMBEDDING_MODEL = "text-embedding-3-small";
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_RETRY_BASE_MS = 500;

interface ParsedOptions {
  indexPath: string | null;
  batchSize: number;
  model: string;
}

interface RegistryItem {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  type?: string;
  tags?: string[];
  files?: string[];
  registry?: {
    namespace?: string;
    homepage?: string;
  };
}

interface RegistryIndex {
  items?: RegistryItem[];
}

function printHelp(): void {
  console.log(`
Usage: tsx scripts/index-registry-embeddings.ts [options]

Options:
  --index <file>       Registry index JSON (default: apps/web/public/registry-index.json)
  --batch-size <n>     Embedding batch size (default: ${DEFAULT_BATCH_SIZE})
  --model <id>         OpenAI embedding model (default: ${DEFAULT_EMBEDDING_MODEL})
  --help               Show this help

Env:
  OPENAI_API_KEY
  SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_ROLE / SUPABASE_SECRET_KEY)
  EMBEDDING_BATCH_SIZE, EMBEDDING_MODEL, EMBEDDING_MAX_RETRIES, EMBEDDING_RETRY_BASE_MS
  REGISTRY_INDEX_PATH
`);
}

function parseArgs(argv: string[]): ParsedOptions {
  const options: ParsedOptions = {
    indexPath: process.env.REGISTRY_INDEX_PATH ?? null,
    batchSize: Number.parseInt(
      process.env.EMBEDDING_BATCH_SIZE ?? String(DEFAULT_BATCH_SIZE),
      10
    ),
    model: process.env.EMBEDDING_MODEL ?? DEFAULT_EMBEDDING_MODEL,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    switch (arg) {
      case "--index":
        options.indexPath = argv[++i];
        break;
      case "--batch-size":
        options.batchSize = Number.parseInt(argv[++i], 10);
        break;
      case "--model":
        options.model = argv[++i];
        break;
      case "--help":
        printHelp();
        process.exit(0);
        break;
      default:
        if (arg?.startsWith("-")) {
          console.warn(`Unknown option: ${arg}`);
        }
        break;
    }
  }

  return options;
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function resolveIndexPath(explicitPath: string | null): Promise<string> {
  const candidates = [
    explicitPath,
    process.env.REGISTRY_INDEX_PATH,
    path.join(process.cwd(), "public", "registry-index.json"),
    path.join(process.cwd(), "apps", "web", "public", "registry-index.json"),
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    const resolved = path.resolve(process.cwd(), candidate);
    if (await fileExists(resolved)) {
      return resolved;
    }
  }

  throw new Error(
    "Could not locate registry-index.json. Pass --index or set REGISTRY_INDEX_PATH."
  );
}

async function withRetry<T>(
  task: () => Promise<T>,
  label: string,
  maxRetries: number,
  baseDelayMs: number
): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await task();
    } catch (error) {
      if (attempt >= maxRetries) {
        throw error;
      }
      const waitMs = baseDelayMs * 2 ** attempt;
      console.warn(
        `${label} failed (attempt ${attempt + 1}/${maxRetries + 1}). Retrying in ${waitMs}ms.`
      );
      await delay(waitMs);
      attempt += 1;
    }
  }
}

async function main(): Promise<void> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SERVICE_ROLE ??
    process.env.SUPABASE_SECRET_KEY;

  const openAiApiKey = process.env.OPENAI_API_KEY;

  if (!(supabaseUrl && supabaseServiceKey)) {
    throw new Error(
      "Missing SUPABASE_URL or a service role key (SUPABASE_SERVICE_ROLE_KEY/SUPABASE_SERVICE_ROLE/SUPABASE_SECRET_KEY)."
    );
  }

  if (!openAiApiKey) {
    throw new Error("Missing OPENAI_API_KEY.");
  }

  const options = parseArgs(process.argv.slice(2));
  const batchSize = Number.isFinite(options.batchSize)
    ? Math.max(1, options.batchSize)
    : DEFAULT_BATCH_SIZE;
  const maxRetries = Number.parseInt(
    process.env.EMBEDDING_MAX_RETRIES ?? String(DEFAULT_MAX_RETRIES),
    10
  );
  const retryBaseMs = Number.parseInt(
    process.env.EMBEDDING_RETRY_BASE_MS ?? String(DEFAULT_RETRY_BASE_MS),
    10
  );

  const indexPath = await resolveIndexPath(options.indexPath);
  const rawIndex = await readFile(indexPath, "utf8");
  const parsed: RegistryIndex = JSON.parse(rawIndex);
  const items: RegistryItem[] = Array.isArray(parsed.items) ? parsed.items : [];

  if (!items.length) {
    console.log("No registry items found in registry-index.json.");
    process.exit(0);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  const model = openai.embedding(options.model);

  if (options.model !== DEFAULT_EMBEDDING_MODEL) {
    console.warn(
      `Using embedding model "${options.model}". Ensure Supabase vector dimensions match this model.`
    );
  }

  const buildEmbeddingText = (item: RegistryItem): string => {
    const parts = [
      item.title ?? item.name ?? item.id ?? "",
      item.description ?? "",
      item.registry?.namespace ? `registry: ${item.registry.namespace}` : "",
      item.type ? `type: ${item.type}` : "",
      Array.isArray(item.tags) && item.tags.length > 0
        ? `tags: ${item.tags.join(", ")}`
        : "",
    ];

    const text = parts.filter(Boolean).join("\n");
    return text || String(item.id ?? "unknown");
  };

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const values = batch.map(buildEmbeddingText);

    const { embeddings } = await withRetry(
      () => embedMany({ model, values }),
      "Embedding batch",
      maxRetries,
      retryBaseMs
    );

    if (embeddings.length !== batch.length) {
      throw new Error(
        `Embedding batch mismatch: expected ${batch.length}, got ${embeddings.length}.`
      );
    }

    const rows = batch.map((item, index) => ({
      id: item.id,
      registry_namespace: item.registry?.namespace ?? "",
      registry_homepage: item.registry?.homepage ?? null,
      name: item.name ?? "",
      title: item.title ?? null,
      description: item.description ?? null,
      type: item.type ?? null,
      tags: Array.isArray(item.tags) ? item.tags : [],
      files: Array.isArray(item.files) ? item.files : [],
      embedding: embeddings[index],
      updated_at: new Date().toISOString(),
    }));

    const { error } = await withRetry(
      () =>
        supabase.from("registry_components").upsert(rows, { onConflict: "id" }),
      "Supabase upsert",
      maxRetries,
      retryBaseMs
    );

    if (error) {
      throw error;
    }

    console.log(
      `Upserted ${i + 1}-${Math.min(i + batchSize, items.length)} of ${
        items.length
      }.`
    );
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
