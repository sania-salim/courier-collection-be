CREATE TYPE package_status AS ENUM (
  'to_be_picked_up',
  'picked_up',
  'in_transit',
  'arrived',
  'delayed',
  'out_for_delivery',
  'delivered'
);

CREATE TABLE packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  front_office_id UUID NOT NULL REFERENCES front_offices(id) ON DELETE RESTRICT,
  to_name TEXT NOT NULL,
  to_address TEXT NOT NULL,
  to_region_id UUID NOT NULL REFERENCES regions(id) ON DELETE RESTRICT,
  weight NUMERIC(8, 2) NOT NULL CHECK (weight > 0),
  current_status package_status NOT NULL DEFAULT 'to_be_picked_up',
  current_region_id UUID NOT NULL REFERENCES regions(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);