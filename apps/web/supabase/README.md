# Registry Semantic Search

This folder contains the SQL schema and indexing helper for the registry semantic search.

## Setup

1. Run `supabase/registry-search.sql` in your Supabase SQL editor.
2. Set environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY`
3. Generate embeddings and upsert rows:

```sh
node scripts/index-registry-embeddings.mjs
```

Optional tuning:
- `EMBEDDING_BATCH_SIZE` (default: 100)
