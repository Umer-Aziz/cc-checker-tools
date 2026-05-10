import { NextRequest, NextResponse } from "next/server";

// ── LUHN VALIDATION ──────────────────────────────────────────────────────────
function validateLuhn(number: string): boolean {
  let sum = 0;
  let even = false;
  for (let i = number.length - 1; i >= 0; i--) {
    let d = Number(number[i]);
    if (even) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
    even = !even;
  }
  return sum % 10 === 0;
}

// ── NETWORK DETECTION ────────────────────────────────────────────────────────
function detectNetwork(pan: string): string {
  if (/^4/.test(pan)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(pan)) return "Mastercard";
  if (/^3[47]/.test(pan)) return "American Express";
  if (/^(6011|65)/.test(pan)) return "Discover";
  if (/^35/.test(pan)) return "JCB";
  if (/^(30|36|38)/.test(pan)) return "Diners Club";
  return "Unknown";
}

// ── SIMULATION DATA ───────────────────────────────────────────────────────────
// Stripe's published test card numbers — safe to hardcode for educational use.
// See: https://stripe.com/docs/testing#cards
const LIVE_CARDS = new Set([
  "4242424242424242",   // Visa
  "4000056655665556",   // Visa (debit)
  "5555555555554444",   // Mastercard
  "5200828282828210",   // Mastercard (debit)
  "5105105105105100",   // Mastercard
  "378282246310005",    // Amex
  "371449635398431",    // Amex
  "6011111111111117",   // Discover
  "6011000990139424",   // Discover
  "3056930009020004",   // Diners Club
  "36227206271667",     // Diners Club (14-digit)
  "3566002020360505",   // JCB
  "6200000000000005",   // UnionPay
]);

const BANK_MAP: Record<string, { bank: string; country: string; type: string }> = {
  "424242": { bank: "Chase Bank", country: "United States", type: "Credit" },
  "400005": { bank: "Chase Bank", country: "United States", type: "Debit" },
  "555555": { bank: "JPMorgan Chase", country: "United States", type: "Credit" },
  "520082": { bank: "TD Bank", country: "United States", type: "Debit" },
  "510510": { bank: "Citibank", country: "United States", type: "Credit" },
  "378282": { bank: "American Express", country: "United States", type: "Charge" },
  "371449": { bank: "American Express", country: "United States", type: "Charge" },
  "601111": { bank: "Discover Bank", country: "United States", type: "Credit" },
  "601100": { bank: "Discover Bank", country: "United States", type: "Credit" },
  "305693": { bank: "Diners Club International", country: "United States", type: "Charge" },
  "356600": { bank: "JCB International", country: "Japan", type: "Credit" },
  "620000": { bank: "UnionPay International", country: "China", type: "Credit" },
};

const DECLINE_REASONS = [
  { code: "insufficient_funds",  message: "Card declined — insufficient funds" },
  { code: "do_not_honor",        message: "Card declined — do not honor" },
  { code: "card_not_supported",  message: "Card not supported by this merchant" },
  { code: "expired_card",        message: "Card declined — reported as expired" },
  { code: "lost_card",           message: "Card declined — reported lost" },
  { code: "stolen_card",         message: "Card declined — reported stolen" },
  { code: "generic_decline",     message: "Card declined — generic decline" },
];

function getDeclineReason(pan: string) {
  const idx = Number(pan[pan.length - 1]) % DECLINE_REASONS.length;
  return DECLINE_REASONS[idx];
}

function simId(): string {
  return "sim_" + Math.random().toString(36).slice(2, 14).toUpperCase();
}

// ── ROUTE HANDLER ────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  const rawCard = String(body.cardNumber ?? "").replace(/\D/g, "");
  const expiryDate = String(body.expiryDate ?? "");
  const cvv = String(body.cvv ?? "").replace(/\D/g, "");

  // Length: 14-digit Diners, 15-digit Amex, 16-digit everything else
  if (rawCard.length < 14 || rawCard.length > 16) {
    return NextResponse.json({ error: "Card number must be 14–16 digits" }, { status: 400 });
  }

  if (!validateLuhn(rawCard)) {
    return NextResponse.json({ error: "Card fails Luhn validation" }, { status: 400 });
  }

  const expiryMatch = expiryDate.match(/^(\d{2})\/(\d{2})$/);
  if (!expiryMatch) {
    return NextResponse.json({ error: "Expiry must be MM/YY" }, { status: 400 });
  }
  const expMonth = parseInt(expiryMatch[1]);
  const expYear = 2000 + parseInt(expiryMatch[2]);
  if (expMonth < 1 || expMonth > 12) {
    return NextResponse.json({ error: "Invalid expiry month" }, { status: 400 });
  }
  const now = new Date();
  if (
    expYear < now.getFullYear() ||
    (expYear === now.getFullYear() && expMonth < now.getMonth() + 1)
  ) {
    return NextResponse.json({ error: "Card is expired" }, { status: 400 });
  }

  if (cvv.length < 3 || cvv.length > 4) {
    return NextResponse.json({ error: "CVV must be 3 or 4 digits" }, { status: 400 });
  }

  // ── SIMULATION MODE (active) ───────────────────────────────────────────────
  // Recognises Stripe's published test card numbers as LIVE.
  // All other Luhn-valid cards are DEAD with a realistic decline code.

  const bin = rawCard.slice(0, 6);
  const network = detectNetwork(rawCard);
  const bankInfo = BANK_MAP[bin] ?? { bank: "Unknown Bank", country: "Unknown", type: "Credit" };
  const isLive = LIVE_CARDS.has(rawCard);
  const timestamp = new Date().toISOString();

  if (isLive) {
    return NextResponse.json({
      success: true,
      status: "LIVE",
      cardNumber: rawCard,
      bin,
      bank: bankInfo.bank,
      country: bankInfo.country,
      network,
      type: bankInfo.type,
      transactionId: simId(),
      responseCode: "approved",
      message: "Transaction approved — card is active",
      timestamp,
    });
  }

  const decline = getDeclineReason(rawCard);
  return NextResponse.json({
    success: true,
    status: "DEAD",
    cardNumber: rawCard,
    bin,
    bank: bankInfo.bank,
    country: bankInfo.country,
    network,
    type: bankInfo.type,
    transactionId: simId(),
    responseCode: decline.code,
    message: decline.message,
    timestamp,
  });

  /* ── LIVE IMPLEMENTATION (Stripe) ─────────────────────────────────────────
     To enable real Stripe processing:
       1. npm install stripe
       2. Add  STRIPE_SECRET_KEY=sk_test_...  to .env.local
       3. Comment out the simulation block above (from "SIMULATION MODE" to here)
       4. Uncomment this entire block

  import Stripe from "stripe";
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  try {
    const paymentMethod = await stripe.paymentMethods.create({
      type: "card",
      card: {
        number: rawCard,
        exp_month: expMonth,
        exp_year: expYear,
        cvc: cvv,
      },
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1,          // $0.01 in cents
      currency: "usd",
      payment_method: paymentMethod.id,
      confirm: true,
      return_url: "https://example.com",
      description: "CC Checker /edu — educational card status check",
    });

    const isApproved = paymentIntent.status === "succeeded";
    const bin = rawCard.slice(0, 6);
    const network = detectNetwork(rawCard);

    return NextResponse.json({
      success: true,
      status: isApproved ? "LIVE" : "DEAD",
      cardNumber: rawCard,
      bin,
      bank: (paymentMethod.card as { issuer?: string })?.issuer ?? "Unknown",
      country: paymentMethod.card?.country ?? "Unknown",
      network: paymentMethod.card?.brand ?? network,
      type: paymentMethod.card?.funding ?? "credit",
      transactionId: paymentIntent.id,
      responseCode: isApproved ? "approved" : "declined",
      message: isApproved
        ? "Transaction approved — card is active"
        : "Card declined by issuing bank",
      timestamp: new Date().toISOString(),
    });

  } catch (err: unknown) {
    // StripeCardError means the card was declined — still a valid DEAD result
    if (
      err !== null &&
      typeof err === "object" &&
      "type" in err &&
      (err as { type: string }).type === "StripeCardError"
    ) {
      const stripeErr = err as { code?: string; message: string };
      const bin = rawCard.slice(0, 6);
      const network = detectNetwork(rawCard);
      return NextResponse.json({
        success: true,
        status: "DEAD",
        cardNumber: rawCard,
        bin,
        bank: "Unknown",
        country: "Unknown",
        network,
        type: "credit",
        transactionId: "N/A",
        responseCode: stripeErr.code ?? "card_declined",
        message: stripeErr.message,
        timestamp: new Date().toISOString(),
      });
    }
    console.error("Stripe error:", err);
    return NextResponse.json({ error: "Payment processor error" }, { status: 500 });
  }
  ─────────────────────────────────────────────────────────────────────────── */
}
