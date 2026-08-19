-- Seed Service Categories
INSERT INTO public.categories (id, name, icon, active) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Plumbing', '🚰', true),
  ('22222222-2222-2222-2222-222222222222', 'Electrical', '⚡', true),
  ('33333333-3333-3333-3333-333333333333', 'Cleaning', '🧹', true),
  ('44444444-4444-4444-4444-444444444444', 'Appliances', '🔌', true),
  ('55555555-5555-5555-5555-555555555555', 'Painting', '🎨', true),
  ('66666666-6666-6666-6666-666666666666', 'Carpentry', '🪚', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, icon = EXCLUDED.icon;

-- Seed Sample Services
INSERT INTO public.services (id, category_id, name, description, base_price, est_duration_min) VALUES
  ('a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Tap Leak Repair', 'Fix leaking faucets, valves and pipe joint connections', 299.00, 45),
  ('a2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Drainage Unblocking', 'Clear clogged kitchen sinks, washbasins or bathroom drains', 499.00, 60),
  ('b1111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Ceiling Fan Installation', 'Assembly, wiring check and ceiling mount installation', 349.00, 45),
  ('b2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Switchboard Repair & Socket Replacement', 'Diagnose tripping circuit breakers, fix burnt sockets', 249.00, 30),
  ('c1111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'Full Home Deep Cleaning', 'Comprehensive deep cleaning of rooms, kitchen, and balcony', 1999.00, 240),
  ('c2222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'Sofa Shampooing & Vacuuming', 'Deep foam wash and extraction for 3 to 5 seater sofas', 799.00, 90),
  ('d1111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'AC Foam & Power Jet Service', 'Split or window AC filter, coil and tray jet wash', 599.00, 60)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, base_price = EXCLUDED.base_price;
