create table if not exists embeddings (
  review_id uuid      references reviews(id) on delete cascade,
  vector    vector(768),  -- adjust dimension to Gemini’s embedding size
  service   text,
  location  text,
  product   text,
  created_at timestamptz not null default now(),
  primary key (review_id)
);
