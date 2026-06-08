CREATE TABLE front_offices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  region_id UUID NOT NULL REFERENCES regions(id) ON DELETE RESTRICT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);