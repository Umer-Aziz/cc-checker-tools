"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Icon from "@/components/Icon";

// ── TYPES ─────────────────────────────────────────────────────────────────────
interface CheckResult {
  success: boolean;
  status: "LIVE" | "DEAD";
  cardNumber: string;
  bin: string;
  bank: string;
  country: string;
  network: string;
  type: string;
  transactionId: string;
  responseCode: string;
  message: string;
  timestamp: string;
}

interface HistoryItem {
  id: number;
  lastFour: string;
  status: "LIVE" | "DEAD";
  timestamp: string;
  details: CheckResult;
}

// ── HELPERS ───────────────────────────────────────────────────────────────────
function validateLuhn(n: string): boolean {
  let sum = 0;
  let even = false;
  for (let i = n.length - 1; i >= 0; i--) {
    let d = Number(n[i]);
    if (even) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
    even = !even;
  }
  return sum % 10 === 0;
}

function formatPan(digits: string): string {
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}

function detectNetwork(pan: string): string {
  if (!pan) return "";
  if (/^4/.test(pan)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(pan)) return "Mastercard";
  if (/^3[47]/.test(pan)) return "American Express";
  if (/^(6011|65)/.test(pan)) return "Discover";
  if (/^35/.test(pan)) return "JCB";
  if (/^(30|36|38)/.test(pan)) return "Diners Club";
  return "Unknown";
}

const SAMPLE_CARDS = [
  { num: "4242424242424242", expiry: "12/26", cvv: "123", label: "Visa · LIVE" },
  { num: "4000000000000002", expiry: "12/26", cvv: "123", label: "Visa · DEAD" },
  { num: "5555555555554444", expiry: "12/26", cvv: "123", label: "MC · LIVE" },
];

// ── PAGE ──────────────────────────────────────────────────────────────────────
export default function LiveDeadCheckerPage() {
  const [cardNumber, setCardNumber] = useState("");   // raw digits only
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<CheckResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  // Derived state
  const isAmex = /^3[47]/.test(cardNumber);
  const isDiners = /^(30|36|38)/.test(cardNumber);
  const expectedLen = isAmex ? 15 : isDiners ? 14 : 16;
  const isCardValid =
    cardNumber.length === expectedLen && validateLuhn(cardNumber);
  const isExpiryValid = /^\d{2}\/\d{2}$/.test(expiryDate);
  const isCvvValid = cvv.length >= 3 && cvv.length <= 4;
  const isFormValid = isCardValid && isExpiryValid && isCvvValid;
  const network = detectNetwork(cardNumber);

  // ── HANDLERS ────────────────────────────────────────────────────────────────
  function onCardChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
    setCardNumber(raw);
    setError("");
    if (result) setResult(null);
  }

  function onExpiryChange(e: React.ChangeEvent<HTMLInputElement>) {
    let v = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2);
    setExpiryDate(v);
    setError("");
  }

  function onCvvChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCvv(e.target.value.replace(/\D/g, "").slice(0, 4));
    setError("");
  }

  function fillSample(s: (typeof SAMPLE_CARDS)[number]) {
    setCardNumber(s.num);
    setExpiryDate(s.expiry);
    setCvv(s.cvv);
    setError("");
    setResult(null);
  }

  async function onPasteFromGenerator() {
    try {
      const text = await navigator.clipboard.readText();
      // Generator copies: "4242 4242 4242 4242 | 12/25 | 123 | Chase Bank"
      const parts = text.split("|").map((p) => p.trim());
      if (parts.length >= 3) {
        setCardNumber(parts[0].replace(/\D/g, "").slice(0, 16));
        setExpiryDate(parts[1]);
        setCvv(parts[2].replace(/\D/g, "").slice(0, 4));
        setError("");
        setResult(null);
      } else {
        setError("Clipboard doesn’t look like a generated card. Try again.");
      }
    } catch {
      setError("Clipboard access denied. Paste manually.");
    }
  }

  async function onCheckStatus(e: React.FormEvent) {
    e.preventDefault();
    if (!isFormValid || loading) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/check-card-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardNumber, expiryDate, cvv }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Check failed. Try again.");
        return;
      }
      const r = data as CheckResult;
      setResult(r);
      setHistory((prev) => [
        {
          id: Date.now(),
          lastFour: cardNumber.slice(-4),
          status: r.status,
          timestamp: r.timestamp,
          details: r,
        },
        ...prev.slice(0, 9),
      ]);
    } catch {
      setError("Unable to reach checker. Check your connection.");
    } finally {
      setLoading(false);
    }
  }

  function onClear() {
    setCardNumber("");
    setExpiryDate("");
    setCvv("");
    setError("");
    setResult(null);
  }

  async function onCopyResult() {
    if (!result) return;
    const text = [
      `Card:      **** **** **** ${result.cardNumber.slice(-4)}`,
      `Status:    ${result.status}`,
      `Bank:      ${result.bank}`,
      `Network:   ${result.network}`,
      `Response:  ${result.message}`,
      `Tx ID:     ${result.transactionId}`,
      `Timestamp: ${new Date(result.timestamp).toLocaleString()}`,
    ].join("\n");
    await navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function onExportCSV() {
    const rows = [
      ["Card (Last 4)", "Status", "Network", "Bank", "Country", "Response", "Date/Time"],
      ...history.map((h) => [
        `**** **** **** ${h.lastFour}`,
        h.status,
        h.details.network,
        h.details.bank,
        h.details.country,
        h.details.responseCode,
        new Date(h.timestamp).toLocaleString(),
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), {
      href: url,
      download: `card_checks_${Date.now()}.csv`,
    });
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── RENDER ───────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: "var(--bg)", color: "var(--ink)" }}>
      <Nav />

      <main>
        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <section className="bin-head">
          <div className="container">
            <nav className="bin-crumb" aria-label="Breadcrumb">
              <Link href="/">CC Checker /edu</Link>
              <span className="sep">/</span>
              <Link href="/#tools">The lab</Link>
              <span className="sep">/</span>
              <span className="cur">T-06 · Card Status Checker</span>
            </nav>

            <div className="bin-title-row">
              <div>
                <div className="bin-title-label">
                  TOOL 06 — EDUCATIONAL · SIMULATION MODE
                </div>
                <h1 className="bin-title serif">
                  Check if a card is <em>live</em> or dead.
                </h1>
                <p className="bin-sub">
                  Simulate a $0.01 authorization to determine if a card would be
                  approved or declined. Uses Stripe-compatible test card detection.
                  No real funds are processed.
                </p>
              </div>
              <div className="bin-meta">
                <div><strong>Method</strong> — Simulated charge</div>
                <div><strong>Amount</strong> — $0.01 test</div>
                <div><strong>Mode</strong> — Simulation</div>
                <div><strong>Standard</strong> — ISO/IEC 7812</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── WORK AREA ───────────────────────────────────────────────────── */}
        <section className="bin-work">
          <div className="container">
            <div className="bin-grid">

              {/* ── LEFT: FORM ──────────────────────────────────────────── */}
              <div className="bin-form-panel">
                <div className="form-head">
                  <div className="form-head-l">
                    <Icon name="shield" size={15} />
                    <span className="form-head-tag">Card details</span>
                  </div>
                  <span className="form-head-num">FIG. 01</span>
                </div>

                <form onSubmit={onCheckStatus}>
                  {/* Card Number */}
                  <div className="ldc-field">
                    <label className="field-label" htmlFor="ldc-card">
                      <span>Card Number <span className="req">*</span></span>
                      {cardNumber.length > 0 && (
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 11,
                            color: isCardValid ? "#2E7D55" : "var(--ink-faint)",
                          }}
                        >
                          {cardNumber.length}/{expectedLen}
                        </span>
                      )}
                    </label>
                    <input
                      id="ldc-card"
                      type="text"
                      inputMode="numeric"
                      autoComplete="cc-number"
                      placeholder="4242 4242 4242 4242"
                      value={formatPan(cardNumber)}
                      onChange={onCardChange}
                      className={`ldc-input${isCardValid ? " valid" : ""}`}
                      disabled={loading}
                    />
                    {cardNumber.length > 0 && (
                      <div className="field-help">
                        <span style={{ color: "var(--ink-2)" }}>
                          {network || "—"}
                        </span>
                        <span className={isCardValid ? "ok" : ""}>
                          {isCardValid
                            ? "Luhn ✓"
                            : cardNumber.length < expectedLen
                            ? `${cardNumber.length}/${expectedLen} digits`
                            : "Luhn ✗"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Expiry + CVV */}
                  <div className="ldc-field-row">
                    <div>
                      <label className="field-label" htmlFor="ldc-expiry">
                        Expiry <span className="req">*</span>
                      </label>
                      <input
                        id="ldc-expiry"
                        type="text"
                        inputMode="numeric"
                        autoComplete="cc-exp"
                        placeholder="MM/YY"
                        value={expiryDate}
                        onChange={onExpiryChange}
                        maxLength={5}
                        className="ldc-input"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="field-label" htmlFor="ldc-cvv">
                        CVV <span className="req">*</span>
                      </label>
                      <input
                        id="ldc-cvv"
                        type="password"
                        inputMode="numeric"
                        autoComplete="cc-csc"
                        placeholder="123"
                        value={cvv}
                        onChange={onCvvChange}
                        maxLength={4}
                        className="ldc-input"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Inline error */}
                  {error && (
                    <div
                      style={{
                        marginBottom: 14,
                        padding: "10px 14px",
                        background: "#FDF2F0",
                        border: "1px solid #E7B9B4",
                        fontSize: 13,
                        color: "#B43A2E",
                        lineHeight: 1.5,
                      }}
                    >
                      {error}
                    </div>
                  )}

                  {/* Paste from generator */}
                  <button
                    type="button"
                    onClick={onPasteFromGenerator}
                    className="btn btn-soft"
                    style={{ width: "100%", marginBottom: 10, fontSize: 13 }}
                    disabled={loading}
                  >
                    <Icon name="pen" size={13} /> Paste from Generator
                  </button>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="btn btn-primary lookup-btn"
                    disabled={!isFormValid || loading}
                    style={{ width: "100%", marginBottom: 10 }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner" />
                        Checking…
                      </>
                    ) : (
                      <>
                        <Icon name="shield" size={15} /> Check Status
                      </>
                    )}
                  </button>

                  {/* Clear */}
                  <button
                    type="button"
                    onClick={onClear}
                    className="btn btn-soft"
                    style={{ width: "100%", fontSize: 13 }}
                    disabled={loading}
                  >
                    Clear
                  </button>
                </form>

                {/* Warning */}
                <div className="notice-box" style={{ marginTop: 24 }}>
                  <Icon name="lock" size={15} />
                  <div>
                    <strong>Simulation mode.</strong> Only Stripe&apos;s published
                    test cards return LIVE. All other Luhn-valid cards return DEAD.
                    No real charges are made.
                  </div>
                </div>

                {/* Sample cards */}
                <div className="sample-row">
                  <div className="sample-label">Try test cards</div>
                  <div style={{ display: "grid", gap: 6 }}>
                    {SAMPLE_CARDS.map((s) => (
                      <button
                        key={s.num}
                        type="button"
                        className="chip"
                        onClick={() => fillSample(s)}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 8,
                          width: "100%",
                          textAlign: "left",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 11,
                            letterSpacing: "0.08em",
                          }}
                        >
                          {formatPan(s.num)}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            color: s.label.includes("LIVE")
                              ? "#1F8A5B"
                              : "#C0392B",
                            flexShrink: 0,
                          }}
                        >
                          {s.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── RIGHT: RESULTS + HISTORY ────────────────────────────── */}
              <div
                className="bin-results"
                style={{ display: "flex", flexDirection: "column", gap: 24 }}
              >
                {/* Empty state */}
                {!result && !loading && (
                  <div className="results-default">
                    <div className="results-default-mark">Status checker</div>
                    <h2 className="results-default-h serif">
                      Ready to <em>check.</em>
                    </h2>
                    <p className="results-default-d">
                      Enter card details and click{" "}
                      <strong>Check Status</strong> to simulate a $0.01
                      authorization and see if the card is LIVE or DEAD.
                    </p>
                  </div>
                )}

                {/* Loading */}
                {loading && (
                  <div className="results-loading">
                    <div className="loading-spinner" />
                    <div className="loading-text">Checking card…</div>
                    <div className="loading-bin">{formatPan(cardNumber)}</div>
                  </div>
                )}

                {/* Result */}
                {result && !loading && (
                  <div className="r-card">
                    {/* Status banner */}
                    <div
                      className={
                        result.status === "LIVE"
                          ? "ldc-status-live"
                          : "ldc-status-dead"
                      }
                    >
                      <div className="ldc-status-mark">
                        {result.status === "LIVE"
                          ? "Transaction approved"
                          : "Transaction declined"}
                      </div>
                      <div className="ldc-status-icon">
                        {result.status === "LIVE" ? "✓" : "✗"}
                      </div>
                      <h2 className="ldc-status-title serif">
                        Card is {result.status === "LIVE" ? "LIVE" : "DEAD"}
                      </h2>
                      <p className="ldc-status-sub">{result.message}</p>
                    </div>

                    {/* Details grid */}
                    <div className="r-grid">
                      <div className="r-cell">
                        <span className="r-cell-k">Card</span>
                        <span className="r-cell-v mono">
                          •••• •••• •••• {result.cardNumber.slice(-4)}
                        </span>
                      </div>
                      <div className="r-cell">
                        <span className="r-cell-k">Network</span>
                        <span className="r-cell-v">{result.network}</span>
                      </div>
                      <div className="r-cell">
                        <span className="r-cell-k">Bank</span>
                        <span className="r-cell-v">{result.bank}</span>
                      </div>
                      <div className="r-cell">
                        <span className="r-cell-k">Country</span>
                        <span className="r-cell-v">{result.country}</span>
                      </div>
                      <div className="r-cell">
                        <span className="r-cell-k">Card Type</span>
                        <span className="r-cell-v">{result.type}</span>
                      </div>
                      <div className="r-cell">
                        <span className="r-cell-k">BIN</span>
                        <span className="r-cell-v mono">{result.bin}</span>
                      </div>
                      <div className="r-cell">
                        <span className="r-cell-k">Response Code</span>
                        <span className="r-cell-v mono" style={{ fontSize: 13 }}>
                          {result.responseCode}
                        </span>
                      </div>
                      <div className="r-cell">
                        <span className="r-cell-k">Amount</span>
                        <span className="r-cell-v">$0.01 simulated</span>
                      </div>
                      <div className="r-cell">
                        <span className="r-cell-k">Transaction ID</span>
                        <span
                          className="r-cell-v mono"
                          style={{ fontSize: 12, wordBreak: "break-all" }}
                        >
                          {result.transactionId}
                        </span>
                      </div>
                      <div className="r-cell">
                        <span className="r-cell-k">Timestamp</span>
                        <span
                          className="r-cell-v mono"
                          style={{ fontSize: 12 }}
                        >
                          {new Date(result.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="r-actions">
                      <button
                        type="button"
                        className={`btn btn-soft${copied ? " copied-flash" : ""}`}
                        onClick={onCopyResult}
                      >
                        <Icon name={copied ? "check" : "pen"} size={14} />
                        {copied ? "Copied!" : "Copy Result"}
                      </button>
                      <button
                        type="button"
                        className="btn btn-soft"
                        onClick={onClear}
                      >
                        New Check
                      </button>
                    </div>
                  </div>
                )}

                {/* History */}
                {history.length > 0 && (
                  <div className="cg-panel">
                    <div className="cg-panel-head">
                      <div className="cg-panel-head-l">
                        <Icon name="grid" size={15} />
                        <span className="cg-panel-tag">Check history</span>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          type="button"
                          className="btn btn-soft"
                          onClick={onExportCSV}
                          style={{ fontSize: 12, padding: "6px 12px" }}
                        >
                          Export CSV
                        </button>
                        <button
                          type="button"
                          className="btn btn-soft"
                          onClick={() => {
                            setHistory([]);
                            setExpandedId(null);
                          }}
                          style={{ fontSize: 12, padding: "6px 12px" }}
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    <div style={{ overflowX: "auto", margin: "0 -4px" }}>
                      <table className="ldc-hist-table">
                        <thead>
                          <tr>
                            <th className="ldc-hist-th">Card</th>
                            <th className="ldc-hist-th">Status</th>
                            <th className="ldc-hist-th">Date / Time</th>
                            <th className="ldc-hist-th">Bank</th>
                            <th className="ldc-hist-th"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {history.map((item) => (
                            <Fragment key={item.id}>
                              <tr className="ldc-hist-row">
                                <td
                                  className="ldc-hist-td"
                                  style={{
                                    fontFamily: "var(--font-mono)",
                                    fontSize: 13,
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  •••• {item.lastFour}
                                </td>
                                <td className="ldc-hist-td">
                                  <span
                                    className={
                                      item.status === "LIVE"
                                        ? "ldc-pill-live"
                                        : "ldc-pill-dead"
                                    }
                                  >
                                    {item.status}
                                  </span>
                                </td>
                                <td
                                  className="ldc-hist-td"
                                  style={{
                                    fontSize: 12,
                                    color: "var(--ink-soft)",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {new Date(item.timestamp).toLocaleString()}
                                </td>
                                <td
                                  className="ldc-hist-td"
                                  style={{ fontSize: 13 }}
                                >
                                  {item.details.bank}
                                </td>
                                <td className="ldc-hist-td">
                                  <button
                                    type="button"
                                    className="btn-link"
                                    onClick={() =>
                                      setExpandedId(
                                        expandedId === item.id ? null : item.id
                                      )
                                    }
                                  >
                                    {expandedId === item.id ? "Hide" : "View"}
                                  </button>
                                </td>
                              </tr>

                              {expandedId === item.id && (
                                <tr>
                                  <td
                                    colSpan={5}
                                    style={{
                                      padding: "14px 16px",
                                      background: "var(--surface-2)",
                                      borderBottom:
                                        "1px solid var(--border-soft)",
                                    }}
                                  >
                                    <div
                                      style={{
                                        display: "grid",
                                        gridTemplateColumns:
                                          "repeat(auto-fit, minmax(160px, 1fr))",
                                        gap: 14,
                                      }}
                                    >
                                      {[
                                        [
                                          "Transaction ID",
                                          item.details.transactionId,
                                        ],
                                        [
                                          "Response Code",
                                          item.details.responseCode,
                                        ],
                                        ["Message", item.details.message],
                                        ["Amount", "$0.01 (simulated)"],
                                        ["Network", item.details.network],
                                        ["Country", item.details.country],
                                      ].map(([k, v]) => (
                                        <div key={k}>
                                          <div
                                            style={{
                                              fontSize: 10,
                                              letterSpacing: "0.14em",
                                              color: "var(--ink-soft)",
                                              textTransform: "uppercase",
                                              marginBottom: 3,
                                              fontFamily: "var(--font-mono)",
                                            }}
                                          >
                                            {k}
                                          </div>
                                          <div
                                            style={{
                                              fontSize: 12,
                                              fontFamily: "var(--font-mono)",
                                              color: "var(--ink)",
                                              wordBreak: "break-all",
                                            }}
                                          >
                                            {v}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </Fragment>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── EDUCATIONAL INFO ─────────────────────────────────────────────── */}
        <section className="ldc-info">
          <div className="container">
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.18em",
                color: "var(--gold)",
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              Educational context
            </div>
            <h2
              className="serif"
              style={{
                fontSize: "clamp(28px, 3.5vw, 46px)",
                letterSpacing: "-0.02em",
                marginBottom: 12,
              }}
            >
              How card status checking works.
            </h2>
            <p
              style={{
                fontSize: 16,
                color: "var(--ink-2)",
                maxWidth: 640,
                lineHeight: 1.6,
              }}
            >
              In production, LIVE/DEAD checking involves making a small
              authorization hold against a real payment network. Here&apos;s the
              flow.
            </p>

            <div className="ldc-info-grid">
              <div className="ldc-info-card">
                <div className="ldc-info-num">01 — Enter</div>
                <h3 className="serif">Card details</h3>
                <p>
                  The PAN, expiry, and CVV are tokenized and sent to a payment
                  gateway. The raw PAN is never stored in plaintext — only a
                  token travels to the processor.
                </p>
              </div>
              <div className="ldc-info-card">
                <div className="ldc-info-num">02 — Authorize</div>
                <h3 className="serif">$0.01 test charge</h3>
                <p>
                  A minimal authorization request goes to the issuing bank via
                  Visa/Mastercard rails. The bank checks card status, available
                  balance, and real-time fraud signals.
                </p>
              </div>
              <div className="ldc-info-card">
                <div className="ldc-info-num">03 — Respond</div>
                <h3 className="serif">LIVE or DEAD</h3>
                <p>
                  The issuer returns an approval code (LIVE) or a specific
                  decline code (DEAD). Codes like{" "}
                  <code
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 12,
                      background: "var(--surface-2)",
                      padding: "1px 4px",
                    }}
                  >
                    do_not_honor
                  </code>{" "}
                  or{" "}
                  <code
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 12,
                      background: "var(--surface-2)",
                      padding: "1px 4px",
                    }}
                  >
                    insufficient_funds
                  </code>{" "}
                  each tell a different story about why the card failed.
                </p>
              </div>
            </div>

            {/* Test card reference */}
            <div style={{ marginTop: 56 }}>
              <h3
                className="serif"
                style={{ fontSize: 28, marginBottom: 6 }}
              >
                Stripe test card reference.
              </h3>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--ink-2)",
                  marginBottom: 24,
                  lineHeight: 1.6,
                }}
              >
                These cards return <strong>LIVE</strong> in this tool. All
                other Luhn-valid numbers — including any card generated by CC
                Generator — return <strong>DEAD</strong>.
              </p>

              <div className="ldc-test-grid">
                {[
                  {
                    num: "4242 4242 4242 4242",
                    network: "Visa",
                    status: "LIVE" as const,
                  },
                  {
                    num: "4000 0000 0000 0002",
                    network: "Visa",
                    status: "DEAD" as const,
                  },
                  {
                    num: "5555 5555 5555 4444",
                    network: "Mastercard",
                    status: "LIVE" as const,
                  },
                  {
                    num: "3782 822463 10005",
                    network: "Amex",
                    status: "LIVE" as const,
                  },
                  {
                    num: "6011 1111 1111 1117",
                    network: "Discover",
                    status: "LIVE" as const,
                  },
                  {
                    num: "Any generated card",
                    network: "Any",
                    status: "DEAD" as const,
                  },
                ].map((c) => (
                  <div key={c.num} className="ldc-test-card">
                    <div className="ldc-test-card-num">{c.num}</div>
                    <div className="ldc-test-card-meta">
                      <span className="ldc-test-network">{c.network}</span>
                      <span
                        className={
                          c.status === "LIVE"
                            ? "ldc-pill-live"
                            : "ldc-pill-dead"
                        }
                      >
                        {c.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="ldc-disclaimer">
              <Icon name="lock" size={15} />
              <span>
                <strong>Educational tool.</strong> This simulator demonstrates
                how payment authorization works using Stripe&apos;s published
                test card numbers. No real transactions are processed. Never
                enter real card data into any educational platform.
              </span>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
