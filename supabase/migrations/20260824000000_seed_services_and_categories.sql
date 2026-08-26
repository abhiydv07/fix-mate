-- Seed categories
INSERT INTO categories (id, name, icon) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Plumbing', '🚰'),
  ('22222222-2222-2222-2222-222222222222', 'Electrical', '⚡'),
  ('33333333-3333-3333-3333-333333333333', 'Cleaning', '🧹'),
  ('44444444-4444-4444-4444-444444444444', 'Appliances', '🔌'),
  ('55555555-5555-5555-5555-555555555555', 'Painting', '🎨'),
  ('66666666-6666-6666-6666-666666666666', 'Carpentry', '🪚')
ON CONFLICT (id) DO NOTHING;

-- Seed services
INSERT INTO services (id, category_id, name, description, base_price, est_duration_min) VALUES
  -- Plumbing
  ('a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Tap Leak Repair', 'Fix leaking faucets, main valves, and pipe joint connections with 30-day warranty.', 299, 45),
  ('a2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Drainage Unblocking', 'Clear clogged kitchen sinks, washbasins, or bathroom drains using pressure jet snake.', 499, 60),
  ('a3333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Toilet Repair', 'Fix running toilets, replace flush valves, repair fill mechanisms.', 399, 45),
  ('a4444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'Pipe Installation', 'Install new pipes, connectors, and water supply lines.', 699, 90),
  -- Electrical
  ('b1111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Ceiling Fan Installation', 'Assembly, regulator check, and secure ceiling hook mounting.', 349, 45),
  ('b2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Switch Board Repair', 'Fix loose wiring, replace damaged switches, troubleshoot short circuits.', 299, 30),
  ('b3333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'MCB & Distribution Board', 'Install or replace MCBs, RCCBs, and distribution boards.', 599, 60),
  -- Cleaning
  ('c1111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'Home Deep Cleaning', 'Complete home deep cleaning including kitchen, bathrooms, floors, and windows.', 1499, 240),
  ('c2222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'Sofa & Upholstery Cleaning', 'Steam cleaning for sofas, chairs, curtains, and mattresses.', 799, 90),
  ('c3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'Bathroom Deep Clean', 'Deep scrub tiles, remove hard water stains, clean fixtures.', 599, 60),
  ('c4444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333', 'Kitchen Deep Clean', 'Degrease chimney, clean cabinets, sanitize countertops.', 699, 90),
  -- Appliances
  ('d1111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'AC Repair & Service', 'Gas refill, compressor check, filter cleaning, complete AC servicing.', 899, 60),
  ('d2222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 'Washing Machine Repair', 'Fix drainage issues, drum problems, motor repairs.', 599, 45),
  ('d3333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 'Refrigerator Repair', 'Compressor repair, gas charging, thermostat replacement.', 799, 60),
  ('d4444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 'Microwave Repair', 'Fix heating issues, turntable problems, door repairs.', 499, 45),
  -- Painting
  ('e1111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', 'Interior Wall Painting', 'Complete interior wall painting with primer and 2 coats.', 2499, 480),
  ('e2222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', 'Exterior Wall Painting', 'Weather-resistant exterior painting for houses and buildings.', 3499, 600),
  -- Carpentry
  ('f1111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', 'Furniture Assembly', 'Assemble beds, wardrobes, tables, and shelves.', 499, 90),
  ('f2222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666666', 'Door & Window Repair', 'Fix hinges, locks, frames, and sliding mechanisms.', 399, 45),
  ('f3333333-3333-3333-3333-333333333333', '66666666-6666-6666-6666-666666666666', 'Shelf & Rack Installation', 'Install wall shelves, kitchen racks, bathroom organizers.', 349, 30)
ON CONFLICT (id) DO NOTHING;
