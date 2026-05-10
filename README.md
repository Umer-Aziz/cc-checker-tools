# CC Checker /edu

An educational platform for learning how credit-card validation, BIN databases, and payment processing work under the hood. Built with Next.js 16 (App Router), TypeScript, and Tailwind CSS.

> **Educational use only.** Every tool on this platform uses synthetic or published test data. No real card numbers are processed, stored, or transmitted.

---

## What We Built

Six interactive tools that walk through the full lifecycle of a payment card — from how its number is structured, to how a payment processor decides whether to approve or decline it.

| # | Tool | Path | Description |
|---|------|------|-------------|
| 01 | **BIN Lookup** | `/bin-lookup` | Look up any 6-digit BIN/IIN to reveal the issuing bank, card network, country, and card tier |
| 02 | **Card Validator** | `/card-validator` | Validate a PAN with the Luhn checksum and see full issuer details |
| 03 | **Luhn Walkthrough** | `/luhn-walkthrough` | Step-by-step interactive breakdown of how the Luhn algorithm works |
| 04 | **CC Generator** | `/cc-generator` | Generate Luhn-valid synthetic card numbers for testing — by random network or specific BIN |
| 05 | **Pattern Analyzer** | `/pattern-analyzer` | Run fraud-detection rules over a synthetic transaction dataset |
| 06 | **Card Status Checker** | `/live-dead-checker` | Simulate a $0.01 authorization to determine if a card is LIVE (approved) or DEAD (declined) |

---

## Tech Stack

- **Framework** — Next.js 16 (App Router, TypeScript)
- **Styling** — Tailwind CSS v4 + custom CSS design system (warm ivory/navy editorial theme)
- **Fonts** — Instrument Serif · IBM Plex Sans · IBM Plex Mono (via `next/font/google`)
- **Runtime** — Node.js via Next.js API routes

---

## APIs Used

### HandyAPI — BIN Lookup
Used by the BIN Lookup tool and Card Validator to resolve a 6-digit BIN to real issuer data.

- **Endpoint** — `https://data.handyapi.com/bin/{bin}`
- **Auth** — `x-api-key` header
- **Env var** — `HANDY_API_KEY`
- **Sign up** — [handyapi.com](https://handyapi.com)
- **Free tier** — available

**What it returns:** bank name, card scheme (Visa/Mastercard/etc.), card type (Credit/Debit), card tier, country, Luhn validity.

---

### Stripe — Card Status Checker (optional, for live mode)
The Card Status Checker ships with a **simulation mode** active by default — no Stripe account needed. It recognises Stripe's published test card numbers and returns realistic LIVE/DEAD responses without making any real API calls.

To enable **real** Stripe processing:

1. Create a free Stripe account at [stripe.com](https://stripe.com)
2. Copy your **test secret key** (`sk_test_...`) from Stripe dashboard → Developers → API Keys
3. Add it to `.env.local`:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   ```
4. Install the Stripe SDK:
   ```bash
   npm install stripe
   ```
5. In `app/api/check-card-status/route.ts`, comment out the simulation block and uncomment the `/* ── LIVE IMPLEMENTATION (Stripe) ── */` block

**Test cards (work in simulation mode too):**

| Card Number | Network | Expected |
|-------------|---------|----------|
| `4242 4242 4242 4242` | Visa | LIVE ✓ |
| `4000 0000 0000 0002` | Visa | DEAD ✗ |
| `5555 5555 5555 4444` | Mastercard | LIVE ✓ |
| `3782 822463 10005` | Amex | LIVE ✓ |
| `6011 1111 1111 1117` | Discover | LIVE ✓ |
| Any generated card | Any | DEAD ✗ |

---

## How It Works

### Card Number Structure (ISO/IEC 7812)
```
4  2 4 2  4 2 4 2  4 2 4 2  4 2 4 2
│  └─────────────────────────┘     │
│   BIN (6 digits) + account #     │
└─────────────────── Check digit (Luhn)
```

- **Digit 1 (MII)** — Major Industry Identifier (4/5 = Banking & Financial)
- **Digits 1–6 (BIN/IIN)** — Issuer Identification Number → identifies bank + network
- **Digits 7–15** — Account number assigned by the issuer
- **Digit 16** — Check digit, computed via the Luhn algorithm

### The Luhn Algorithm
Every valid card number passes this checksum:
1. Starting from the rightmost digit, double every second digit
2. If doubling gives a two-digit result, subtract 9
3. Sum all digits
4. If total mod 10 = 0 → valid

The CC Generator appends a valid Luhn check digit to every synthetic PAN it produces.

### Card Status Checking (LIVE / DEAD)
In production, checking if a card is live works like this:
1. The PAN is tokenised and an authorization request is sent to the payment gateway
2. The gateway routes it through the card network (Visa/Mastercard rails)
3. The issuing bank responds with an approval code (LIVE) or a decline code (DEAD)
4. Specific decline codes (`insufficient_funds`, `do_not_honor`, `lost_card`, etc.) explain why

This platform simulates that flow using Stripe's published test cards, without touching a real payment network.

---

## Project Structure

```
cc-checker-tool/
├── app/
│   ├── api/
│   │   ├── check-bin/            # BIN lookup proxy → HandyAPI
│   │   ├── check-card-status/    # LIVE/DEAD checker (simulation + optional Stripe)
│   │   └── validate-card/        # Card validation endpoint
│   ├── bin-lookup/               # Tool 01 — BIN Lookup
│   ├── card-validator/           # Tool 02 — Card Validator
│   ├── luhn-walkthrough/         # Tool 03 — Luhn Walkthrough
│   ├── cc-generator/             # Tool 04 — CC Generator
│   ├── pattern-analyzer/         # Tool 05 — Pattern Analyzer
│   ├── live-dead-checker/        # Tool 06 — Card Status Checker
│   ├── globals.css               # Full design system
│   ├── layout.tsx                # Root layout + fonts + metadata
│   └── page.tsx                  # Landing page
├── components/
│   ├── Nav.tsx                   # Sticky nav with tools dropdown
│   ├── Footer.tsx
│   ├── Icon.tsx                  # SVG icon set
│   └── ...
├── .env.example                  # Template — copy to .env.local and fill in keys
└── .env.local                    # Your secret keys (never committed)
```

---

## Getting Started

### 1. Clone and install
```bash
git clone <repo-url>
cd cc-checker-tool
npm install
```

### 2. Configure environment variables
```bash
cp .env.example .env.local
# Open .env.local and fill in your API keys
```

### 3. Run the dev server
```bash
npm run dev
# Open http://localhost:3000
```

### 4. Build for production
```bash
npm run build
npm start
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `HANDY_API_KEY` | Yes | HandyAPI key for BIN/IIN lookups ([handyapi.com](https://handyapi.com)) |
| `RAPIDAPI_KEY` | Optional | RapidAPI key (backup BIN lookup) |
| `RAPIDAPI_HOST` | Optional | RapidAPI host for BIN checker |
| `STRIPE_SECRET_KEY` | Optional | Stripe test key — only needed to enable live Stripe mode |

Copy `.env.example` to `.env.local` and fill in the values. Never commit `.env.local`.

---

## Design System

Editorial-academic aesthetic: warm ivory, deep navy, muted gold.

```
--bg:       #F4F0E6   warm ivory (page background)
--ink:      #0F1B2D   deep navy  (primary text)
--accent:   #1A3A6B   mid navy   (links, highlights)
--gold:     #A1763A   muted gold (eyebrows, decorative)
--surface:  #FBF9F2   off-white  (card panels)
```

Typography: **Instrument Serif** (headings) · **IBM Plex Sans** (body) · **IBM Plex Mono** (data/code)

---

## Contact

Built by a solo developer. For project inquiries, collaboration, or if you have something in mind — reach out directly:

**Email:** umeraziz682@gmail.com

Whether it's a custom educational tool, a similar fintech platform, or any project you have in mind — happy to chat.
