import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const cleanBin = String(body.bin ?? "")
    .replace(/\D/g, "")
    .slice(0, 6);

  if (cleanBin.length !== 6) {
    return NextResponse.json({ error: "BIN must be exactly 6 digits" }, { status: 400 });
  }

  const apiKey = process.env.HANDY_API_KEY;
  if (!apiKey || apiKey === "YOUR_HANDY_API_KEY_HERE") {
    return NextResponse.json({ error: "Server configuration error: API key not set" }, { status: 500 });
  }

  let upstreamRes: Response;
  try {
    upstreamRes = await fetch(`https://data.handyapi.com/bin/${cleanBin}`, {
      headers: { "x-api-key": apiKey },
    });
  } catch {
    return NextResponse.json({ error: "Failed to reach registry" }, { status: 502 });
  }

  if (upstreamRes.status === 404) {
    return NextResponse.json({ error: "BIN not found in registry" }, { status: 404 });
  }

  if (!upstreamRes.ok) {
    return NextResponse.json({ error: "Registry error" }, { status: 500 });
  }

  const d = await upstreamRes.json();

  if (d.Status !== "SUCCESS") {
    return NextResponse.json({ error: "BIN not found in registry" }, { status: 404 });
  }

  // Normalise capitalisation: "MASTERCARD" → "Mastercard"
  const toTitle = (s: string) =>
    s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "Unknown";

  const scheme: string = d.Scheme ?? "";
  const brand = toTitle(scheme);

  const NETWORK_LABELS: Record<string, string> = {
    MASTERCARD: "Mastercard Worldwide",
    VISA: "Visa Inc.",
    "AMERICAN EXPRESS": "American Express",
    DISCOVER: "Discover Network",
    "DINERS CLUB": "Diners Club International",
    JCB: "JCB Co., Ltd.",
    UNIONPAY: "UnionPay International",
    MAESTRO: "Maestro (Mastercard)",
  };
  const network = NETWORK_LABELS[scheme.toUpperCase()] ?? brand;

  const cardType = toTitle(d.Type ?? "Unknown");
  const category = d.CardTier
    ? d.CardTier.split(" ")
        .map((w: string) => toTitle(w))
        .join(" ")
    : "Standard";

  const issuer: string = d.Issuer ?? "Unknown";
  const bank = issuer
    .split(" ")
    .map((w: string) => toTitle(w))
    .join(" ");

  const country = d.Country?.Name ?? "Unknown";
  const countryCode: string = d.Country?.A2 ?? "—";
  const continent: string = d.Country?.Cont ?? "";

  const fact = `${bank} issues ${brand} ${cardType} cards (${category}) in ${country}${continent ? `, ${continent}` : ""}. Luhn valid: ${d.Luhn ? "yes" : "no"}.`;

  return NextResponse.json({
    success: true,
    bin: cleanBin,
    bank,
    brand,
    network,
    cardType,
    category,
    country,
    countryCode,
    continent,
    luhn: d.Luhn ?? null,
    institution: bank,
    website: "",
    headquarters: country,
    issued: "—",
    fact,
  });
}
