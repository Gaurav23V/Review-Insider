create table if not exists sentiments (
  review_id uuid      references reviews(id) on delete cascade,
  score     integer   check (score between 1 and 5),
  summary   text,
  created_at timestamptz not null default now(),
  primary key (review_id)
);
