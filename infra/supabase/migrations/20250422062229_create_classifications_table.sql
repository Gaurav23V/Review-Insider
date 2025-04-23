create table if not exists classifications (
  review_id uuid      references reviews(id) on delete cascade,
  label     text      not null,
  created_at timestamptz not null default now(),
  primary key (review_id)
);
