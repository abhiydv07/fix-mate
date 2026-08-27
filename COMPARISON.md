# Fix Mate vs Urban Company — Feature Comparison

## ✅ Fix Mate HAS (matches Urban Company)

| # | Feature | Fix Mate | Urban Company |
|---|---------|----------|---------------|
| 1 | Category browsing with icons | ✅ 8 categories | ✅ 15+ categories |
| 2 | Service listing with prices | ✅ DB-driven | ✅ DB-driven |
| 3 | Search bar in header | ✅ With suggestions | ✅ With autocomplete |
| 4 | Location selector | ✅ Noida/Greater Noida | ✅ City-wide |
| 5 | User signup/login | ✅ Email + Google OAuth | ✅ Phone OTP + Google |
| 6 | Provider signup/login | ✅ Separate flow | ✅ Separate flow |
| 7 | Booking wizard | ✅ Address → Date → Time → Confirm | ✅ Address → Date → Time → Confirm |
| 8 | Live GPS tracking | ✅ Leaflet + Supabase Realtime | ✅ Google Maps + Realtime |
| 9 | Order status tracking | ✅ 5-step progress | ✅ 5-step progress |
| 10 | Pay on Work (cash) | ✅ Zero upfront | ✅ Cash/UPI after work |
| 11 | Provider KYC verification | ✅ Document upload | ✅ Aadhaar + Video KYC |
| 12 | Admin dashboard | ✅ Analytics + charts | ✅ Full admin panel |
| 13 | Reviews & ratings | ✅ Star rating after booking | ✅ Star rating + photos |
| 14 | Notification system | ✅ Realtime in-app | ✅ Push + SMS + In-app |
| 15 | Dark mode | ✅ Toggle | ❌ Light only |
| 16 | Multi-language | ✅ English/Hindi | ✅ 5+ languages |
| 17 | PWA support | ✅ Manifest + Service Worker | ✅ Native apps |
| 18 | Category modal (UC style) | ✅ Subcategories popup | ✅ Subcategories popup |
| 19 | Service packages | ✅ Basic/Standard/Premium | ✅ Multiple packages |
| 20 | Wallet system | ✅ UI + UPI top-up | ✅ Full wallet |
| 21 | Referral program | ✅ Share link | ✅ Invite + earn credits |
| 22 | Dispute resolution | ✅ Flag + admin resolve | ✅ Full dispute flow |
| 23 | Invoice generation | ✅ PDF download | ✅ PDF download |
| 24 | Warranty claims | ✅ 30-day warranty | ✅ 30-day warranty |
| 25 | Before/after gallery | ✅ Service photos | ✅ Service photos |
| 26 | Blog/articles | ✅ Static content | ✅ Dynamic blog |
| 27 | WhatsApp integration | ✅ Floating button | ✅ Chat support |
| 28 | AI service triage | ✅ Gemini API | ❌ Not available |
| 29 | Social proof ticker | ✅ Live booking notifications | ✅ Similar |
| 30 | Animated homepage | ✅ Stats + categories | ✅ Hero + categories |

---

## ❌ Fix Mate MISSING (Urban Company has)

| # | Feature | Priority | Effort | Notes |
|---|---------|----------|--------|-------|
| 1 | **Phone OTP login** | 🔴 High | Medium | UC uses phone+OTP, not email. More trusted in India. |
| 2 | **Provider availability calendar** | 🔴 High | Medium | UC providers set weekly hours. Fix Mate has UI but no matching. |
| 3 | **Service photo gallery** | 🟡 Medium | Low | UC shows real photos per service. Fix Mate uses emoji only. |
| 4 | **Provider photo portfolio** | 🟡 Medium | Low | UC providers upload work photos. Fix Mate has none. |
| 5 | **Price breakdown** | 🟡 Medium | Low | UC shows base price + convenience fee + GST. Fix Mate shows total only. |
| 6 | **Estimated arrival time** | 🟡 Medium | Medium | UC shows "Arriving in 12 min". Fix Mate has no ETA. |
| 7 | **Service add-ons** | 🟡 Medium | Medium | UC lets you add extras (e.g., "includes window cleaning"). Fix Mate has packages but no add-ons. |
| 8 | **Multi-address booking** | 🟢 Low | Low | UC supports multiple addresses per booking. Fix Mate is single address. |
| 9 | **Booking history export** | 🟢 Low | Low | UC lets you download booking history. Fix Mate has none. |
| 10 | **Coupon/promo system** | 🟡 Medium | Medium | UC has dynamic coupons. Fix Mate has hardcoded codes only. |
| 11 | **Push notifications** | 🔴 High | High | UC has browser + mobile push. Fix Mate has in-app only. |
| 12 | **SMS notifications** | 🔴 High | High | UC sends booking updates via SMS. Fix Mate has none. |
| 13 | **Provider earnings dashboard** | 🟡 Medium | Medium | UC shows daily/weekly earnings. Fix Mate has basic dashboard. |
| 14 | **Service comparison** | 🟢 Low | Low | UC lets you compare services side-by-side. Fix Mate has page but no data. |
| 15 | **Recurring bookings** | 🟡 Medium | Medium | UC lets you schedule weekly/monthly. Fix Mate is one-time only. |
| 16 | **Emergency/urgent booking** | 🟡 Medium | Low | UC has "Instant" tier with 30-min arrival. Fix Mate has CTA but no instant flow. |
| 17 | **Provider chat with customer** | 🟡 Medium | Medium | UC has real-time chat. Fix Mate has chat panel but basic. |
| 18 | **Service warranty certificate** | 🟢 Low | Low | UC generates warranty PDF. Fix Mate has form but no certificate. |
| 19 | **Cancellation policy display** | 🟡 Medium | Low | UC shows "Free cancel before 2hrs". Fix Mate has no policy shown. |
| 20 | **Provider rating breakdown** | 🟢 Low | Low | UC shows ratings by category (punctuality, quality, etc.). Fix Mate has overall only. |

---

## 🏆 Fix Mate UNIQUE (Urban Company doesn't have)

| # | Feature | Description |
|---|---------|-------------|
| 1 | **AI Service Triage** | Describe problem → AI suggests category. UC doesn't have this. |
| 2 | **100% Pay on Work** | Zero upfront, cash-only. UC requires online payment upfront. |
| 3 | **Dispute resolution** | Customer flags booking → admin resolves. UC has support tickets only. |
| 4 | **Warranty claim flow** | 30-day warranty with structured claim form. UC has verbal guarantee. |
| 5 | **Dark mode** | Full dark theme. UC is light-only. |
| 6 | **Social proof ticker** | Live "Rahul just booked Plumbing" notifications. UC has none. |
| 7 | **Before/after gallery** | Service transformation photos. UC has none. |
| 8 | **Service packages** | Basic/Standard/Premium tiers. UC has single price per service. |

---

## 📊 Summary Score

| Category | Fix Mate | Urban Company |
|----------|----------|---------------|
| Core booking flow | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Provider experience | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Payment options | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| Notifications | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| UI/UX design | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Admin tools | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Unique features | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Overall** | **⭐⭐⭐½** | **⭐⭐⭐⭐⭐** |

---

## 🎯 Top 5 Things to Build Next

1. **Phone OTP login** — Most critical. Indian users trust phone numbers more than email.
2. **Push notifications** — Browser push for booking updates.
3. **SMS notifications** — Transactional SMS for booking confirmations.
4. **Price breakdown** — Show base price + fee + GST separately.
5. **Provider availability matching** — Filter bookings by provider's working hours.
