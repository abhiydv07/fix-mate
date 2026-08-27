const LOGO_SVG = `<svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#2563eb"/><stop offset="100%" stop-color="#f59e0b"/></linearGradient></defs><rect width="100" height="100" rx="24" fill="url(#g)"/><rect x="22" y="24" width="12" height="52" rx="3" fill="white"/><rect x="22" y="24" width="36" height="12" rx="3" fill="white"/><rect x="22" y="42" width="26" height="10" rx="3" fill="white"/><rect x="48" y="24" width="10" height="52" rx="3" fill="white"/><rect x="72" y="24" width="10" height="52" rx="3" fill="white"/><path d="M48 24 L57 24 L63 42 L54 42 Z" fill="white"/><path d="M72 24 L80 24 L80 42 L66 42 L63 42 Z" fill="white" fill-rule="evenodd"/><rect x="48" y="64" width="34" height="12" rx="3" fill="white"/></svg>`;

interface EmailProps {
  type: "welcome" | "booking_confirmed" | "provider_assigned" | "booking_completed";
  customerName: string;
  serviceName?: string;
  providerName?: string;
  bookingDate?: string;
  bookingTime?: string;
  price?: string;
  address?: string;
  bookingId?: string;
}

export function getEmailHTML(props: EmailProps): string {
  const { type, customerName, serviceName, providerName, bookingDate, bookingTime, price, address, bookingId } = props;

  const subject =
    type === "welcome"
      ? "Welcome to Fix Mate! 🎉"
      : type === "booking_confirmed"
      ? `Booking Confirmed — ${serviceName}`
      : type === "provider_assigned"
      ? `${providerName} assigned to your booking`
      : `Booking completed — Rate your experience`;

  const body =
    type === "welcome"
      ? `<h2 style="margin:0 0 12px;font-size:22px;color:#0f172a;">Welcome to Fix Mate, ${customerName}! 👋</h2>
         <p style="margin:0 0 20px;font-size:14px;color:#64748b;line-height:1.6;">You&apos;ve joined India&apos;s most trusted home services platform. Book verified professionals for plumbing, electrical, cleaning, and 50+ services — pay only after the work is done.</p>
         <a href="https://fix-mate-git-main-abhiydv8.vercel.app/services" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#2563eb,#f59e0b);color:white;font-weight:700;font-size:14px;border-radius:12px;text-decoration:none;">Browse Services</a>`

      : type === "booking_confirmed"
      ? `<h2 style="margin:0 0 12px;font-size:22px;color:#0f172a;">Booking Confirmed ✅</h2>
         <p style="margin:0 0 16px;font-size:14px;color:#64748b;line-height:1.6;">Hi ${customerName}, your booking for <strong>${serviceName}</strong> has been confirmed.</p>
         <div style="background:#f8fafc;border-radius:12px;padding:20px;margin:0 0 20px;">
           <table style="width:100%;font-size:13px;color:#334155;">
             <tr><td style="padding:6px 0;color:#64748b;">Service</td><td style="padding:6px 0;font-weight:600;text-align:right;">${serviceName}</td></tr>
             <tr><td style="padding:6px 0;color:#64748b;">Date</td><td style="padding:6px 0;font-weight:600;text-align:right;">${bookingDate}</td></tr>
             <tr><td style="padding:6px 0;color:#64748b;">Time</td><td style="padding:6px 0;font-weight:600;text-align:right;">${bookingTime}</td></tr>
             <tr><td style="padding:6px 0;color:#64748b;">Address</td><td style="padding:6px 0;font-weight:600;text-align:right;">${address}</td></tr>
             <tr><td style="padding:6px 0;color:#64748b;border-top:1px solid #e2e8f0;">Total</td><td style="padding:6px 0;font-weight:700;text-align:right;border-top:1px solid #e2e8f0;color:#059669;">₹${price}</td></tr>
           </table>
         </div>
         <p style="margin:0;font-size:13px;color:#94a3b8;">Booking ID: ${bookingId}</p>`

      : type === "provider_assigned"
      ? `<h2 style="margin:0 0 12px;font-size:22px;color:#0f172a;">Pro Assigned 🔧</h2>
         <p style="margin:0 0 16px;font-size:14px;color:#64748b;line-height:1.6;">Hi ${customerName}, <strong>${providerName}</strong> has been assigned to your <strong>${serviceName}</strong> booking.</p>
         <div style="background:#f0fdf4;border-radius:12px;padding:16px;margin:0 0 20px;border:1px solid #bbf7d0;">
           <p style="margin:0;font-size:13px;color:#166534;font-weight:600;">✅ Provider verified & background checked</p>
         </div>
         <p style="margin:0 0 8px;font-size:13px;color:#64748b;">📅 ${bookingDate} at ${bookingTime}</p>
         <p style="margin:0;font-size:13px;color:#64748b;">📍 ${address}</p>`

      : `<h2 style="margin:0 0 12px;font-size:22px;color:#0f172a;">Booking Completed 🎉</h2>
         <p style="margin:0 0 16px;font-size:14px;color:#64748b;line-height:1.6;">Hi ${customerName}, your <strong>${serviceName}</strong> booking with <strong>${providerName}</strong> is complete.</p>
         <div style="background:#f8fafc;border-radius:12px;padding:20px;margin:0 0 20px;text-align:center;">
           <p style="margin:0 0 12px;font-size:14px;color:#0f172a;font-weight:600;">How was your experience?</p>
           <p style="margin:0 0 16px;font-size:24px;">⭐⭐⭐⭐⭐</p>
           <a href="https://fix-mate-git-main-abhiydv8.vercel.app/orders/${bookingId}" style="display:inline-block;padding:10px 24px;background:#2563eb;color:white;font-weight:700;font-size:13px;border-radius:10px;text-decoration:none;">Rate & Review</a>
         </div>
         <p style="margin:0;font-size:13px;color:#94a3b8;">Total: ₹${price} — Pay on Work</p>`;

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
        <!-- Logo -->
        <tr><td align="center" style="padding:0 0 32px;">
          ${LOGO_SVG}
          <p style="margin:8px 0 0;font-size:11px;font-weight:700;letter-spacing:0.15em;color:#94a3b8;text-transform:uppercase;">HOME SERVICES</p>
        </td></tr>
        <!-- Card -->
        <tr><td style="background:white;border-radius:20px;padding:36px 32px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
          ${body}
        </td></tr>
        <!-- Footer -->
        <tr><td align="center" style="padding:24px 0 0;">
          <p style="margin:0 0 8px;font-size:11px;color:#94a3b8;">Fix Mate — Pay on Work Home Services</p>
          <p style="margin:0;font-size:10px;color:#cbd5e1;">Noida & Greater Noida · support@fixmate.in</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
