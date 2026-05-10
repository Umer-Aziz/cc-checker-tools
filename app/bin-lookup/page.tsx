"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Icon from "@/components/Icon";
import SectionHead from "@/components/SectionHead";

// ─── DATA ──────────────────────────────────────────────────────────────
interface BinRecord {
  bank: string;
  brand: string;
  network: string;
  cardType: string;
  category: string;
  country: string;
  countryCode: string;
  continent?: string;
  luhn?: boolean;
  institution: string;
  website: string;
  headquarters: string;
  issued: string;
  fact: string;
}

const SAMPLE_BINS: Record<string, BinRecord> = {
  "453214": {
    bank: "Bank of America, N.A.",
    brand: "Visa", network: "Visa Inc.",
    cardType: "Credit", category: "Platinum",
    country: "United States", countryCode: "US", continent: "North America", luhn: true,
    institution: "Commercial bank · National",
    website: "bankofamerica.com",
    headquarters: "Charlotte, NC",
    issued: "1976",
    fact: "BIN range 4532xx is part of Visa's allocation to Bank of America. The leading 4 across all Visa cards is the Major Industry Identifier for banking and financial services.",
  },
  "510510": {
    bank: "MasterCard test BIN",
    brand: "Mastercard", network: "Mastercard Worldwide",
    cardType: "Credit", category: "Standard",
    country: "International", countryCode: "—", continent: "—", luhn: true,
    institution: "Test / educational range",
    website: "mastercard.com",
    headquarters: "Purchase, NY",
    issued: "1966",
    fact: "510510 is one of the published Mastercard test BINs that processors use to validate integrations. It will never authorise a real charge.",
  },
  "411111": {
    bank: "Visa test BIN",
    brand: "Visa", network: "Visa Inc.",
    cardType: "Credit", category: "Test",
    country: "International", countryCode: "—", continent: "—", luhn: true,
    institution: "Test / educational range",
    website: "visa.com",
    headquarters: "Foster City, CA",
    issued: "1958",
    fact: "411111 is a published Visa test BIN used by every major payment processor. Anyone studying card validation should recognise it on sight.",
  },
  "552266": {
    bank: "Capital One Bank",
    brand: "Mastercard", network: "Mastercard Worldwide",
    cardType: "Credit", category: "Quicksilver",
    country: "United States", countryCode: "US", continent: "North America", luhn: true,
    institution: "Commercial bank · National",
    website: "capitalone.com",
    headquarters: "McLean, VA",
    issued: "1994",
    fact: "Mastercard BINs in the 51–55 range identify standard credit products. Capital One holds several allocations across this band.",
  },
  "371449": {
    bank: "American Express test BIN",
    brand: "American Express", network: "American Express",
    cardType: "Credit", category: "Test",
    country: "International", countryCode: "—", continent: "—", luhn: true,
    institution: "Test / educational range",
    website: "americanexpress.com",
    headquarters: "New York, NY",
    issued: "1850",
    fact: "American Express PANs are 15 digits — not 16. The leading 34 and 37 identify Amex specifically, and the format predates ISO/IEC 7812.",
  },
  "601100": {
    bank: "Discover Financial Services",
    brand: "Discover", network: "Discover Network",
    cardType: "Credit", category: "Standard",
    country: "United States", countryCode: "US", continent: "North America", luhn: true,
    institution: "Commercial bank · National",
    website: "discover.com",
    headquarters: "Riverwoods, IL",
    issued: "1985",
    fact: "Discover PANs begin with 6011. The Discover network was spun out of Sears Roebuck in 1985 and is one of the youngest major card networks.",
  },
};

function formatBin(s: string) {
  return s.split("").join(" ");
}

// ─── PAGE HEADER ────────────────────────────────────────────────────────
function BinHead() {
  return (
    <section className="bin-head">
      <div className="container">
        <nav className="bin-crumb" aria-label="Breadcrumb">
          <Link href="/">CC Checker /edu</Link>
          <span className="sep">/</span>
          <Link href="/#tools">The lab</Link>
          <span className="sep">/</span>
          <span className="cur">T-01 · BIN Lookup</span>
        </nav>
        <div className="bin-title-row">
          <div>
            <div className="bin-title-label">TOOL 01 — EDUCATIONAL · SAMPLE DATA ONLY</div>
            <h1 className="bin-title serif">
              A <em>BIN</em> reveals which institution issued the card.
            </h1>
            <p className="bin-sub">
              Enter any six-digit BIN to read what the issuer registry knows
              about it: bank, network, country, card product. Useful for
              understanding how acquirers route a transaction before a single
              byte of customer data ever moves.
            </p>
          </div>
          <div className="bin-meta">
            <div><strong>Standard</strong> — ISO/IEC 7812</div>
            <div><strong>Sources</strong> — public registries</div>
            <div><strong>Records</strong> — 500+ indexed</div>
            <div><strong>Sample BINs</strong> — 6 included</div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── FORM ────────────────────────────────────────────────────────────────
interface BinFormProps {
  bin: string;
  setBin: (v: string) => void;
  onSubmit: (b: string) => void;
  onSample: (b: string) => void;
  loading: boolean;
}

function BinForm({ bin, setBin, onSubmit, onSample, loading }: BinFormProps) {
  const valid = bin.length === 6;
  const partial = bin.length > 0 && !valid;
  const status = valid ? "valid" : partial ? "partial" : "";

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, "").slice(0, 6);
    setBin(v);
  };
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (valid && !loading) onSubmit(bin);
  };

  return (
    <form className="bin-form-panel" onSubmit={handleSubmit}>
      <div className="form-head">
        <div className="form-head-l">
          <Icon name="glass" size={16} />
          <span className="form-head-tag">Lookup form</span>
        </div>
        <span className="form-head-num">FIG. 02</span>
      </div>

      <label htmlFor="bin" className="field-label">
        <span>BIN code</span>
        <span className="req">required · 6 digits</span>
      </label>
      <div className="bin-input-wrap">
        <input
          id="bin"
          className={`bin-input ${status}`}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="• • • • • •"
          value={bin ? formatBin(bin) : ""}
          onChange={handleChange}
          aria-describedby="bin-help"
          aria-invalid={partial}
        />
        <span className={`bin-status ${status}`}>
          {valid ? (
            <Icon name="check" size={20} />
          ) : partial ? (
            <Icon name="spark" size={16} />
          ) : (
            <span
              style={{
                width: 8,
                height: 8,
                background: "currentColor",
                borderRadius: 0,
                opacity: 0.4,
                display: "inline-block",
              }}
            />
          )}
        </span>
      </div>
      <div className="field-help" id="bin-help">
        <span>Identifies the issuing bank, network &amp; country</span>
        <span className="count">
          <span className={valid ? "ok" : ""}>{bin.length}</span>/6
        </span>
      </div>

      <div className="form-actions">
        <button
          type="submit"
          className="btn btn-primary lookup-btn"
          disabled={!valid || loading}
        >
          {loading ? (
            <>
              <span className="spinner" /> Looking up
            </>
          ) : (
            <>
              Look up <Icon name="arrow" size={14} />
            </>
          )}
        </button>
        <button
          type="button"
          className="btn btn-soft"
          onClick={() => setBin("")}
          disabled={loading}
        >
          Clear
        </button>
      </div>

      <div className="sample-row">
        <div className="sample-label">Try a sample BIN</div>
        <div className="sample-chips">
          {Object.keys(SAMPLE_BINS).map((b) => (
            <button
              key={b}
              type="button"
              className="chip"
              onClick={() => onSample(b)}
              disabled={loading}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      <div className="notice-box">
        <Icon name="lock" size={16} />
        <div>
          <strong>Educational tool.</strong> The registry contains
          public-issuer ranges and curated samples only. There is no path that
          submits a real PAN to a card network.
        </div>
      </div>
    </form>
  );
}

// ─── RESULT STATES ───────────────────────────────────────────────────────
function ResultsDefault() {
  return (
    <div className="results-default">
      <div className="results-default-mark">FIG. 03 — Results panel</div>
      <h2 className="results-default-h serif">
        Awaiting a six-digit <em>BIN</em>.
      </h2>
      <p className="results-default-d">
        Enter a code on the left, or click one of the sample chips. Results
        render here with the institution, network, country, and a teaching note.
      </p>
    </div>
  );
}

function ResultsLoading({ bin }: { bin: string }) {
  return (
    <div className="results-loading">
      <div className="loading-spinner" />
      <div className="loading-text">Querying registry</div>
      <div className="loading-bin">{bin.split("").join(" ")}</div>
    </div>
  );
}

function ResultsError({ bin, onRetry }: { bin: string; onRetry: () => void }) {
  return (
    <div className="results-error">
      <div className="results-error-mark">⚠ NO RECORD FOUND</div>
      <div className="results-error-bin">BIN {bin}</div>
      <h2 className="results-error-h serif">Not in the registry.</h2>
      <p className="results-error-d">
        The API Ninjas registry did not return a record for this BIN. Try one of
        the sample BINs on the left, or read the anatomy section below to
        understand how registry coverage is decided.
      </p>
      <button className="btn btn-ghost" onClick={onRetry}>
        Try a sample
      </button>
    </div>
  );
}

function ResultsRateLimit({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="results-error">
      <div className="results-error-mark">⚠ RATE LIMIT</div>
      <div className="results-error-bin">429</div>
      <h2 className="results-error-h serif">Daily lookup quota reached.</h2>
      <p className="results-error-d">
        The free API tier allows 50 lookups per day. Quota resets at midnight
        UTC. Use the sample BINs on the left to continue exploring — they are
        served from the local educational dataset and don't count against the
        quota.
      </p>
      <button className="btn btn-ghost" onClick={onRetry}>
        Try a sample BIN
      </button>
    </div>
  );
}

function ResultsCard({ bin, data }: { bin: string; data: BinRecord }) {
  const [copied, setCopied] = useState(false);

  const onCopy = () => {
    const text = `BIN ${bin} — ${data.bank}\nBrand: ${data.brand}\nNetwork: ${data.network}\nCard type: ${data.cardType}\nCategory: ${data.category}\nCountry: ${data.country}\nInstitution: ${data.institution}\nWebsite: ${data.website}\nSource: educational sample registry`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const binDigits = bin.split("");

  return (
    <div className="r-card">
      <div className="r-strip">
        <div className="r-strip-bin">{binDigits.join(" ")}</div>
        <div className="r-strip-meta">
          <div className="r-strip-meta-k">Issuer</div>
          <div className="r-strip-meta-v">{data.bank}</div>
        </div>
        <div className="r-strip-stamp">
          <span className="dot" /> Indexed record
        </div>
      </div>

      <div className="r-pan-wrap">
        <div className="r-pan-cap">
          FIG. 04 — Where this BIN sits in a 16-digit PAN{" "}
          <span className="gold">(positions 1–6)</span>
        </div>
        <div className="r-pan">
          <span className="r-pan-grp bin">
            {binDigits.map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </span>
          <span className="r-pan-sep">·</span>
          <span className="r-pan-grp acct">
            {Array.from({ length: 9 }, (_, i) => (
              <span key={i}>•</span>
            ))}
          </span>
          <span className="r-pan-sep">·</span>
          <span className="r-pan-grp chk">?</span>
        </div>
      </div>

      <div className="r-grid">
        <div className="r-cell">
          <div className="r-cell-k">Card brand</div>
          <div className="r-cell-v">{data.brand}</div>
          <div className="r-cell-sub">{data.network}</div>
        </div>
        <div className="r-cell">
          <div className="r-cell-k">Card type</div>
          <div className="r-cell-v">{data.cardType}</div>
          <div className="r-cell-sub">Category · {data.category}</div>
        </div>
        <div className="r-cell">
          <div className="r-cell-k">Country</div>
          <div className="r-cell-v">{data.country}</div>
          <div className="r-cell-sub">ISO 3166 · {data.countryCode}</div>
        </div>
        <div className="r-cell">
          <div className="r-cell-k">Institution</div>
          <div className="r-cell-v" style={{ fontSize: 18 }}>
            {data.institution}
          </div>
          <div className="r-cell-sub">HQ · {data.headquarters}</div>
        </div>
        {data.continent && data.continent !== "—" ? (
          <div className="r-cell">
            <div className="r-cell-k">Region</div>
            <div className="r-cell-v">{data.continent}</div>
            <div className="r-cell-sub">Continent · {data.countryCode}</div>
          </div>
        ) : null}
        {data.luhn !== undefined ? (
          <div className="r-cell">
            <div className="r-cell-k">Luhn check</div>
            <div className="r-cell-v" style={{ color: data.luhn ? "var(--accent)" : "var(--danger, #c0392b)" }}>
              {data.luhn ? "Valid" : "Invalid"}
            </div>
            <div className="r-cell-sub">ISO/IEC 7812 · checksum</div>
          </div>
        ) : null}
        {data.website ? (
          <div className="r-cell">
            <div className="r-cell-k">Website</div>
            <div className="r-cell-v mono">
              <a
                href={`https://${data.website}`}
                target="_blank"
                rel="noreferrer"
              >
                {data.website}
              </a>
            </div>
          </div>
        ) : null}
        {data.issued && data.issued !== "—" ? (
          <div className="r-cell">
            <div className="r-cell-k">Established</div>
            <div className="r-cell-v">{data.issued}</div>
            <div className="r-cell-sub">Source · public corporate record</div>
          </div>
        ) : null}
      </div>

      <div className="r-note">
        <div className="r-note-mark">Field note</div>
        <div className="r-note-body">
          <p>{data.fact}</p>
          <p>
            This record is for educational reference only. Operators must verify
            against the live ISO Register of Issuer Identification Numbers before
            using BIN data in production routing decisions.
          </p>
          <div className="r-note-cite">
            CITATION — ISO/IEC 7812-1:2017 ·{" "}
            <a href="#anatomy">read the standard summary</a>
          </div>
        </div>
      </div>

      <div className="r-actions">
        <button
          className={`btn btn-soft ${copied ? "copied-flash" : ""}`}
          onClick={onCopy}
        >
          <Icon name="pen" size={14} />{" "}
          {copied ? "Copied to clipboard" : "Copy record"}
        </button>
        <a className="btn btn-soft" href="#anatomy">
          <Icon name="book" size={14} /> Read anatomy
        </a>
        <button className="btn btn-soft">
          <Icon name="code" size={14} /> View JSON
        </button>
      </div>
    </div>
  );
}

// ─── ANATOMY ─────────────────────────────────────────────────────────────
function BinAnatomy() {
  const rows = [
    {
      n: "01",
      t: "Major Industry Identifier",
      d: "The first digit of a PAN identifies the industry: 4 means banking & financial (Visa), 5 mostly Mastercard, 3 travel & entertainment (Amex/Diners), 6 merchandising (Discover).",
    },
    {
      n: "02",
      t: "Issuer Identification Number (IIN)",
      d: "Digits 1–6 — what we colloquially call the BIN — are allocated by the network to a specific issuer. ISO/IEC 7812 defines the allocation registry.",
    },
    {
      n: "03",
      t: "Account Identifier",
      d: "Digits 7 through (n-1) are assigned by the issuer to a specific cardholder account. The internal structure varies by issuer and is opaque to the network.",
    },
    {
      n: "04",
      t: "Luhn Check Digit",
      d: "The final digit is computed so the PAN passes the Luhn checksum. It catches transcription errors, not fraud — that's a different layer.",
    },
  ];

  return (
    <section className="bin-anatomy" id="anatomy">
      <div className="container anat-grid">
        <SectionHead
          idx="II"
          eyebrow="Anatomy"
          title={
            <>
              What the digits actually <em>mean</em>.
            </>
          }
        />
        <ul className="anat-list">
          {rows.map((r) => (
            <li className="anat-row" key={r.n}>
              <span className="anat-num">§ {r.n}</span>
              <div>
                <h3 className="anat-h serif">{r.t}</h3>
                <p className="anat-d">{r.d}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ─── FACTS ───────────────────────────────────────────────────────────────
function BinFacts() {
  const facts = [
    { k: "6", l: "Digits in a BIN" },
    { k: "8", l: "Digits under ISO/IEC 7812:2017" },
    { k: "500+", l: "Issuers indexed here" },
    { k: "1960", l: "Year Luhn published the algorithm" },
  ];
  return (
    <section className="bin-facts">
      <div className="container">
        <SectionHead
          idx="III"
          eyebrow="By the numbers"
          title={
            <>
              The <em>shape</em> of the BIN system.
            </>
          }
        />
        <div className="facts-grid">
          {facts.map((f, i) => (
            <div className="fact" key={i}>
              <div className="fact-k serif">{f.k}</div>
              <div className="fact-l">{f.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── RELATED TOOLS ───────────────────────────────────────────────────────
function BinRelated() {
  const tools = [
    {
      ic: "glass" as const,
      n: "T-02",
      t: "Luhn Walkthrough",
      d: "Animate every doubling and modular reduction in the checksum. Recognise valid PAN format on sight.",
      href: "/luhn-walkthrough",
    },
    {
      ic: "shield" as const,
      n: "T-03",
      t: "Pattern Analyzer",
      d: "Read anonymised transaction streams and learn to spot velocity spikes, geo impossibilities, and merchant clustering.",
      href: "/pattern-analyzer",
    },
    {
      ic: "book" as const,
      n: "M-04",
      t: "Module: Compliance",
      d: "PCI DSS v4.0 in plain English — what changes if you store a PAN, what changes if you tokenise.",
      href: "/#pricing",
    },
  ];
  return (
    <section className="bin-related">
      <div className="container">
        <SectionHead
          idx="IV"
          eyebrow="Adjacent"
          title={
            <>
              Tools and modules that <em>compose</em> with this one.
            </>
          }
        />
        <div className="rel-grid">
          {tools.map((t) => (
            <Link className="rel-card" key={t.n} href={t.href}>
              <div className="rel-top">
                <span className="idx">{t.n}</span>
                <span className="rel-icon">
                  <Icon name={t.ic} size={22} />
                </span>
              </div>
              <h3 className="rel-h serif">{t.t}</h3>
              <p className="rel-d">{t.d}</p>
              <span className="btn-link" style={{ alignSelf: "flex-start" }}>
                Open <Icon name="arrow" size={14} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────
export default function BinLookupPage() {
  const [bin, setBin] = useState("");
  const [searched, setSearched] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BinRecord | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isRateLimit, setIsRateLimit] = useState(false);

  const lookup = async (b: string) => {
    setLoading(true);
    setHasError(false);
    setIsRateLimit(false);
    setResult(null);
    setSearched(b);
    try {
      const res = await fetch("/api/check-bin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bin: b }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResult(data as BinRecord);
      } else if (res.status === 429 || data.rateLimit) {
        setIsRateLimit(true);
      } else {
        setHasError(true);
      }
    } catch {
      setHasError(true);
    } finally {
      setLoading(false);
    }
  };

  const onSample = (b: string) => {
    setBin(b);
    lookup(b);
  };

  const onRetry = () => {
    setBin("");
    setSearched(null);
    setHasError(false);
    setIsRateLimit(false);
    setResult(null);
  };

  return (
    <div className="page">
      <Nav />
      <BinHead />
      <section className="bin-work">
        <div className="container bin-grid">
          <BinForm
            bin={bin}
            setBin={setBin}
            onSubmit={lookup}
            onSample={onSample}
            loading={loading}
          />
          <div className="bin-results">
            {!searched && !loading && <ResultsDefault />}
            {loading && <ResultsLoading bin={searched ?? bin} />}
            {!loading && isRateLimit && <ResultsRateLimit onRetry={onRetry} />}
            {!loading && !isRateLimit && hasError && searched && (
              <ResultsError bin={searched} onRetry={onRetry} />
            )}
            {!loading && result && searched && (
              <ResultsCard bin={searched} data={result} />
            )}
          </div>
        </div>
      </section>
      <BinAnatomy />
      <BinFacts />
      <BinRelated />
      <Footer />
    </div>
  );
}
