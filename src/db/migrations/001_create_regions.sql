CREATE TABLE regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  parent_region_id UUID REFERENCES regions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);