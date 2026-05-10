"use client";

import { useEffect, useMemo, useState, type MouseEvent } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

interface ValidationResult {
  success: boolean;
  valid: boolean;
  luhnValid: boolean;
  checksumValid: boolean;
  cardNumber: string;
  bin: string;
  mii: string;
  brand: string;
  type: string;
  level: string;
  category: string;
  prepaid: boolean;
  bank: string;
  country: string;
  phone: string;
  website: string;
  city: string;
}

const SAMPLE_NUMBERS = [
  "4242424242424242",
  "5555555555554444",
  "4000056655665556",
];

function formatCardNumber(value: string) {
  return value.replace(/(\d{4})(?=\d)/g, "$1 ");
}

function maskCardNumber(value: string) {
  if (!value) return "**** **** **** ****";
  return `**** **** **** ${value.slice(-4)}`;
}

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

function getMii(firstDigit: string) {
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
  const patterns: Array<{ brand: string; regex: RegExp }> = [
    { brand: "Visa", regex: /^4\d{15}$/ },
    { brand: "Mastercard", regex: /^(5[1-5]\d{14}|2(2[2-9]\d{12}|[3-6]\d{13}|7([01]\d{12}|20\d{12})))$/ },
    { brand: "American Express", regex: /^3[47]\d{13}$/ },
    { brand: "Discover", regex: /^6(011\d{12}|5\d{14})$/ },
  ];

  for (const entry of patterns) {
    if (entry.regex.test(cardNumber)) {
      return entry.brand;
    }
  }

  return "Unknown";
}

function buildLocalResult(cardNumber: string): ValidationResult {
  const luhnValid = validateLuhn(cardNumber);
  const brand = getCardType(cardNumber);

  return {
    success: true,
    valid: luhnValid,
    luhnValid,
    checksumValid: luhnValid,
    cardNumber,
    bin: cardNumber.slice(0, 6),
    mii: getMii(cardNumber[0]),
    brand,
    type: brand === "Unknown" ? "Unknown" : "Credit Card",
    level: "Standard",
    category: "Unknown",
    prepaid: false,
    bank: "Unknown",
    country: "Unknown",
    phone: "N/A",
    website: "N/A",
    city: "N/A",
  };
}

export default function CardValidatorPage() {
  const [cardNumber, setCardNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [error, setError] = useState("");

  const formattedNumber = useMemo(() => formatCardNumber(cardNumber), [cardNumber]);
  const maskedNumber = useMemo(() => maskCardNumber(cardNumber), [cardNumber]);
  const luhnValid = useMemo(() => (cardNumber.length === 16 ? validateLuhn(cardNumber) : false), [cardNumber]);
  const inputState = cardNumber.length === 0 ? "empty" : cardNumber.length < 16 ? "partial" : luhnValid ? "valid" : "invalid";
  const isComplete = cardNumber.length === 16;
  const luhnState = !isComplete ? "Awaiting" : luhnValid ? "Passed" : "Failed";

  useEffect(() => {
    if (cardNumber.length !== 16) {
      setResult(null);
      setError("");
      return;
    }

    const localResult = buildLocalResult(cardNumber);
    setResult(localResult);

    let isCurrent = true;
    const validate = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/validate-card", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cardNumber }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || "Validation failed");
        }
        if (isCurrent) setResult(data as ValidationResult);
      } catch (err) {
        if (isCurrent) {
          setResult(localResult);
          setError(err instanceof Error ? err.message : "Validation failed");
        }
      } finally {
        if (isCurrent) setLoading(false);
      }
    };

    validate();
    return () => {
      isCurrent = false;
    };
  }, [cardNumber]);

  const onChangeNumber = (value: string) => {
    const clean = value.replace(/\D/g, "").slice(0, 16);
    setCardNumber(clean);
  };

  const onClear = () => {
    setCardNumber("");
    setResult(null);
    setError("");
  };

  const onCopy = () => {
    if (!result) return;
    const payload = {
      cardNumber: maskCardNumber(result.cardNumber),
      valid: result.valid,
      luhnValid: result.luhnValid,
      checksumValid: result.checksumValid,
      bin: result.bin,
      mii: result.mii,
      brand: result.brand,
      type: result.type,
      level: result.level,
      category: result.category,
      prepaid: result.prepaid,
      bank: result.bank,
      country: result.country,
      phone: result.phone,
      website: result.website,
      city: result.city,
    };
    navigator.clipboard?.writeText(JSON.stringify(payload, null, 2));
  };

  const onShare = async () => {
    if (!result) return;
    const text = `Card ${maskCardNumber(result.cardNumber)} - ${result.valid ? "Valid" : "Invalid"} - ${result.brand}`;
    if (navigator.share) {
      await navigator.share({ title: "Card Validator", text });
      return;
    }
    navigator.clipboard?.writeText(text);
  };

  const cardBrand = result?.brand || getCardType(cardNumber);

  return (
    <div className="cv-page">
      <Nav />

      <main>
        <section className="bin-head">
          <div className="container">
            <nav className="bin-crumb" aria-label="Breadcrumb">
              <Link href="/">CC Checker /edu</Link>
              <span className="sep">/</span>
              <Link href="/#tools">The lab</Link>
              <span className="sep">/</span>
              <span className="cur">T-02 · Card Validator</span>
            </nav>
            <div className="bin-title-row">
              <div>
                <div className="bin-title-label">TOOL 02 — EDUCATIONAL · SAMPLE DATA ONLY</div>
                <h1 className="bin-title serif">
                  Validate a <em>PAN</em> with the Luhn checksum.
                </h1>
                <p className="bin-sub">
                  Enter a 16-digit card number to verify the checksum, reveal issuer details, and
                  understand how networks identify card structure without storing a real PAN.
                </p>
              </div>
              <div className="bin-meta">
                <div><strong>Standard</strong> — ISO/IEC 7812</div>
                <div><strong>Method</strong> — Luhn checksum</div>
                <div><strong>Masking</strong> — PAN never stored</div>
              </div>
            </div>
          </div>
        </section>

        <section className="cv-main">
          <div className="container cv-grid">
            <div className="cv-left">
              <div className="cv-card">
                <div className="cv-card-head">
                  <div>
                    <h2 className="cv-section-title serif">Card Number</h2>
                    <p className="cv-section-sub">Educational use only. Do not enter a real PAN.</p>
                  </div>
                  <div className={`cv-state ${inputState}`}>{inputState === "valid" ? "Valid" : inputState === "invalid" ? "Invalid" : inputState === "partial" ? "Typing" : "Idle"}</div>
                </div>

                <label className="cv-label" htmlFor="card-number">Card number</label>
                <div className={`cv-input-wrap ${inputState}`}>
                  <input
                    id="card-number"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="1234 5678 9012 3456"
                    value={formattedNumber}
                    onChange={(e) => onChangeNumber(e.target.value)}
                    aria-describedby="card-number-help"
                    aria-invalid={inputState === "invalid"}
                  />
                  <div className="cv-input-icon" aria-hidden="true">
                    {inputState === "valid" ? "OK" : inputState === "invalid" ? "NO" : inputState === "partial" ? ".." : ""}
                  </div>
                </div>
                <div className="cv-help" id="card-number-help">
                  <span>16 digits only, auto-formatted.</span>
                  <span className={inputState === "valid" ? "ok" : ""}>{cardNumber.length}/16</span>
                </div>

                <div className="cv-samples">
                  <span>Try samples</span>
                  <div className="cv-sample-chips">
                    {SAMPLE_NUMBERS.map((sample) => (
                      <button key={sample} type="button" className="cv-sample-chip" onClick={() => onChangeNumber(sample)}>
                        {formatCardNumber(sample)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className={`cv-status ${result?.valid ? "ok" : result ? "bad" : ""}`}>
                <div className="cv-status-icon">{result ? (result.valid ? "OK" : "NO") : "--"}</div>
                <div>
                  <h3>{result ? (result.valid ? "Card number is valid" : "Card number is invalid") : "Awaiting full number"}</h3>
                  <p>{result ? "Checksum and structure have been evaluated." : "Enter all 16 digits to validate."}</p>
                </div>
              </div>

              <div className="cv-stack">
                <div className="cv-panel">
                  <h3>Luhn Algorithm Check</h3>
                  <div className="cv-panel-row">
                    <span className={!isComplete ? "idle" : luhnValid ? "ok" : "bad"}>{luhnState}</span>
                    <span>
                      {isComplete
                        ? `The card number ${luhnValid ? "passes" : "fails"} the checksum validation.`
                        : "Enter all 16 digits to evaluate the checksum."}
                    </span>
                  </div>
                </div>

                <div className="cv-panel-pair">
                  <div className="cv-panel">
                    <h3>Bank Details</h3>
                    <div className="cv-info-grid">
                      <InfoField label="Bank name" value={result?.bank || "N/A"} />
                      <InfoField label="Country" value={result?.country || "Unknown"} />
                      <InfoField label="Issuer phone" value={result?.phone || "N/A"} />
                      <InfoField label="Issuer website" value={result?.website || "N/A"} isLink={true} />
                      <InfoField label="Issuer city" value={result?.city || "N/A"} />
                    </div>
                  </div>

                  <div className="cv-panel">
                    <h3>Card Details</h3>
                    <div className="cv-info-grid">
                      <InfoField label="Card type" value={result?.type || "Unknown"} />
                      <InfoField label="Card network" value={cardBrand} />
                      <InfoField label="Card level" value={result?.level || "Standard"} />
                      <InfoField label="Card category" value={result?.category || "Unknown"} />
                      <InfoField label="Prepaid" value={result ? (result.prepaid ? "Yes" : "No") : "Unknown"} />
                    </div>
                  </div>
                </div>

                <div className="cv-panel">
                  <h3>Security and Structure</h3>
                  <div className="cv-info-grid">
                    <InfoField label="MII" value={result?.mii || (cardNumber ? getMii(cardNumber[0]) : "Unknown")} />
                    <InfoField label="BIN" value={cardNumber ? cardNumber.slice(0, 6) : "------"} mono />
                    <InfoField label="PAN" value={maskedNumber} mono />
                    <InfoField label="Card length" value={`${cardNumber.length || 0} digits`} />
                    <InfoField label="Checksum" value={result ? (result.checksumValid ? "Valid" : "Invalid") : "Unknown"} />
                    <InfoField label="Luhn" value={luhnState} />
                  </div>
                </div>
              </div>

              <div className="cv-actions">
                <button type="button" className="btn btn-soft" onClick={onCopy} disabled={!result}>
                  Copy data
                </button>
                <button type="button" className="btn btn-primary" onClick={onClear}>
                  New card
                </button>
                <button type="button" className="btn btn-soft" onClick={onShare} disabled={!result}>
                  Share
                </button>
              </div>

              {error ? <div className="cv-error">{error}</div> : null}
            </div>

            <div className="cv-right">
              <CardVisual brand={cardBrand} maskedNumber={maskedNumber} expiry={result?.cardNumber ? "12/25" : "MM/YY"} />
            </div>
          </div>
        </section>

        <section className="cv-tips">
          <div className="container">
            <h2 className="cv-section-title serif">Educational tips</h2>
            <div className="cv-tip-grid">
              <div className="cv-tip">
                <h3>MII identifies the industry</h3>
                <p>The first digit of a PAN tells you which industry allocated the range. 4 and 5 map to banking networks.</p>
              </div>
              <div className="cv-tip">
                <h3>BIN vs IIN</h3>
                <p>BIN is a legacy term. ISO now calls it the Issuer Identification Number and it spans digits 1 to 6.</p>
              </div>
              <div className="cv-tip">
                <h3>Luhn is not fraud detection</h3>
                <p>The checksum only catches typos. It does not confirm account status or available balance.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function InfoField({
  label,
  value,
  isLink,
  mono,
}: {
  label: string;
  value: string;
  isLink?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="cv-info-field">
      <span className="cv-info-label">{label}</span>
      {isLink && value !== "N/A" ? (
        <a className={`cv-info-value ${mono ? "mono" : ""}`} href={`https://${value}`} target="_blank" rel="noreferrer">
          {value}
        </a>
      ) : (
        <span className={`cv-info-value ${mono ? "mono" : ""}`}>{value}</span>
      )}
    </div>
  );
}

function CardVisual({
  brand,
  maskedNumber,
  expiry,
}: {
  brand: string;
  maskedNumber: string;
  expiry: string;
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientY - rect.top) / rect.height - 0.5;
    const y = (e.clientX - rect.left) / rect.width - 0.5;
    setRotation({ x: -x * 10, y: y * 10 });
  };

  const onLeave = () => setRotation({ x: 0, y: 0 });

  return (
    <div className="cv-card-stage">
      <div
        className="cv-card-tilt"
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` }}
      >
        <button
          type="button"
          className={`cv-card-3d ${isFlipped ? "flip" : ""}`}
          onClick={() => setIsFlipped((v) => !v)}
          aria-label="Flip card"
        >
          <div className="cv-card-face cv-card-front">
            <div className="cv-card-glow" />
            <div className="cv-card-row">
              <div className="cv-chip">
                <span />
                <span />
                <span />
                <span />
              </div>
              <div className="cv-contactless">)))</div>
            </div>
            <div className="cv-card-number mono">{maskedNumber}</div>
            <div className="cv-card-row bottom">
              <div>
                <div className="cv-card-label">Card holder</div>
                <div className="cv-card-holder">Card Holder</div>
                <div className="cv-card-exp">{expiry}</div>
              </div>
              <div className="cv-card-brand">{brand}</div>
            </div>
          </div>
          <div className="cv-card-face cv-card-back">
            <div className="cv-card-strip" />
            <div className="cv-card-cvv">
              <span>CVV</span>
              <strong>***</strong>
            </div>
            <div className="cv-card-sign">
              <div />
              <span>Authorized signature</span>
            </div>
          </div>
        </button>
      </div>
      <div className="cv-card-hint">Click the card to flip.</div>
    </div>
  );
}
