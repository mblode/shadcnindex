import { openai } from "@ai-sdk/openai";
import { embed } from "ai";

const EMBEDDING_MODEL = openai.embedding("text-embedding-3-small");

export async function embedSearchQuery(query: string) {
  const { embedding } = await embed({
    model: EMBEDDING_MODEL,
    value: query,
  });

  return embedding;
}
