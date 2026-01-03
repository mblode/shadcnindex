-- Registry semantic search schema for Supabase + pgvector.
-- Update the vector dimension if you change the embedding model.

create extension if not exists vector;

create table if not exists registry_components (
  id text primary key,
  registry_namespace text not null,
  registry_homepage text,
  name text not null,
  title text,
  description text,
  type text,
  tags text[] not null default '{}',
  files jsonb not null default '[]',
  embedding vector(1536) not null,
  updated_at timestamp with time zone not null default now()
);

create index if not exists registry_components_embedding_hnsw
  on registry_components using hnsw (embedding vector_cosine_ops);

create or replace function match_registry_components(
  query_embedding vector(1536),
  match_count int,
  match_threshold float8
)
returns table (
  id text,
  registry_namespace text,
  registry_homepage text,
  name text,
  title text,
  description text,
  type text,
  tags text[],
  files jsonb,
  similarity float8
)
language sql stable as $$
  select
    registry_components.id,
    registry_components.registry_namespace,
    registry_components.registry_homepage,
    registry_components.name,
    registry_components.title,
    registry_components.description,
    registry_components.type,
    registry_components.tags,
    registry_components.files,
    1 - (registry_components.embedding <=> query_embedding) as similarity
  from registry_components
  where (registry_components.embedding <=> query_embedding) < match_threshold
  order by registry_components.embedding <=> query_embedding
  limit match_count;
$$;
