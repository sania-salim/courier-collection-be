INSERT INTO front_offices (id, name, address, region_id, phone) VALUES
  ('b0000001-0000-4000-8000-000000000001', 'Northgate Collection Point', '12 Northgate Ave, North City',  'a0000001-0000-4000-8000-000000000001', '+1-555-0101'),
  ('b0000001-0000-4000-8000-000000000002', 'Southside Drop-off',       '88 Harbor Rd, South City',    'a0000001-0000-4000-8000-000000000002', '+1-555-0102'),
  ('b0000001-0000-4000-8000-000000000003', 'East End Hub',             '4 Market St, East City',      'a0000001-0000-4000-8000-000000000003', '+1-555-0103'),
  ('b0000001-0000-4000-8000-000000000004', 'West Park Office',         '201 West Park Blvd',          'a0000001-0000-4000-8000-000000000004', '+1-555-0104'),
  ('b0000001-0000-4000-8000-000000000005', 'Central Station Desk',     '1 Central Plaza',             'a0000001-0000-4000-8000-000000000005', '+1-555-0105')
ON CONFLICT (id) DO NOTHING;
