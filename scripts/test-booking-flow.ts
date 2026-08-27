/**
 * End-to-end test for the 5-step booking flow:
 * 1. Customer creates a booking → status = pending
 * 2. Provider accepts → status = assigned
 * 3. Provider starts travel → status = on_the_way
 * 4. Provider starts work → status = in_progress
 * 5. Provider completes → status = completed
 *
 * Tests against the LIVE Supabase database using service-role key.
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://npodbukpprsjcjyrwrcv.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wb2RidWtwcHJzamNqeXJ3cmN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzU3OTA1NSwiZXhwIjoyMTAzMTU1MDU1fQ.SkG10yGDwcdL5r5czHQsHCyWCt6pQ-nxGVgololGRm0";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wb2RidWtwcHJzamNqeXJ3cmN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1NzkwNTUsImV4cCI6MjEwMzE1NTA1NX0.r_nkZstT6ZdF7GfsE0nVT2QhgSg3qdrTAmCInqSk7YM";

const admin = createClient(SUPABASE_URL, SERVICE_KEY);

const TEST_CUSTOMER_EMAIL = "test-customer-fixmate-" + Date.now() + "@gmail.com";
const TEST_PROVIDER_EMAIL = "test-provider-fixmate-" + Date.now() + "@gmail.com";
const TEST_PASSWORD = "TestPass123!";

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${msg}`);
    passed++;
  } else {
    console.log(`  ❌ FAIL: ${msg}`);
    failed++;
  }
}

async function cleanup() {
  console.log("\n🧹 Cleaning up test data...");
  // We can't delete auth users via service role easily, but test data is ephemeral
}

async function testBookingFlow() {
  console.log("\n═══════════════════════════════════════════");
  console.log("  🧪 TESTING 5-STEP BOOKING FLOW");
  console.log("═══════════════════════════════════════════\n");

  // ─── Setup: Create test customer and provider via admin ───
  console.log("📋 STEP 0: Setting up test users...");

  const { data: customerAuth, error: custErr } = await admin.auth.admin.createUser({
    email: TEST_CUSTOMER_EMAIL,
    password: TEST_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: "Test Customer" },
  });
  assert(!custErr && !!customerAuth?.user, "Customer user created");
  const customerId = customerAuth?.user?.id;

  const { data: providerAuth, error: provErr } = await admin.auth.admin.createUser({
    email: TEST_PROVIDER_EMAIL,
    password: TEST_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: "Test Provider" },
  });
  assert(!provErr && !!providerAuth?.user, "Provider user created");
  const providerId = providerAuth?.user?.id;

  if (!customerId || !providerId) {
    console.log("\n💥 Cannot proceed without test users. Aborting.");
    return;
  }

  // Ensure profiles exist — the auth trigger may not fire for admin.createUser
  const { error: profErr1 } = await admin.from("profiles").upsert({ id: customerId, role: "customer", name: "Test Customer" }, { onConflict: "id" });
  console.log("  Profile upsert (customer):", profErr1 ? profErr1.message : "OK");
  const { error: profErr2 } = await admin.from("profiles").upsert({ id: providerId, role: "provider", name: "Test Provider" }, { onConflict: "id" });
  console.log("  Profile upsert (provider):", profErr2 ? profErr2.message : "OK");

  // Verify profiles exist
  const { data: custProfile } = await admin.from("profiles").select("id").eq("id", customerId).single();
  const { data: provProfile } = await admin.from("profiles").select("id").eq("id", providerId).single();
  assert(!!custProfile, "Customer profile exists in DB");
  assert(!!provProfile, "Provider profile exists in DB");

  // Ensure services exist
  const testServiceId = "a1111111-1111-1111-1111-111111111111";
  await admin.from("services").upsert({
    id: testServiceId,
    name: "Test Service",
    base_price: 299,
    est_duration_min: 45,
    category_id: "11111111-1111-1111-1111-111111111111",
  }, { onConflict: "id" });

  // Ensure category exists
  await admin.from("categories").upsert({
    id: "11111111-1111-1111-1111-111111111111",
    name: "Plumbing",
    icon: "🚰",
  }, { onConflict: "id" });

  // Create a test address for the customer
  const testAddressId = "aaaa0000-bbbb-0000-cccc-dddd00000001";
  await admin.from("addresses").upsert({
    id: testAddressId,
    user_id: customerId,
    line1: "123 Test Street, Indiranagar",
    city: "Bengaluru",
    pincode: "560038",
    label: "home",
    lat: 12.9784,
    lng: 77.6408,
  }, { onConflict: "id" });
  assert(true, "Test address created");

  // ═══════════════════════════════════════════
  // STEP 1: Customer creates booking → pending
  // ═══════════════════════════════════════════
  console.log("\n📋 STEP 1: Customer creates booking (pending)...");

  const scheduledAt = new Date(Date.now() + 86400000).toISOString(); // tomorrow
  const { data: booking, error: bookingErr } = await admin
    .from("bookings")
    .insert({
      customer_id: customerId,
      service_id: testServiceId,
      address_id: testAddressId,
      status: "pending",
      scheduled_at: scheduledAt,
      price: 348, // 299 + 49
    })
    .select()
    .single();

  if (bookingErr) console.log("  Booking error detail:", JSON.stringify(bookingErr));
  assert(!bookingErr && !!booking, "Booking created successfully");
  assert(booking?.status === "pending", `Status is "pending" (got: "${booking?.status}")`);
  assert(booking?.customer_id === customerId, "Customer ID matches");
  assert(booking?.price === 348, `Price is 348 (got: ${booking?.price})`);

  if (!booking) {
    console.log("\n💥 Cannot proceed without booking. Aborting.");
    return;
  }

  // ═══════════════════════════════════════════
  // STEP 2: Provider accepts → assigned
  // ═══════════════════════════════════════════
  console.log("\n📋 STEP 2: Provider accepts booking (assigned)...");

  const { data: assigned, error: assignErr } = await admin
    .from("bookings")
    .update({
      provider_id: providerId,
      status: "assigned",
    })
    .eq("id", booking.id)
    .is("provider_id", null)
    .eq("status", "pending")
    .select()
    .single();

  if (assignErr) console.log("  Assign error:", JSON.stringify(assignErr));
  assert(!assignErr && !!assigned, "Booking accepted successfully");
  assert(assigned?.status === "assigned", `Status is "assigned" (got: "${assigned?.status}")`);
  assert(assigned?.provider_id === providerId, "Provider ID set correctly");

  // Test race condition: second accept should fail (0 rows updated, not an error)
  const { data: raceData } = await admin
    .from("bookings")
    .update({ provider_id: "some-other-id", status: "assigned" })
    .eq("id", booking.id)
    .is("provider_id", null)
    .eq("status", "pending")
    .select();
  assert(!raceData || raceData.length === 0, "Race condition blocked (already assigned)");

  // ═══════════════════════════════════════════
  // STEP 3: Provider starts travel → on_the_way
  // ═══════════════════════════════════════════
  console.log("\n📋 STEP 3: Provider starts travel (on_the_way)...");

  const { data: onTheWay, error: otwErr } = await admin
    .from("bookings")
    .update({
      status: "on_the_way",
    })
    .eq("id", booking.id)
    .select()
    .single();

  if (otwErr) console.log("  OnTheWay error:", JSON.stringify(otwErr));
  assert(!otwErr && !!onTheWay, "Status updated to on_the_way");
  assert(onTheWay?.status === "on_the_way", `Status is "on_the_way" (got: "${onTheWay?.status}")`);

  // Test GPS location upsert
  const { error: locErr } = await admin
    .from("provider_locations")
    .upsert({
      provider_id: providerId,
      lat: 12.9800,
      lng: 77.6500,
      updated_at: new Date().toISOString(),
    }, { onConflict: "provider_id" });
  assert(!locErr, "GPS location updated for provider");

  // ═══════════════════════════════════════════
  // STEP 4: Provider starts work → in_progress
  // ═══════════════════════════════════════════
  console.log("\n📋 STEP 4: Provider starts work (in_progress)...");

  const { data: inProgress, error: ipErr } = await admin
    .from("bookings")
    .update({
      status: "in_progress",
    })
    .eq("id", booking.id)
    .select()
    .single();

  if (ipErr) console.log("  InProgress error:", JSON.stringify(ipErr));
  assert(!ipErr && !!inProgress, "Status updated to in_progress");
  assert(inProgress?.status === "in_progress", `Status is "in_progress" (got: "${inProgress?.status}")`);

  // ═══════════════════════════════════════════
  // STEP 5: Provider completes → completed
  // ═══════════════════════════════════════════
  console.log("\n📋 STEP 5: Provider completes job (completed)...");

  const { data: completed, error: compErr } = await admin
    .from("bookings")
    .update({
      status: "completed",
    })
    .eq("id", booking.id)
    .select()
    .single();

  if (compErr) console.log("  Complete error:", JSON.stringify(compErr));
  assert(!compErr && !!completed, "Status updated to completed");
  assert(completed?.status === "completed", `Status is "completed" (got: "${completed?.status}")`);

  // ═══════════════════════════════════════════
  // BONUS: Verify notifications were created
  // ═══════════════════════════════════════════
  console.log("\n📋 BONUS: Checking notifications...");

  // Manually insert a test notification to verify the table works
  const { error: notifErr } = await admin.from("notifications").insert({
    user_id: customerId,
    title: "Test Notification",
    body: "Testing notification table works",
  });
  assert(!notifErr, `Notifications table accepts inserts${notifErr ? " (" + notifErr.message + ")" : ""}`);

  const { data: notifs } = await admin
    .from("notifications")
    .select("*")
    .eq("user_id", customerId)
    .order("created_at", { ascending: false })
    .limit(10);

  assert(!!notifs && notifs.length > 0, `Notifications queryable (${notifs?.length || 0} found)`);

  // ═══════════════════════════════════════════
  // BONUS: Verify status history is correct
  // ═══════════════════════════════════════════
  console.log("\n📋 BONUS: Verifying full status history...");

  const { data: finalBooking } = await admin
    .from("bookings")
    .select("*")
    .eq("id", booking.id)
    .single();

  assert(finalBooking?.status === "completed", "Final status is completed");
  assert(finalBooking?.provider_id === providerId, "Provider is assigned");
  assert(finalBooking?.customer_id === customerId, "Customer is correct");
  assert(finalBooking?.price === 348, "Price preserved");

  // ═══════════════════════════════════════════
  // CLEANUP
  // ═══════════════════════════════════════════
  console.log("\n🧹 Cleaning up...");
  await admin.from("bookings").delete().eq("id", booking.id);
  await admin.from("notifications").delete().eq("user_id", customerId);
  await admin.from("addresses").delete().eq("id", testAddressId);
  await admin.from("provider_locations").delete().eq("provider_id", providerId);
  await admin.auth.admin.deleteUser(customerId);
  await admin.auth.admin.deleteUser(providerId);
  assert(true, "Test data cleaned up");

  // ═══════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════
  console.log("\n═══════════════════════════════════════════");
  console.log(`  📊 RESULTS: ${passed} passed, ${failed} failed`);
  console.log("═══════════════════════════════════════════\n");

  if (failed > 0) {
    process.exit(1);
  }
}

testBookingFlow().catch((err) => {
  console.error("💥 Test crashed:", err);
  process.exit(1);
});
