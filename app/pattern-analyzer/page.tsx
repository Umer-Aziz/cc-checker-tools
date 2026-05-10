"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Icon from "@/components/Icon";
import SectionHead from "@/components/SectionHead";

// ─── DATA TYPES ──────────────────────────────────────────────────────────
interface Transaction {
  id: string;
  ts: string;
  merchant: string;
  mcc: string;
  amount: number;
  cardPresent: boolean;
  city: string;
  country: string;
  lat: number;
  lng: number;
}

interface DataSet {
  id: string;
  label: string;
  description: string;
  transactions: Transaction[];
}

interface RuleResult {
  rule: string;
  flagged: number[];
  description: string;
}

// ─── SYNTHETIC DATA SETS ─────────────────────────────────────────────────
const DATA_SETS: DataSet[] = [
  {
    id: "velocity",
    label: "Velocity Spike",
    description: "Seven transactions from the same merchant within 32 minutes — a classic velocity anomaly.",
    transactions: [
      { id: "T001", ts: "2026-03-15 09:14", merchant: "ElectroWorld", mcc: "5732", amount: 149.99, cardPresent: true, city: "Chicago", country: "US", lat: 41.878, lng: -87.629 },
      { id: "T002", ts: "2026-03-15 09:21", merchant: "ElectroWorld", mcc: "5732", amount: 89.50, cardPresent: true, city: "Chicago", country: "US", lat: 41.878, lng: -87.629 },
      { id: "T003", ts: "2026-03-15 09:28", merchant: "ElectroWorld", mcc: "5732", amount: 199.99, cardPresent: true, city: "Chicago", country: "US", lat: 41.878, lng: -87.629 },
      { id: "T004", ts: "2026-03-15 09:35", merchant: "ElectroWorld", mcc: "5732", amount: 54.99, cardPresent: true, city: "Chicago", country: "US", lat: 41.878, lng: -87.629 },
      { id: "T005", ts: "2026-03-15 09:42", merchant: "ElectroWorld", mcc: "5732", amount: 299.00, cardPresent: true, city: "Chicago", country: "US", lat: 41.878, lng: -87.629 },
      { id: "T006", ts: "2026-03-15 09:46", merchant: "ElectroWorld", mcc: "5732", amount: 34.99, cardPresent: true, city: "Chicago", country: "US", lat: 41.878, lng: -87.629 },
      { id: "T007", ts: "2026-03-15 12:05", merchant: "Cafe Roma", mcc: "5812", amount: 42.00, cardPresent: true, city: "Chicago", country: "US", lat: 41.878, lng: -87.629 },
    ],
  },
  {
    id: "geo",
    label: "Geo Impossibility",
    description: "Two transactions minutes apart on different continents — physically impossible travel.",
    transactions: [
      { id: "T008", ts: "2026-03-20 08:00", merchant: "LondonTube Fare", mcc: "4111", amount: 5.60, cardPresent: true, city: "London", country: "GB", lat: 51.507, lng: -0.127 },
      { id: "T009", ts: "2026-03-20 08:03", merchant: "Pret a Manger", mcc: "5812", amount: 8.95, cardPresent: true, city: "London", country: "GB", lat: 51.507, lng: -0.127 },
      { id: "T010", ts: "2026-03-20 08:08", merchant: "Boots Pharmacy", mcc: "5912", amount: 12.50, cardPresent: true, city: "London", country: "GB", lat: 51.507, lng: -0.127 },
      { id: "T011", ts: "2026-03-20 08:12", merchant: "Starbucks", mcc: "5812", amount: 4.80, cardPresent: true, city: "New York", country: "US", lat: 40.712, lng: -74.006 },
      { id: "T012", ts: "2026-03-20 08:15", merchant: "Macy's", mcc: "5311", amount: 185.00, cardPresent: true, city: "New York", country: "US", lat: 40.712, lng: -74.006 },
      { id: "T013", ts: "2026-03-20 08:22", merchant: "Duane Reade", mcc: "5912", amount: 9.99, cardPresent: true, city: "New York", country: "US", lat: 40.712, lng: -74.006 },
    ],
  },
  {
    id: "clustering",
    label: "Merchant Clustering",
    description: "Multiple small-amount transactions at high-risk MCCs — a micro-transaction spray pattern.",
    transactions: [
      { id: "T014", ts: "2026-03-25 14:00", merchant: "QuickMart", mcc: "5499", amount: 3.25, cardPresent: false, city: "Miami", country: "US", lat: 25.761, lng: -80.191 },
      { id: "T015", ts: "2026-03-25 14:05", merchant: "QuickMart", mcc: "5499", amount: 2.17, cardPresent: false, city: "Miami", country: "US", lat: 25.761, lng: -80.191 },
      { id: "T016", ts: "2026-03-25 14:12", merchant: "ReloadCard", mcc: "6540", amount: 25.00, cardPresent: false, city: "Miami", country: "US", lat: 25.761, lng: -80.191 },
      { id: "T017", ts: "2026-03-25 14:18", merchant: "QuickMart", mcc: "5499", amount: 1.99, cardPresent: false, city: "Miami", country: "US", lat: 25.761, lng: -80.191 },
      { id: "T018", ts: "2026-03-25 14:25", merchant: "ReloadCard", mcc: "6540", amount: 50.00, cardPresent: false, city: "Miami", country: "US", lat: 25.761, lng: -80.191 },
      { id: "T019", ts: "2026-03-25 14:30", merchant: "GiftCardKing", mcc: "6540", amount: 100.00, cardPresent: false, city: "Miami", country: "US", lat: 25.761, lng: -80.191 },
      { id: "T020", ts: "2026-03-25 14:45", merchant: "WesternUnion", mcc: "4829", amount: 200.00, cardPresent: false, city: "Miami", country: "US", lat: 25.761, lng: -80.191 },
    ],
  },
];

// ─── RULE ENGINE ─────────────────────────────────────────────────────────
function runRules(txns: Transaction[], active: string[]): RuleResult[] {
  const results: RuleResult[] = [];

  if (active.includes("velocity")) {
    const flagged: number[] = [];
    const groups = new Map<string, number[]>();
    txns.forEach((t, i) => {
      const key = `${t.merchant}|${t.city}`;
      const list = groups.get(key) || [];
      list.push(i);
      groups.set(key, list);
    });
    for (const [, indices] of groups) {
      if (indices.length >= 4) {
        flagged.push(...indices);
      }
    }
    results.push({
      rule: "Velocity",
      flagged: [...new Set(flagged)],
      description: flagged.length
        ? `${flagged.length} transaction(s) flagged — ${txns[flagged[0]]?.merchant} processed ${new Set(flagged.map(i => txns[i]?.merchant)).size} merchant(s) at high frequency.`
        : "No velocity anomalies detected. No merchant exceeds 3 transactions per hour.",
    });
  }

  if (active.includes("geo")) {
    const flagged: number[] = [];
    for (let i = 1; i < txns.length; i++) {
      const prev = txns[i - 1];
      const curr = txns[i];
      const t1 = new Date(`2000-01-01T${prev.ts.split(" ")[1]}`);
      const t2 = new Date(`2000-01-01T${curr.ts.split(" ")[1]}`);
      const mins = (t2.getTime() - t1.getTime()) / 60000;
      const dist = haversine(prev.lat, prev.lng, curr.lat, curr.lng);
      if (mins > 0 && dist / mins > 800) {
        flagged.push(i - 1, i);
      }
    }
    results.push({
      rule: "Geo Impossibility",
      flagged: [...new Set(flagged)],
      description: flagged.length
        ? `${flagged.length} transaction(s) flagged — impossible travel between locations in the elapsed time.`
        : "No geo anomalies detected. All consecutive transactions are within reasonable travel distance.",
    });
  }

  if (active.includes("clustering")) {
    const flagged: number[] = [];
    const highRiskMccs = ["6540", "4829", "5499", "6012"];
    txns.forEach((t, i) => {
      if (highRiskMccs.includes(t.mcc) && t.amount < 100) {
        flagged.push(i);
      }
    });
    results.push({
      rule: "Clustering",
      flagged: [...new Set(flagged)],
      description: flagged.length
        ? `${flagged.length} transaction(s) flagged — micro-amounts at high-risk MCCs suggestive of spray testing.`
        : "No clustering anomalies detected. No unusual merchant category patterns found.",
    });
  }

  return results;
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── RULE TOGGLE ─────────────────────────────────────────────────────────
const RULE_DEFS = [
  { id: "velocity" as const, label: "Velocity Check", desc: "Flags when the same merchant processes >3 transactions within 1 hour." },
  { id: "geo" as const, label: "Geo Impossibility", desc: "Flags consecutive transactions whose distance per minute exceeds commercial flight speed." },
  { id: "clustering" as const, label: "Clustering Check", desc: "Flags micro-amounts at high-risk MCCs — reload, wire transfer, convenience stores." },
];

// ─── PAGE ────────────────────────────────────────────────────────────────
export default function PatternAnalyzerPage() {
  const [dataSetId, setDataSetId] = useState("velocity");
  const [activeRules, setActiveRules] = useState<string[]>(["velocity", "geo", "clustering"]);
  const [showAll, setShowAll] = useState(false);

  const dataset = useMemo(() => DATA_SETS.find((d) => d.id === dataSetId)!, [dataSetId]);
  const results = useMemo(() => runRules(dataset.transactions, activeRules), [dataset, activeRules]);
  const flaggedSet = useMemo(() => new Set(results.flatMap((r) => r.flagged)), [results]);

  const toggleRule = (id: string) => {
    setActiveRules((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  return (
    <div className="pa-page">
      <Nav />

      <main>
        <section className="bin-head">
          <div className="container">
            <nav className="bin-crumb" aria-label="Breadcrumb">
              <Link href="/">CC Checker /edu</Link>
              <span className="sep">/</span>
              <Link href="/#tools">The lab</Link>
              <span className="sep">/</span>
              <span className="cur">T-03 · Pattern Analyzer</span>
            </nav>
            <div className="bin-title-row">
              <div>
                <div className="bin-title-label">TOOL 03 — EDUCATIONAL · SYNTHETIC DATA ONLY</div>
                <h1 className="bin-title serif">
                  Read <em>transaction streams</em> like a fraud analyst.
                </h1>
                <p className="bin-sub">
                  Select a synthetic data set, toggle detection rules, and watch the engine
                  flag velocity spikes, geographic impossibilities, and merchant clustering.
                </p>
              </div>
              <div className="bin-meta">
                <div><strong>Data</strong> — 3 synthetic sets</div>
                <div><strong>Rules</strong> — 3 detection engines</div>
                <div><strong>Method</strong> — Heuristic scoring</div>
                <div><strong>Level</strong> — Introductory</div>
              </div>
            </div>
          </div>
        </section>

        <section className="pa-work">
          <div className="container pa-grid">
            {/* ─── LEFT COLUMN — DATA SET + TRANSACTIONS ───────────────── */}
            <div className="pa-left">
              {/* Dataset selector */}
              <div className="pa-panel">
                <div className="pa-panel-head">
                  <div className="pa-panel-head-l">
                    <Icon name="db" size={16} />
                    <span className="pa-panel-tag">Data set</span>
                  </div>
                  <span className="pa-panel-num">FIG. 01</span>
                </div>
                <div className="pa-dataset-chips">
                  {DATA_SETS.map((ds) => (
                    <button
                      key={ds.id}
                      type="button"
                      className={`pa-chip${dataSetId === ds.id ? " active" : ""}`}
                      onClick={() => setDataSetId(ds.id)}
                    >
                      <span className="pa-chip-label">{ds.label}</span>
                      <span className="pa-chip-count">{ds.transactions.length} txns</span>
                    </button>
                  ))}
                </div>
                <p className="pa-dataset-desc">{dataset.description}</p>
              </div>

              {/* Transaction table */}
              <div className="pa-panel">
                <div className="pa-panel-head">
                  <div className="pa-panel-head-l">
                    <Icon name="grid" size={16} />
                    <span className="pa-panel-tag">Transaction stream</span>
                  </div>
                  <span className="pa-panel-num">FIG. 02</span>
                </div>
                <div className="pa-table-wrap">
                  <table className="pa-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Time</th>
                        <th>Merchant</th>
                        <th>MCC</th>
                        <th className="pa-amount-col">Amount</th>
                        <th>Location</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {dataset.transactions.map((tx, i) => {
                        const isFlagged = flaggedSet.has(i);
                        const showRow = showAll || i === 0 || i === dataset.transactions.length - 1 || isFlagged || (i > 0 && flaggedSet.has(i - 1)) || (i < dataset.transactions.length - 1 && flaggedSet.has(i + 1));
                        if (!showRow) return null;
                        return (
                          <tr key={tx.id} className={isFlagged ? "flagged" : ""}>
                            <td className="mono">{tx.id}</td>
                            <td className="mono">{tx.ts.split(" ")[1]}</td>
                            <td>{tx.merchant}</td>
                            <td className="mono">{tx.mcc}</td>
                            <td className="pa-amount-col mono">${tx.amount.toFixed(2)}</td>
                            <td className="mono">{tx.city}</td>
                            <td>{isFlagged ? <span className="pa-flag-badge">!</span> : null}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <button className="btn btn-soft pa-show-btn" onClick={() => setShowAll(!showAll)}>
                  {showAll ? "Collapse unmarked" : "Show all transactions"}
                </button>
              </div>

              {/* Detection rules panel */}
              <div className="pa-panel">
                <div className="pa-panel-head">
                  <div className="pa-panel-head-l">
                    <Icon name="shield" size={16} />
                    <span className="pa-panel-tag">Detection rules</span>
                  </div>
                  <span className="pa-panel-num">Toggle</span>
                </div>
                <div className="pa-rules-grid">
                  {RULE_DEFS.map((rule) => {
                    const on = activeRules.includes(rule.id);
                    return (
                      <button
                        key={rule.id}
                        type="button"
                        className={`pa-rule-card${on ? " active" : ""}`}
                        onClick={() => toggleRule(rule.id)}
                        aria-pressed={on}
                      >
                        <div className="pa-rule-top">
                          <span className="pa-rule-toggle">{on ? "ON" : "OFF"}</span>
                          <span className="pa-rule-label">{rule.label}</span>
                        </div>
                        <p className="pa-rule-desc">{rule.desc}</p>
                      </button>
                    );
                  })}
                </div>
                <div className="notice-box" style={{ marginTop: 16 }}>
                  <Icon name="lock" size={16} />
                  <div>
                    <strong>Educational simulation.</strong> Rules are heuristic
                    demonstrations, not production-grade fraud models. Real
                    systems use ML scoring and behavioural profiling.
                  </div>
                </div>
              </div>
            </div>

            {/* ─── RIGHT COLUMN — RESULTS ──────────────────────────────── */}
            <div className="pa-right">
              <div className="pa-panel pa-results-panel">
                <div className="pa-panel-head">
                  <div className="pa-panel-head-l">
                    <Icon name="chart" size={16} />
                    <span className="pa-panel-tag">Detection results</span>
                  </div>
                  <span className="pa-panel-num">
                    {results.filter((r) => r.flagged.length > 0).length}/{activeRules.length} alerts
                  </span>
                </div>

                {activeRules.length === 0 ? (
                  <div className="pa-results-empty">
                    <p>Enable at least one detection rule to see results.</p>
                  </div>
                ) : (
                  <div className="pa-results-stack">
                    {results.map((r) => {
                      const hasHits = r.flagged.length > 0;
                      return (
                        <div key={r.rule} className={`pa-result-card${hasHits ? " alert" : " clean"}`}>
                          <div className="pa-result-head">
                            <span className={`pa-result-badge${hasHits ? " alert" : " clean"}`}>
                              {hasHits ? `${r.flagged.length} flagged` : "Clean"}
                            </span>
                            <span className="pa-result-rule">{r.rule}</span>
                          </div>
                          <p className="pa-result-desc">{r.description}</p>
                          {hasHits && (
                            <div className="pa-result-txns">
                              {[...new Set(r.flagged)].map((idx) => (
                                <span key={idx} className="pa-result-tag mono">
                                  {dataset.transactions[idx]?.id}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {results.some((r) => r.flagged.length > 0) && (
                  <div className="pa-summary-bar">
                    <span className="pa-summary-label">Summary</span>
                    <span className="pa-summary-count">
                      {results.reduce((s, r) => s + new Set(r.flagged).size, 0)} anomaly(ies) detected
                      across {results.filter((r) => r.flagged.length > 0).length} rule(s)
                    </span>
                  </div>
                )}
              </div>

              {/* Rule reference */}
              <div className="pa-panel">
                <div className="pa-panel-head">
                  <div className="pa-panel-head-l">
                    <Icon name="book" size={16} />
                    <span className="pa-panel-tag">Rule reference</span>
                  </div>
                </div>
                <div className="pa-ref-list">
                  <div className="pa-ref-item">
                    <span className="pa-ref-rule mono">Velocity</span>
                    <span className="pa-ref-desc">Aggregate by merchant; flag if count {'>'} 3 per hour</span>
                  </div>
                  <div className="pa-ref-item">
                    <span className="pa-ref-rule mono">Geo</span>
                    <span className="pa-ref-desc">Haversine distance / time delta {'>'} 800 km/h</span>
                  </div>
                  <div className="pa-ref-item">
                    <span className="pa-ref-rule mono">Clustering</span>
                    <span className="pa-ref-desc">MCC in [6540, 4829, 5499] &amp; amount &lt; $100</span>
                  </div>
                </div>
              </div>

              <div className="pa-panel pa-cta-panel">
                <h3 className="pa-cta-title serif">Open the case files</h3>
                <p className="pa-cta-desc">
                  Read annotated case studies of real-world fraud patterns
                  mapped to each detection rule.
                </p>
                <Link className="btn btn-primary" href="/#tools">
                  Browse case files <Icon name="arrow" size={14} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ─── RULES ANATOMY ──────────────────────────────────────────── */}
        <section className="pa-anatomy">
          <div className="container">
            <SectionHead
              idx="II"
              eyebrow="How rules work"
              title={
                <>
                  Three heuristic engines. Each one teaches a <em>real</em> detection concept.
                </>
              }
            />
            <div className="pa-anat-grid">
              <div className="pa-anat-card">
                <div className="pa-anat-num mono">§ 01</div>
                <h3 className="serif">Velocity Detection</h3>
                <p>
                  Fraudsters often test a card with rapid repeat transactions at the same merchant.
                  Our heuristic groups by merchant ID and counts transactions within a sliding
                  one-hour window. Any merchant exceeding 3 transactions is flagged. Real systems
                  use configurable thresholds per merchant category and cardholder history.
                </p>
              </div>
              <div className="pa-anat-card">
                <div className="pa-anat-num mono">§ 02</div>
                <h3 className="serif">Geo Impossibility</h3>
                <p>
                  Uses the Haversine formula to compute great-circle distance between consecutive
                  transaction coordinates. If distance divided by elapsed minutes exceeds ~800 km/h
                  (typical commercial aircraft speed), the pair is flagged. Real fraud engines
                  incorporate airport proximity, known travel patterns, and IP geolocation.
                </p>
              </div>
              <div className="pa-anat-card">
                <div className="pa-anat-num mono">§ 03</div>
                <h3 className="serif">Merchant Clustering</h3>
                <p>
                  Card-testing fraud uses micro-amounts at high-risk merchant categories — reloadable
                  prepaid cards, money transfer agents, convenience stores. Our heuristic flags
                  transactions under $100 at MCCs 6540 (non-financial reload), 4829 (wire transfer),
                  and 5499 (convenience stores). Real models weight velocity, amount, and MCC
                  into a composite risk score.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── CASE FILES ──────────────────────────────────────────────── */}
        <section className="pa-casefiles">
          <div className="container">
            <SectionHead
              idx="III"
              eyebrow="Case files"
              title={
                <>
                  Annotated <em>scenarios</em> mapped to each detection rule.
                </>
              }
            />
            <div className="pa-case-grid">
              <article className="pa-case-card">
                <div className="pa-case-top">
                  <span className="pa-case-tag">Velocity</span>
                  <span className="pa-case-ref">CF-2026-001</span>
                </div>
                <h3 className="serif">The electronics-store spray</h3>
                <p className="pa-case-summary">
                  A card used 6 times at ElectroWorld within 32 minutes. Each transaction
                  was a different amount — a manual spray test to find the remaining balance
                  before a large purchase.
                </p>
                <div className="pa-case-metrics">
                  <div className="pa-case-metric">
                    <span className="pa-case-metric-k">Window</span>
                    <span className="pa-case-metric-v">32 min</span>
                  </div>
                  <div className="pa-case-metric">
                    <span className="pa-case-metric-k">Txns flagged</span>
                    <span className="pa-case-metric-v">6</span>
                  </div>
                  <div className="pa-case-metric">
                    <span className="pa-case-metric-k">Pattern</span>
                    <span className="pa-case-metric-v">Spray test</span>
                  </div>
                </div>
              </article>
              <article className="pa-case-card">
                <div className="pa-case-top">
                  <span className="pa-case-tag">Geo</span>
                  <span className="pa-case-ref">CF-2026-002</span>
                </div>
                <h3 className="serif">The transatlantic jump</h3>
                <p className="pa-case-summary">
                  A transaction in London at 08:12 and another in New York at 08:15 —
                  impossible travel given the ~5,570 km distance and 3-minute gap. The
                  card was likely compromised and used in two locations simultaneously.
                </p>
                <div className="pa-case-metrics">
                  <div className="pa-case-metric">
                    <span className="pa-case-metric-k">Distance</span>
                    <span className="pa-case-metric-v">5,570 km</span>
                  </div>
                  <div className="pa-case-metric">
                    <span className="pa-case-metric-k">Gap</span>
                    <span className="pa-case-metric-v">3 min</span>
                  </div>
                  <div className="pa-case-metric">
                    <span className="pa-case-metric-k">Speed req.</span>
                    <span className="pa-case-metric-v">111,400 km/h</span>
                  </div>
                </div>
              </article>
              <article className="pa-case-card">
                <div className="pa-case-top">
                  <span className="pa-case-tag">Clustering</span>
                  <span className="pa-case-ref">CF-2026-003</span>
                </div>
                <h3 className="serif">The reload spray</h3>
                <p className="pa-case-summary">
                  Seven micro-transactions under $100 across convenience stores, reload
                  cards, and a wire transfer agent — all within 45 minutes. The pattern
                  matches a card-testing bot probing before a larger cash-out.
                </p>
                <div className="pa-case-metrics">
                  <div className="pa-case-metric">
                    <span className="pa-case-metric-k">Window</span>
                    <span className="pa-case-metric-v">45 min</span>
                  </div>
                  <div className="pa-case-metric">
                    <span className="pa-case-metric-k">MCCs flagged</span>
                    <span className="pa-case-metric-v">3</span>
                  </div>
                  <div className="pa-case-metric">
                    <span className="pa-case-metric-k">Pattern</span>
                    <span className="pa-case-metric-v">Bot spray</span>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* ─── RELATED TOOLS ──────────────────────────────────────────── */}
        <section className="bin-related" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="container">
            <SectionHead
              idx="IV"
              eyebrow="Adjacent"
              title={
                <>
                  Tools that <em>compose</em> with pattern analysis.
                </>
              }
            />
            <div className="rel-grid">
              <Link className="rel-card" href="/bin-lookup">
                <div className="rel-top">
                  <span className="idx">T-01</span>
                  <span className="rel-icon"><Icon name="glass" size={22} /></span>
                </div>
                <h3 className="rel-h serif">BIN Lookup</h3>
                <p className="rel-d">Search the educational BIN index. Identify issuer, network, and card product from the first six digits.</p>
                <span className="btn-link" style={{ alignSelf: "flex-start" }}>Open <Icon name="arrow" size={14} /></span>
              </Link>
              <Link className="rel-card" href="/luhn-walkthrough">
                <div className="rel-top">
                  <span className="idx">T-02</span>
                  <span className="rel-icon"><Icon name="spark" size={22} /></span>
                </div>
                <h3 className="rel-h serif">Luhn Walkthrough</h3>
                <p className="rel-d">Animate every doubling and modular reduction in the checksum. Understand PAN format validation step by step.</p>
                <span className="btn-link" style={{ alignSelf: "flex-start" }}>Open <Icon name="arrow" size={14} /></span>
              </Link>
              <Link className="rel-card" href="/card-validator">
                <div className="rel-top">
                  <span className="idx">T-04</span>
                  <span className="rel-icon"><Icon name="grid" size={22} /></span>
                </div>
                <h3 className="rel-h serif">Card Validator</h3>
                <p className="rel-d">Validate a full PAN with the Luhn algorithm. Detect brand, MII, and BIN from any card number.</p>
                <span className="btn-link" style={{ alignSelf: "flex-start" }}>Open <Icon name="arrow" size={14} /></span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
