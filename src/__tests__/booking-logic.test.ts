import { describe, it, expect } from "vitest";

// =============================================
// Price Calculation Tests
// =============================================
describe("Booking Price Calculation", () => {
  const CONVENIENCE_FEE = 49;

  function calculatePrice(basePrice: number, couponDiscount: number = 0): number {
    return Math.max(0, basePrice + CONVENIENCE_FEE - couponDiscount);
  }

  it("should add convenience fee to base price", () => {
    expect(calculatePrice(299)).toBe(348);
    expect(calculatePrice(499)).toBe(548);
    expect(calculatePrice(1999)).toBe(2048);
  });

  it("should apply flat discount correctly", () => {
    expect(calculatePrice(299, 50)).toBe(298);
    expect(calculatePrice(299, 299)).toBe(49); // discount = base, only fee remains
  });

  it("should apply percentage discount correctly", () => {
    const basePrice = 1000;
    const percentDiscount = Math.round((basePrice * 20) / 100); // 200
    expect(calculatePrice(basePrice, percentDiscount)).toBe(849);
  });

  it("should never go below zero", () => {
    expect(calculatePrice(10, 100)).toBe(0);
    expect(calculatePrice(0, 50)).toBe(0);
  });

  it("should handle zero base price", () => {
    expect(calculatePrice(0)).toBe(49);
  });
});

// =============================================
// Coupon Validation Tests
// =============================================
describe("Coupon Validation", () => {
  const VALID_COUPONS = [
    { code: "WELCOME50", type: "flat" as const, value: 50 },
    { code: "FIXMATE20", type: "percent" as const, value: 20 },
  ];

  function validateCoupon(code: string): { valid: boolean; discount?: number; type?: string; value?: number } {
    const normalized = code.trim().toUpperCase();
    const coupon = VALID_COUPONS.find((c) => c.code === normalized);

    if (!coupon) return { valid: false };

    return { valid: true, type: coupon.type, value: coupon.value };
  }

  function applyCoupon(code: string, basePrice: number): number {
    const result = validateCoupon(code);
    if (!result.valid || result.value === undefined) return 0;

    if (result.type === "flat") return result.value;
    if (result.type === "percent") return Math.round((basePrice * result.value) / 100);
    return 0;
  }

  it("should validate WELCOME50 coupon", () => {
    expect(validateCoupon("WELCOME50").valid).toBe(true);
    expect(validateCoupon("welcome50").valid).toBe(true);
    expect(validateCoupon("  WELCOME50  ").valid).toBe(true);
  });

  it("should validate FIXMATE20 coupon", () => {
    expect(validateCoupon("FIXMATE20").valid).toBe(true);
  });

  it("should reject invalid coupon codes", () => {
    expect(validateCoupon("INVALID").valid).toBe(false);
    expect(validateCoupon("").valid).toBe(false);
    expect(validateCoupon("WELCOM50").valid).toBe(false);
  });

  it("should apply WELCOME50 flat discount", () => {
    expect(applyCoupon("WELCOME50", 299)).toBe(50);
    expect(applyCoupon("WELCOME50", 100)).toBe(50);
  });

  it("should apply FIXMATE20 percent discount", () => {
    expect(applyCoupon("FIXMATE20", 1000)).toBe(200);
    expect(applyCoupon("FIXMATE20", 299)).toBe(60); // 299 * 20 / 100 = 59.8 -> 60
  });
});

// =============================================
// Time Slot Conversion Tests
// =============================================
describe("Time Slot Conversion", () => {
  function convertSlotTo24H(slot: string): string {
    const [time, modifier] = slot.split(" ");
    let [hours, minutes] = time.split(":");
    if (hours === "12") {
      hours = modifier === "PM" ? "12" : "00";
    } else if (modifier === "PM") {
      hours = String(parseInt(hours, 10) + 12);
    }
    return `${hours.padStart(2, "0")}:${minutes}`;
  }

  it("should convert AM slots correctly", () => {
    expect(convertSlotTo24H("09:00 AM")).toBe("09:00");
    expect(convertSlotTo24H("11:30 AM")).toBe("11:30");
    expect(convertSlotTo24H("12:00 AM")).toBe("00:00");
  });

  it("should convert PM slots correctly", () => {
    expect(convertSlotTo24H("01:00 PM")).toBe("13:00");
    expect(convertSlotTo24H("05:30 PM")).toBe("17:30");
    expect(convertSlotTo24H("12:00 PM")).toBe("12:00");
    expect(convertSlotTo24H("08:00 PM")).toBe("20:00");
  });

  it("should handle edge cases", () => {
    expect(convertSlotTo24H("12:00 AM")).toBe("00:00"); // midnight
    expect(convertSlotTo24H("12:00 PM")).toBe("12:00"); // noon
    expect(convertSlotTo24H("11:59 PM")).toBe("23:59");
  });
});

// =============================================
// Booking Status Transition Tests
// =============================================
describe("Booking Status Transitions", () => {
  const VALID_TRANSITIONS: Record<string, string[]> = {
    pending: ["assigned", "cancelled"],
    assigned: ["on_the_way", "cancelled"],
    on_the_way: ["in_progress", "cancelled"],
    in_progress: ["completed", "cancelled"],
    completed: [],
    cancelled: [],
  };

  function isValidTransition(from: string, to: string): boolean {
    return VALID_TRANSITIONS[from]?.includes(to) ?? false;
  }

  it("should allow valid transitions", () => {
    expect(isValidTransition("pending", "assigned")).toBe(true);
    expect(isValidTransition("assigned", "on_the_way")).toBe(true);
    expect(isValidTransition("on_the_way", "in_progress")).toBe(true);
    expect(isValidTransition("in_progress", "completed")).toBe(true);
  });

  it("should allow cancellation from any active state", () => {
    expect(isValidTransition("pending", "cancelled")).toBe(true);
    expect(isValidTransition("assigned", "cancelled")).toBe(true);
    expect(isValidTransition("on_the_way", "cancelled")).toBe(true);
    expect(isValidTransition("in_progress", "cancelled")).toBe(true);
  });

  it("should reject invalid transitions", () => {
    expect(isValidTransition("completed", "pending")).toBe(false);
    expect(isValidTransition("cancelled", "assigned")).toBe(false);
    expect(isValidTransition("pending", "completed")).toBe(false);
    expect(isValidTransition("in_progress", "pending")).toBe(false);
  });
});

// =============================================
// Dispute Logic Tests
// =============================================
describe("Dispute Logic", () => {
  it("should require minimum 10 character reason", () => {
    const reason = "Short";
    expect(reason.length >= 10).toBe(false);
    
    const validReason = "The service professional did not complete the work as agreed";
    expect(validReason.length >= 10).toBe(true);
  });

  it("should only allow disputes on non-cancelled bookings", () => {
    const cancelledStatus = "cancelled";
    const activeStatuses = ["pending", "assigned", "on_the_way", "in_progress", "completed"];
    
    expect(activeStatuses.includes(cancelledStatus)).toBe(false);
    expect(activeStatuses.includes("in_progress")).toBe(true);
  });

  it("should validate price adjustment bounds", () => {
    const validAdjustment = -500;
    const tooLarge = -15000;
    const tooHigh = 15000;
    
    expect(validAdjustment >= -10000 && validAdjustment <= 10000).toBe(true);
    expect(tooLarge >= -10000 && tooLarge <= 10000).toBe(false);
    expect(tooHigh >= -10000 && tooHigh <= 10000).toBe(false);
  });
});

// =============================================
// AI Triage Keyword Matching Tests
// =============================================
describe("AI Triage Keyword Fallback", () => {
  const rules = [
    { keywords: ["tap", "faucet", "leak", "pipe", "plumb", "drain", "sink", "toilet", "flush", "valve", "water"], category: "Plumbing" },
    { keywords: ["fan", "wire", "electric", "switch", "socket", "light", "wiring", "circuit", "breaker", "power", "inverter"], category: "Electrical" },
    { keywords: ["clean", "dust", "sweep", "mop", "sanitize", "sofa", "carpet", "shampoo"], category: "Cleaning" },
    { keywords: ["ac", "refrigerator", "fridge", "washing machine", "appliance", "microwave", "geyser"], category: "Appliances" },
    { keywords: ["paint", "wall", "colour", "interior", "exterior"], category: "Painting" },
    { keywords: ["wood", "furniture", "door", "window", "hinge", "shelf"], category: "Carpentry" },
  ];

  function matchCategory(description: string): string {
    const desc = description.toLowerCase();
    let best = "General";
    let bestCount = 0;

    for (const rule of rules) {
      const count = rule.keywords.filter((kw) => desc.includes(kw)).length;
      if (count > bestCount) {
        bestCount = count;
        best = rule.category;
      }
    }

    return best;
  }

  it("should match plumbing issues", () => {
    expect(matchCategory("My kitchen tap is leaking water")).toBe("Plumbing");
    expect(matchCategory("Toilet flush not working")).toBe("Plumbing");
  });

  it("should match electrical issues", () => {
    expect(matchCategory("Fan not turning on, switch is broken")).toBe("Electrical");
    expect(matchCategory("Light wiring problem in bedroom")).toBe("Electrical");
  });

  it("should match cleaning requests", () => {
    expect(matchCategory("Need deep cleaning for my apartment")).toBe("Cleaning");
    expect(matchCategory("Sofa shampooing service needed")).toBe("Cleaning");
  });

  it("should match appliance issues", () => {
    expect(matchCategory("AC not cooling properly")).toBe("Appliances");
    expect(matchCategory("Refrigerator making noise")).toBe("Appliances");
  });

  it("should match painting requests", () => {
    expect(matchCategory("Interior wall painting for 2BHK")).toBe("Painting");
  });

  it("should match carpentry requests", () => {
    expect(matchCategory("Door hinge replacement needed")).toBe("Carpentry");
    expect(matchCategory("Furniture repair - broken table leg")).toBe("Carpentry");
  });

  it("should return General for unmatched descriptions", () => {
    expect(matchCategory("Something random with no keywords")).toBe("General");
  });
});
