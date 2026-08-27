import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { phone, message } = await request.json();

    if (!phone || !message) {
      return NextResponse.json({ error: "Phone and message required" }, { status: 400 });
    }

    // ═══════════════════════════════════════
    // In production, integrate with:
    // - Twilio: twilio.com/sms
    // - MSG91: msg91.com
    // - Fast2SMS: fast2sms.com
    //
    // Example with Twilio:
    // const accountSid = process.env.TWILIO_ACCOUNT_SID;
    // const authToken = process.env.TWILIO_AUTH_TOKEN;
    // const client = require('twilio')(accountSid, authToken);
    // await client.messages.create({
    //   body: message,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   to: phone,
    // });
    // ═══════════════════════════════════════

    console.log(`📱 SMS to ${phone}: ${message}`);

    return NextResponse.json({ success: true, message: "SMS sent (logged in dev mode)" });
  } catch {
    return NextResponse.json({ error: "Failed to send SMS" }, { status: 500 });
  }
}
