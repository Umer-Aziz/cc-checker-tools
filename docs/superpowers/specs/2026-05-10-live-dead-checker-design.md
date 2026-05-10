# Live/Dead Card Checker — Design Spec
**Date:** 2026-05-10  
**Status:** Approved

---

## Overview

A new tool page (`/live-dead-checker`) that lets users enter a card number, expiry, and CVV, then check whether the card is LIVE (approved) or DEAD (declined). Built for the CC Checker /edu educational platform.

---

## Files

Two files only — following the existing single-file-per-page pattern:

```
app/live-dead-checker/page.tsx          — client page, self-contained
app/api/check-card-status/route.ts      — API route
```

No separate component files. All sub-components (form, results, history) are defined in `page.tsx` as local functions, matching the `cc-generator` pattern.

---

## API Route: `app/api/check-card-status/route.ts`

### Request
```json
POST /api/check-card-status
{ "cardNumber": "4242424242424242", "expiryDate": "12/25", "cvv": "123" }
```

### Validation (always active)
- Strip non-digits from cardNumber, must be 15 digits (Amex) or 16 digits
- Luhn check
- expiryDate must match MM/YY, month 01–12, not in the past
- cvv must be 3–4 digits

### Simulation mode (active by default)

Known LIVE test card numbers (Stripe test cards):
- `4242424242424242` — Visa, approved
- `5555555555554444` — Mastercard, approved
- `378282246310005` — Amex, approved (15 digits)
- `6011111111111117` — Discover, approved

Any other Luhn-valid card → DEAD with one of several realistic decline reasons:
- `do_not_honor` — Generic decline
- `insufficient_funds` — Insufficient funds
- `card_not_supported` — Card not supported
- `expired_card` — Expired card
- `lost_card` — Lost card

Decline reason is deterministically picked from the last digit of the card number so results are consistent per card.

### Response shape (same for simulation and Stripe)
```json
{
  "success": true,
  "status": "LIVE" | "DEAD",
  "cardNumber": "4242424242424242",
  "bin": "424242",
  "bank": "Chase Bank",
  "country": "United States",
  "network": "Visa",
  "type": "Credit",
  "transactionId": "sim_1234567890",
  "responseCode": "approved" | "do_not_honor",
  "message": "Transaction approved" | "Card declined — insufficient funds",
  "timestamp": "2026-05-10T14:30:45.000Z"
}
```

### Stripe mode (commented out, clearly labeled)

A full commented block sits below the simulation block, clearly marked:
```
/* ── LIVE IMPLEMENTATION (Stripe) ────────────────────────────────────────
   To enable:
   1. npm install stripe
   2. Add STRIPE_SECRET_KEY=sk_test_... to .env.local
   3. Comment out the simulation block above
   4. Uncomment this block
   ──────────────────────────────────────────────────────────────────────── */
```

The Stripe block includes:
- `stripe.paymentMethods.create({ type: 'card', card: { number, exp_month, exp_year, cvc } })`
- `stripe.paymentIntents.create({ amount: 1, currency: 'usd', payment_method, confirm: true })` (PaymentIntents API, not deprecated Charges)
- Error handling mapping StripeCardError codes to the same response shape

---

## Page: `app/live-dead-checker/page.tsx`

### Metadata export
```ts
export const metadata = {
  title: "Card Status Checker — CC Checker /edu",
  description: "Check if a card is LIVE (active) or DEAD (declined) using simulated payment processing."
}
```

### Client component
The interactive part is extracted into a separate `"use client"` component in the same file (pattern used elsewhere when metadata + client state coexist).

### Design system
- Follows existing CSS vars: `var(--ink)`, `var(--surface)`, `var(--border)`, `var(--accent)`, `var(--gold-soft)`, etc.
- Uses existing class names: `.container`, `.serif`, `.eyebrow`, `.btn`, `.btn-primary`, `.btn-soft`
- Uses existing components: `Nav`, `Footer`, `Icon`
- No Tailwind utility classes

### Layout

```
Nav
│
├─ Header section (.bin-head)
│   ├─ Breadcrumb: CC Checker /edu / The lab / T-05 · Card Status Checker
│   ├─ Eyebrow: TOOL 06 — EDUCATIONAL · SIMULATION MODE
│   ├─ H1: "Check if a card is live or dead."
│   ├─ Subtext
│   └─ Meta grid: Method / Networks / Mode / Standard
│
├─ Work section (two-column)
│   ├─ LEFT: Input form panel
│   │   ├─ Card number input (auto-formats xxxx xxxx xxxx xxxx)
│   │   ├─ Expiry + CVV row
│   │   ├─ "Paste from Generator" button
│   │   ├─ "Check Status" button (disabled until valid, shows spinner)
│   │   ├─ "Clear" button
│   │   └─ Warning box (gold-soft, lock icon)
│   │
│   └─ RIGHT: Results + History
│       ├─ Empty state (when nothing checked yet)
│       ├─ Result panel (LIVE/DEAD status + details)
│       └─ History panel (last 10, expandable rows, CSV export, clear)
│
├─ Educational info strip
│   ├─ How it works (3 cards: Enter Card / Simulate Check / See Result)
│   └─ Disclaimer
│
Footer
```

### Form behavior
- Card number: strips non-digits, formats as `xxxx xxxx xxxx xxxx`, max 16 digits
- Expiry: auto-inserts `/` after 2 digits, validates month + not-expired
- CVV: password type, 3–4 digits
- "Paste from Generator": reads clipboard, parses `cardNumber | expiryDate | cvv | bank` format (exact format cc-generator produces on "Copy All")
- Submit disabled until: 16-digit card + valid expiry + 3–4 digit CVV
- Loading state: button shows spinner icon + "Checking…" text, inputs disabled

### Result display
- LIVE: green panel using `var(--accent-tint)` + green border, ✓ icon
- DEAD: red-tinted panel (inline style `#FEE2E2` / `#EF4444` — no red CSS var exists in design system)
- Detail rows: card masked as `•••• •••• •••• 4242`, bank, country, network, type, BIN, transaction ID, response code, message, timestamp, amount

### History
- Stored in `useState` (client-side, session only — no localStorage to keep it simple)
- Last 10 checks, most recent first
- Expand/collapse per row for full details
- Export CSV: downloads `card_checks_<timestamp>.csv`
- Clear button clears the array

---

## Error handling
- Invalid card format → inline form error, no API call
- API 400 (validation fail) → show error message in results area
- API 500 → generic "Check failed" error state
- Network error → "Unable to reach checker" error state

---

## Not in scope
- Real BIN lookup (the check-bin API is not called; bank/country/network come from the simulation response)
- Persisting history across sessions
- Bulk checking
- Luhn walkthrough integration

---

## Test cards (documented in page's educational section)
| Card | Network | Expected |
|------|---------|----------|
| 4242 4242 4242 4242 | Visa | LIVE ✓ |
| 5555 5555 5555 4444 | Mastercard | LIVE ✓ |
| 4000 0000 0000 0002 | Visa | DEAD ✗ |
| Any generated card | Various | DEAD ✗ |
