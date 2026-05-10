import { NextRequest, NextResponse } from "next/server";

function validateLuhn(cardNumber: string) {
  let sum = 0;
  let even = false;

  for (let i = cardNumber.length - 1; i >= 0; i -= 1) {
    let digit = Number(cardNumber[i]);
    if (even) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    even = !even;
  }

  return sum % 10 === 0;
}

function extractMii(firstDigit: string) {
  const map: Record<string, string> = {
    "0": "ISO/IEC 7810",
    "1": "Airlines",
    "2": "Airlines and financial",
    "3": "Travel and entertainment",
    "4": "Banking and financial",
    "5": "Banking and financial",
    "6": "Merchandising and banking",
    "7": "Petroleum",
    "8": "Telecommunications",
    "9": "National assignment",
  };
  return map[firstDigit] ?? "Unknown";
}

function getCardType(cardNumber: string) {
  const patterns: Array<{ brand: string; type: string; regex: RegExp }> = [
    { brand: "Visa", type: "Credit Card", regex: /^4\d{15}$/ },
    { brand: "Mastercard", type: "Credit Card", regex: /^(5[1-5]\d{14}|2(2[2-9]\d{12}|[3-6]\d{13}|7([01]\d{12}|20\d{12})))$/ },
    { brand: "American Express", type: "Credit Card", regex: /^3[47]\d{13}$/ },
    { brand: "Discover", type: "Credit Card", regex: /^6(011\d{12}|5\d{14})$/ },
  ];

  for (const entry of patterns) {
    if (entry.regex.test(cardNumber)) return entry;
  }

  return { brand: "Unknown", type: "Unknown", regex: /.^/ };
}

function toTitle(value: string) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : "Unknown";
}

function normaliseIssuer(issuer: string) {
  return issuer
    .split(" ")
    .map((w) => toTitle(w))
    .join(" ");
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const clean = String(body.cardNumber ?? "").replace(/\D/g, "");

  if (!clean) {
    return NextResponse.json({ error: "Card number required" }, { status: 400 });
  }

  if (clean.length !== 16) {
    return NextResponse.json({ error: "Card number must be 16 digits" }, { status: 400 });
  }

  const luhnValid = validateLuhn(clean);
  const bin = clean.slice(0, 6);
  const mii = extractMii(clean[0]);
  const localType = getCardType(clean);

  const rapidApiKey = process.env.RAPIDAPI_KEY;
  const rapidApiHost = process.env.RAPIDAPI_HOST || "bin-ip-checker.p.rapidapi.com";
  const handyApiKey = process.env.HANDY_API_KEY;

  let rapidData: any = null;
  if (rapidApiKey) {
    try {
      const rapidRes = await fetch(`https://${rapidApiHost}/?bin=${bin}`, {
        headers: {
          "x-rapidapi-key": rapidApiKey,
          "x-rapidapi-host": rapidApiHost,
          "Content-Type": "application/json",
        },
      });
      if (rapidRes.ok) {
        const payload = await rapidRes.json();
        rapidData = payload?.BIN ?? null;
      }
    } catch {
      rapidData = null;
    }
  }

  let handyData: any = null;
  if (!rapidData && handyApiKey && handyApiKey !== "YOUR_HANDY_API_KEY_HERE") {
    try {
      const upstream = await fetch(`https://data.handyapi.com/bin/${bin}`, {
        headers: { "x-api-key": handyApiKey },
      });
      if (upstream.ok) {
        handyData = await upstream.json();
      }
    } catch {
      handyData = null;
    }
  }

  const scheme = rapidData?.scheme || handyData?.Scheme || "";
  const brand = scheme ? toTitle(String(scheme)) : localType.brand || "Unknown";
  const type = rapidData?.type
    ? toTitle(String(rapidData.type))
    : handyData?.Type
    ? toTitle(String(handyData.Type))
    : localType.type || "Unknown";

  const level = rapidData?.level
    ? String(rapidData.level)
    : handyData?.CardTier
    ? String(handyData.CardTier)
        .split(" ")
        .map((w: string) => toTitle(w))
        .join(" ")
    : "Standard";

  const category = handyData?.CardCategory ? toTitle(String(handyData.CardCategory)) : "Unknown";
  const prepaid = Boolean(
    rapidData?.is_prepaid === true ||
      rapidData?.is_prepaid === "true" ||
      handyData?.Prepaid === true
  );

  const bank = rapidData?.issuer?.name
    ? normaliseIssuer(String(rapidData.issuer.name))
    : handyData?.Issuer
    ? normaliseIssuer(String(handyData.Issuer))
    : "Unknown";

  const country = rapidData?.country?.name
    ? toTitle(String(rapidData.country.name))
    : rapidData?.country?.country
    ? toTitle(String(rapidData.country.country))
    : handyData?.Country?.Name ?? "Unknown";

  const phone = rapidData?.issuer?.phone || handyData?.IssuerPhone || "N/A";
  const website = rapidData?.issuer?.website || handyData?.IssuerWebsite || "N/A";
  const normaliseOptional = (value: string) => (value && value.trim().length > 0 ? value : "N/A");
  const city = handyData?.IssuerCity || "N/A";

  const safePhone = normaliseOptional(String(phone));
  const safeWebsite = normaliseOptional(String(website));

  return NextResponse.json({
    success: true,
    valid: luhnValid,
    luhnValid,
    checksumValid: luhnValid,
    cardNumber: clean,
    bin,
    mii,
    brand,
    type,
    level,
    category,
    prepaid,
    bank,
    country,
    phone: safePhone,
    website: safeWebsite,
    city,
  });
}
