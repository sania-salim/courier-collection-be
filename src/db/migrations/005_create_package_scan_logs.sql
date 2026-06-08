CREATE TABLE package_scan_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES packages(id) ON DELETE RESTRICT,
  region_id UUID NOT NULL REFERENCES regions(id) ON DELETE RESTRICT,
  status package_status NOT NULL,
  bag_id TEXT,
  notes TEXT,
  scanned_at TIMESTAMPTZ NOT NULL DEFAULT now()
);