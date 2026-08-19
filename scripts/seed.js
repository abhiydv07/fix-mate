const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')) {
  console.log('⚠️ Supabase credentials missing or placeholder in .env.local. Skipping remote db insert.');
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const categories = [
  { id: '11111111-1111-1111-1111-111111111111', name: 'Plumbing', icon: '🚰', active: true },
  { id: '22222222-2222-2222-2222-222222222222', name: 'Electrical', icon: '⚡', active: true },
  { id: '33333333-3333-3333-3333-333333333333', name: 'Cleaning', icon: '🧹', active: true },
  { id: '44444444-4444-4444-4444-444444444444', name: 'Appliances', icon: '🔌', active: true },
  { id: '55555555-5555-5555-5555-555555555555', name: 'Painting', icon: '🎨', active: true },
  { id: '66666666-6666-6666-6666-666666666666', name: 'Carpentry', icon: '🪚', active: true },
];

const services = [
  {
    id: 'a1111111-1111-1111-1111-111111111111',
    category_id: '11111111-1111-1111-1111-111111111111',
    name: 'Tap Leak Repair',
    description: 'Fix leaking faucets, main valves, and pipe joint connections with 30-day warranty.',
    base_price: 299,
    est_duration_min: 45,
  },
  {
    id: 'a2222222-2222-2222-2222-222222222222',
    category_id: '11111111-1111-1111-1111-111111111111',
    name: 'Drainage Unblocking',
    description: 'Clear clogged kitchen sinks, washbasins, or bathroom drains using pressure jet snake.',
    base_price: 499,
    est_duration_min: 60,
  },
  {
    id: 'b1111111-1111-1111-1111-111111111111',
    category_id: '22222222-2222-2222-2222-222222222222',
    name: 'Ceiling Fan Installation',
    description: 'Assembly, regulator check, and secure ceiling hook mounting.',
    base_price: 349,
    est_duration_min: 45,
  },
  {
    id: 'b2222222-2222-2222-2222-222222222222',
    category_id: '22222222-2222-2222-2222-222222222222',
    name: 'Switchboard & Socket Replacement',
    description: 'Diagnose tripping circuit breakers, fix burnt modular sockets.',
    base_price: 249,
    est_duration_min: 30,
  },
  {
    id: 'c1111111-1111-1111-1111-111111111111',
    category_id: '33333333-3333-3333-3333-333333333333',
    name: 'Full Home Deep Cleaning',
    description: 'Comprehensive deep cleaning of 2BHK/3BHK rooms, kitchen, and balcony with eco-shampoo.',
    base_price: 1999,
    est_duration_min: 240,
  },
  {
    id: 'c2222222-2222-2222-2222-222222222222',
    category_id: '33333333-3333-3333-3333-333333333333',
    name: 'Sofa & Cushion Shampooing',
    description: 'Deep foam extraction and sanitization for 3 to 5 seater sofa sets.',
    base_price: 799,
    est_duration_min: 90,
  },
  {
    id: 'd1111111-1111-1111-1111-111111111111',
    category_id: '44444444-4444-4444-4444-444444444444',
    name: 'AC Foam & Power Jet Wash',
    description: 'Split or window AC filter, cooling coil, and drain tray high-pressure wash.',
    base_price: 599,
    est_duration_min: 60,
  },
];

async function seedDatabase() {
  console.log('🌱 Seeding Supabase database with categories and services...');
  
  const { error: catError } = await supabase.from('categories').upsert(categories, { onConflict: 'id' });
  if (catError) console.error('Error seeding categories:', catError.message);
  else console.log('✅ Categories seeded successfully.');

  const { error: servError } = await supabase.from('services').upsert(services, { onConflict: 'id' });
  if (servError) console.error('Error seeding services:', servError.message);
  else console.log('✅ Services seeded successfully.');

  console.log('🎉 Seeding completed!');
}

seedDatabase();
