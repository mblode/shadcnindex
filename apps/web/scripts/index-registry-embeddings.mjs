import { readFile } from "node:fs/promises";
import path from "node:path";

import { openai } from "@ai-sdk/openai";
import { createClient } from "@supabase/supabase-js";
import { embedMany } from "ai";

const BATCH_SIZE = Number.parseInt(
  process.env.EMBEDDING_BATCH_SIZE ?? "100",
  10
);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!(supabaseUrl && supabaseServiceKey)) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
}

const indexPath = path.join(process.cwd(), "public", "registry-index.json");
const rawIndex = await readFile(indexPath, "utf8");
const parsed = JSON.parse(rawIndex);
const items = Array.isArray(parsed.items) ? parsed.items : [];

if (!items.length) {
  console.log("No registry items found in registry-index.json.");
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

const model = openai.embeddingModel("text-embedding-3-small");

const buildEmbeddingText = (item) => {
  const parts = [
    item.title ?? item.name ?? "",
    item.description ?? "",
    item.registry?.namespace ? `registry: ${item.registry.namespace}` : "",
    item.type ? `type: ${item.type}` : "",
    Array.isArray(item.tags) && item.tags.length > 0
      ? `tags: ${item.tags.join(", ")}`
      : "",
  ];

  return parts.filter(Boolean).join("\n");
};

for (let i = 0; i < items.length; i += BATCH_SIZE) {
  const batch = items.slice(i, i + BATCH_SIZE);
  const values = batch.map(buildEmbeddingText);

  const { embeddings } = await embedMany({ model, values });

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
  }));

  const { error } = await supabase
    .from("registry_components")
    .upsert(rows, { onConflict: "id" });

  if (error) {
    throw error;
  }

  console.log(
    `Upserted ${i + 1}-${Math.min(i + BATCH_SIZE, items.length)} of ${
      items.length
    }.`
  );
}
