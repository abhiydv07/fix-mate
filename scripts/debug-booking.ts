import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://npodbukpprsjcjyrwrcv.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wb2RidWtwcHJzamNqeXJ3cmN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzU3OTA1NSwiZXhwIjoyMTAzMTU1MDU1fQ.SkG10yGDwcdL5r5czHQsHCyWCt6pQ-nxGVgololGRm0";

const admin = createClient(SUPABASE_URL, SERVICE_KEY);

async function debug() {
  // 1. Check bookings table columns
  const { data: cols, error: colsErr } = await admin.rpc('exec_sql', { query: "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'bookings' ORDER BY ordinal_position" }).maybeSingle();
  console.log("Bookings columns:", cols, colsErr);

  // Try raw query to see table structure
  const { data: tables } = await admin.from("bookings").select("*").limit(0);
  console.log("Bookings select (0 rows):", JSON.stringify(tables));

  // Try a simple insert and capture the full error
  const { data, error } = await admin.from("bookings").insert({
    customer_id: "00000000-0000-0000-0000-000000000001",
    service_id: "a1111111-1111-1111-1111-111111111111",
    address_id: "00000000-0000-0000-0000-000000000001",
    status: "pending",
    scheduled_at: new Date().toISOString(),
    price: 299,
  }).select().single();

  console.log("Insert result:", JSON.stringify(data));
  console.log("Insert error:", JSON.stringify(error));

  // Check if the issue is the columns
  const { data: cols2 } = await admin.from("information_schema.columns").select("column_name").eq("table_name", "bookings");
  console.log("information_schema query:", JSON.stringify(cols2));

  // Check if updated_at column exists
  const { data: cols3 } = await admin.from("information_schema.columns").select("column_name").eq("table_name", "bookings").eq("column_name", "updated_at");
  console.log("updated_at exists:", JSON.stringify(cols3));
}

debug();
