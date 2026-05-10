"use client";

import { useState } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Icon from "@/components/Icon";

// ─── BIN DATABASE ────────────────────────────────────────────────────────
interface BinEntry {
  prefix: string;
  brand: string;
  length: number;
  cvvLen: number;
  banks: string[];
  levels: string[];
  types: string[];
}

const BIN_DB: BinEntry[] = [
  { prefix: "4", brand: "Visa", length: 16, cvvLen: 3, banks: ["Chase", "Bank of America", "Wells Fargo", "Citibank", "Capital One"], levels: ["Platinum", "Signature", "Infinite", "Traditional", "Rewards"], types: ["Credit", "Debit", "Prepaid"] },
  { prefix: "51", brand: "Mastercard", length: 16, cvvLen: 3, banks: ["JPMorgan Chase", "HSBC", "Barclays", "TD Bank", "US Bank"], levels: ["Standard", "Gold", "Platinum", "World", "World Elite"], types: ["Credit", "Debit"] },
  { prefix: "52", brand: "Mastercard", length: 16, cvvLen: 3, banks: ["Royal Bank of Canada", "Westpac", "Commonwealth Bank", "BNP Paribas", "Deutsche Bank"], levels: ["Standard", "Gold", "Platinum", "World"], types: ["Credit", "Debit"] },
  { prefix: "53", brand: "Mastercard", length: 16, cvvLen: 3, banks: ["Santander", "BBVA", "Itaú", "Scotiabank", "ANZ"], levels: ["Gold", "Platinum", "Black", "Standard"], types: ["Credit", "Debit", "Prepaid"] },
  { prefix: "54", brand: "Mastercard", length: 16, cvvLen: 3, banks: ["DBS Bank", "Standard Chartered", "OCBC Bank", "United Overseas Bank", "Maybank"], levels: ["Platinum", "Gold", "Standard", "Infinite"], types: ["Credit", "Debit"] },
  { prefix: "55", brand: "Mastercard", length: 16, cvvLen: 3, banks: ["Bank of China", "Mizuho Bank", "Mitsubishi UFJ", "Sumitomo Mitsui", "Nomura"], levels: ["Gold", "Platinum", "Standard", "World"], types: ["Credit", "Debit"] },
  { prefix: "34", brand: "American Express", length: 15, cvvLen: 4, banks: ["American Express"], levels: ["Gold", "Platinum", "Centurion", "Blue", "EveryDay"], types: ["Credit", "Charge"] },
  { prefix: "37", brand: "American Express", length: 15, cvvLen: 4, banks: ["American Express"], levels: ["Gold", "Platinum", "Centurion", "Blue Cash", "Green"], types: ["Credit", "Charge"] },
  { prefix: "6011", brand: "Discover", length: 16, cvvLen: 3, banks: ["Discover Bank", "Pulse Network"], levels: ["Standard", "Miles", "Cashback", "Business"], types: ["Credit", "Debit"] },
  { prefix: "65", brand: "Discover", length: 16, cvvLen: 3, banks: ["Discover Bank", "Pulse Network"], levels: ["Standard", "Miles", "Cashback", "Navy Federal"], types: ["Credit", "Debit"] },
  { prefix: "35", brand: "JCB", length: 16, cvvLen: 3, banks: ["JCB International", "MUFG Bank", "Sumitomo Mitsui"], levels: ["Standard", "Gold", "Platinum"], types: ["Credit"] },
  { prefix: "36", brand: "Diners Club", length: 16, cvvLen: 3, banks: ["Diners Club International", "Discover Financial"], levels: ["Standard", "Gold", "Platinum"], types: ["Credit", "Charge"] },
  { prefix: "30", brand: "Diners Club", length: 16, cvvLen: 3, banks: ["Diners Club International", "Citibank"], levels: ["Standard", "Gold", "Platinum"], types: ["Credit", "Charge"] },
  { prefix: "6060", brand: "Hipercard", length: 16, cvvLen: 3, banks: ["Banco Itaú", "Hipercard Brasil"], levels: ["Standard", "Gold", "Platinum"], types: ["Credit"] },
  { prefix: "3841", brand: "Hipercard", length: 16, cvvLen: 3, banks: ["Banco Itaú", "Hipercard Brasil"], levels: ["Standard", "Gold"], types: ["Credit"] },
];

// ─── NAMES & LOCATIONS ───────────────────────────────────────────────────
const FIRST_NAMES = ["James","Maria","Carlos","Aisha","Liam","Sophia","Noah","Olivia","Ethan","Emma","Lucas","Isabella","Mason","Mia","Logan","Charlotte","Oliver","Amelia","Elijah","Harper","Alexander","Evelyn","Daniel","Abigail","Henry","Emily","Jackson","Ella","Sebastian","Avery","Jack","Scarlett","Owen","Grace","Gabriel","Chloe","Samuel","Victoria","David","Riley","Joseph","Aria","Carter","Lily","John","Aurora","Wyatt","Zoey","Matthew","Nora","Leo","Camila","Luke","Penelope","Julian","Layla","Nathan","Stella","Grayson","Hannah","Adam","Sofia","Lincoln","Ellie","Isaac","Paisley","Ryan","Audrey","Anthony","Maya","Hudson","Naomi","Dylan","Sydney","Eli","Luna","Ezra","Kinsley","Landon","Kennedy","Nolan","Brielle","Hunter","Alexa","Connor","Ruby","Adrian","Eva","Asher","Aaliyah","Aaron","Madelyn","Jordan","Elena","Devin","Gabriella","Ezra","Melody"];
const LAST_NAMES = ["Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Rodriguez","Martinez","Hernandez","Lopez","Gonzalez","Wilson","Anderson","Thomas","Taylor","Moore","Jackson","Martin","Lee","Perez","Thompson","White","Harris","Sanchez","Clark","Ramirez","Lewis","Robinson","Walker","Young","Allen","King","Wright","Scott","Torres","Nguyen","Hill","Flores","Green","Adams","Nelson","Baker","Hall","Rivera","Campbell","Mitchell","Carter","Roberts","Gomez","Phillips","Evans","Turner","Diaz","Parker","Cruz","Edwards","Collins","Reyes","Stewart","Morris","Morales","Murphy","Cook","Rogers","Gutierrez","Ortiz","Morgan","Cooper","Peterson","Bailey","Reed","Kelly","Howard","Ramos","Kim","Cox","Ward","Richardson","Watson","Brooks","Chavez","Wood","James","Bennett","Gray","Mendoza","Ruiz","Hughes","Price","Alvarez","Castillo","Sanders","Patel","Myers","Long","Ross","Foster","Jimenez"];
const CITIES: Record<string, string[]> = {
  US: ["New York","Los Angeles","Chicago","Houston","Phoenix","Philadelphia","San Antonio","San Diego","Dallas","San Jose","Austin","Jacksonville","Fort Worth","Columbus","Charlotte","Indianapolis","San Francisco","Seattle","Denver","Nashville","Portland","Miami","Atlanta","Boston","Detroit","Minneapolis","Tampa","Baltimore","St. Louis","Las Vegas","Kansas City","Cleveland","Cincinnati","Orlando","Sacramento","Pittsburgh","Buffalo"],
  GB: ["London","Manchester","Birmingham","Leeds","Glasgow","Liverpool","Edinburgh","Bristol","Sheffield","Newcastle","Nottingham","Leicester","Southampton","Oxford","Cambridge","Brighton","Cardiff","Belfast","York","Bath"],
  CA: ["Toronto","Montreal","Vancouver","Calgary","Edmonton","Ottawa","Winnipeg","Quebec City","Hamilton","Halifax","London","Victoria","Kitchener","Waterloo","Mississauga"],
  AU: ["Sydney","Melbourne","Brisbane","Perth","Adelaide","Gold Coast","Newcastle","Canberra","Hobart","Darwin","Townsville","Geelong","Cairns"],
  BR: ["São Paulo","Rio de Janeiro","Brasília","Salvador","Fortaleza","Belo Horizonte","Manaus","Curitiba","Recife","Porto Alegre","Campinas","Santos","Natal"],
  JP: ["Tokyo","Osaka","Yokohama","Nagoya","Sapporo","Fukuoka","Kyoto","Kobe","Kawasaki","Saitama","Hiroshima","Sendai"],
  DE: ["Berlin","Hamburg","Munich","Cologne","Frankfurt","Stuttgart","Düsseldorf","Leipzig","Dresden","Bonn","Nuremberg","Bremen"],
  FR: ["Paris","Marseille","Lyon","Toulouse","Nice","Nantes","Strasbourg","Montpellier","Bordeaux","Lille","Rennes","Grenoble"],
  SG: ["Singapore","Jurong East","Woodlands","Tampines","Pasir Ris"],
  HK: ["Hong Kong","Kowloon","Tsuen Wan","Sha Tin","Tuen Mun"],
  CH: ["Zurich","Geneva","Basel","Bern","Lausanne","Winterthur","Lucerne","St. Gallen"],
  NL: ["Amsterdam","Rotterdam","The Hague","Utrecht","Eindhoven","Groningen","Maastricht","Leiden"],
  ES: ["Madrid","Barcelona","Valencia","Seville","Zaragoza","Malaga","Murcia","Palma","Bilbao","Alicante"],
  IT: ["Rome","Milan","Naples","Turin","Palermo","Genoa","Florence","Bologna","Catania","Venice"],
  SE: ["Stockholm","Gothenburg","Malmo","Uppsala","Linköping","Västerås","Örebro","Helsingborg"],
  NO: ["Oslo","Bergen","Trondheim","Stavanger","Drammen","Fredrikstad","Kristiansand"],
  DK: ["Copenhagen","Aarhus","Odense","Aalborg","Esbjerg","Randers","Kolding"],
  FI: ["Helsinki","Espoo","Tampere","Vantaa","Turku","Oulu","Lahti"],
  IN: ["Mumbai","Delhi","Bangalore","Hyderabad","Chennai","Kolkata","Ahmedabad","Pune","Jaipur","Lucknow","Surat","Nagpur","Indore"],
  CN: ["Beijing","Shanghai","Guangzhou","Shenzhen","Chengdu","Hangzhou","Nanjing","Wuhan","Xi'an","Chongqing","Suzhou","Tianjin"],
};
const COUNTRIES: Record<string, string> = {
  US: "United States", GB: "United Kingdom", CA: "Canada", AU: "Australia",
  BR: "Brazil", JP: "Japan", DE: "Germany", FR: "France",
  SG: "Singapore", HK: "Hong Kong", CH: "Switzerland", NL: "Netherlands",
  ES: "Spain", IT: "Italy", SE: "Sweden", NO: "Norway",
  DK: "Denmark", FI: "Finland", IN: "India", CN: "China",
};

// ─── CORE HELPERS ────────────────────────────────────────────────────────
function luhnCheckDigit(partial: string): number {
  let sum = 0;
  let even = true;
  for (let i = partial.length - 1; i >= 0; i--) {
    let d = Number(partial[i]);
    if (even) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
    even = !even;
  }
  return (10 - (sum % 10)) % 10;
}

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min: number, max: number): number { return Math.floor(Math.random() * (max - min + 1)) + min; }
function formatPan(num: string): string { return num.replace(/(\d{4})(?=\d)/g, "$1 "); }

// ─── TYPES ───────────────────────────────────────────────────────────────
interface GeneratedCard {
  cardNumber: string;
  pan: string;
  expiryDate: string;
  cvv: string;
  bank: string;
  type: string;
  network: string;
  country: string;
  level: string;
  holder: string;
  city: string;
  bin: string;
}

interface BinLookupResult {
  bank: string;
  brand: string;
  cardType: string;
  country: string;
}

// ─── GENERATION LOGIC ────────────────────────────────────────────────────
const NETWORK_BRAND: Record<string, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "American Express",
  discover: "Discover",
};

function makeFallbackEntry(bin: string): BinEntry {
  const two = bin.slice(0, 2);
  if (bin[0] === "4") return { prefix: "4", brand: "Visa", length: 16, cvvLen: 3, banks: [], levels: ["Standard"], types: ["Credit"] };
  if (["51","52","53","54","55"].includes(two)) return { prefix: two, brand: "Mastercard", length: 16, cvvLen: 3, banks: [], levels: ["Standard"], types: ["Credit"] };
  if (["34","37"].includes(two)) return { prefix: two, brand: "American Express", length: 15, cvvLen: 4, banks: [], levels: ["Standard"], types: ["Credit"] };
  if (two === "60" || two === "65") return { prefix: two, brand: "Discover", length: 16, cvvLen: 3, banks: [], levels: ["Standard"], types: ["Credit"] };
  return { prefix: bin[0], brand: "Unknown", length: 16, cvvLen: 3, banks: [], levels: ["Standard"], types: ["Credit"] };
}

function resolveEntry(bin: string): BinEntry {
  return BIN_DB.find(e => bin.startsWith(e.prefix)) ?? makeFallbackEntry(bin);
}

function buildCard(
  sixDigitBin: string,
  entry: BinEntry,
  overrides?: Partial<Pick<GeneratedCard, "bank" | "type" | "network" | "country">>
): GeneratedCard {
  const middleLen = entry.length - 7;
  let partial = sixDigitBin;
  for (let i = 0; i < middleLen; i++) partial += String(randInt(0, 9));
  const pan = partial + luhnCheckDigit(partial);

  const now = new Date();
  const expM = String(randInt(1, 12)).padStart(2, "0");
  const expY = String(randInt(now.getFullYear() + 1, now.getFullYear() + 5)).slice(2);
  const cvv = String(randInt(0, Math.pow(10, entry.cvvLen) - 1)).padStart(entry.cvvLen, "0");

  const cCode = pick(Object.keys(COUNTRIES));

  return {
    cardNumber: formatPan(pan),
    pan,
    expiryDate: `${expM}/${expY}`,
    cvv,
    bank: overrides?.bank ?? (entry.banks.length > 0 ? pick(entry.banks) : "—"),
    type: overrides?.type ?? (entry.types.length > 0 ? pick(entry.types) : "Credit"),
    network: overrides?.network ?? entry.brand,
    country: overrides?.country ?? COUNTRIES[cCode],
    level: entry.levels.length > 0 ? pick(entry.levels) : "Standard",
    holder: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
    city: pick(CITIES[cCode] ?? ["—"]),
    bin: pan.slice(0, 6),
  };
}

// ─── SAMPLE BINS ────────────────────────────────────────────────────────
const SAMPLE_BINS = [
  { label: "Visa", bin: "453214" },
  { label: "Mastercard", bin: "543210" },
  { label: "Amex", bin: "371449" },
  { label: "Discover", bin: "601100" },
  { label: "JCB", bin: "353011" },
  { label: "Diners", bin: "361410" },
];

// ─── PAGE COMPONENT ──────────────────────────────────────────────────────
export default function CcGeneratorPage() {
  const [tab, setTab] = useState<"random" | "bin">("random");
  const [network, setNetwork] = useState("all");
  const [quantity, setQuantity] = useState("10");
  const [customQty, setCustomQty] = useState("");
  const [binInput, setBinInput] = useState("");
  const [binLookup, setBinLookup] = useState<BinLookupResult | null>(null);
  const [binLoading, setBinLoading] = useState(false);
  const [cards, setCards] = useState<GeneratedCard[]>([]);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  function getCount(): number {
    if (quantity === "custom") {
      const n = parseInt(customQty);
      return isNaN(n) ? 10 : Math.min(Math.max(n, 1), 100);
    }
    return parseInt(quantity);
  }

  function onTabChange(t: "random" | "bin") {
    setTab(t);
    setCards([]);
    setError("");
    setBinLookup(null);
    setBinInput("");
  }

  function onGenerateRandom() {
    setError("");
    const pool = network === "all" ? BIN_DB : BIN_DB.filter(e => e.brand === NETWORK_BRAND[network]);
    if (!pool.length) { setError("No BIN entries for selected network."); return; }
    const count = getCount();
    const result: GeneratedCard[] = [];
    for (let i = 0; i < count; i++) {
      const entry = pick(pool);
      let bin = entry.prefix;
      while (bin.length < 6) bin += String(randInt(0, 9));
      result.push(buildCard(bin, entry));
    }
    setCards(result);
  }

  async function onValidateBin() {
    const cleaned = binInput.replace(/\D/g, "").slice(0, 6);
    if (cleaned.length !== 6) { setError("Enter exactly 6 digits."); return; }
    setError("");
    setBinLoading(true);
    try {
      const res = await fetch("/api/check-bin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bin: cleaned }),
      });
      const data = await res.json();
      if (res.ok) {
        setBinLookup({ bank: data.bank, brand: data.brand, cardType: data.cardType, country: data.country });
      } else {
        setError(data.error || "BIN not found.");
        setBinLookup(null);
      }
    } catch {
      setError("Lookup failed. Check your connection.");
      setBinLookup(null);
    } finally {
      setBinLoading(false);
    }
  }

  function onGenerateBin() {
    const cleaned = binInput.replace(/\D/g, "").slice(0, 6);
    if (cleaned.length !== 6) { setError("Enter exactly 6 digits."); return; }
    setError("");
    const entry = resolveEntry(cleaned);
    const overrides = binLookup ? {
      bank: binLookup.bank,
      type: binLookup.cardType,
      country: binLookup.country,
      network: binLookup.brand,
    } : undefined;
    const count = getCount();
    const result: GeneratedCard[] = [];
    for (let i = 0; i < count; i++) result.push(buildCard(cleaned, entry, overrides));
    setCards(result);
  }

  async function onCopyAll() {
    if (!cards.length) return;
    const text = cards.map(c => `${c.cardNumber} | ${c.expiryDate} | ${c.cvv} | ${c.bank}`).join("\n");
    await navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function onExportCSV() {
    const rows = [
      ["Card Number", "Expiry", "CVV", "Bank", "Type", "Network", "Country"],
      ...cards.map(c => [c.cardNumber, c.expiryDate, c.cvv, c.bank, c.type, c.network, c.country]),
    ];
    dl(rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n"), `cards_${Date.now()}.csv`, "text/csv");
  }

  function onExportJSON() {
    const payload = cards.map(({ cardNumber, expiryDate, cvv, bank, type, network, country }) =>
      ({ cardNumber, expiryDate, cvv, bank, type, network, country })
    );
    dl(JSON.stringify(payload, null, 2), `cards_${Date.now()}.json`, "application/json");
  }

  function dl(content: string, name: string, mime: string) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), { href: url, download: name });
    a.click();
    URL.revokeObjectURL(url);
  }

  const sel: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    border: "1.5px solid var(--border)",
    borderRadius: 10,
    background: "var(--surface)",
    color: "var(--ink)",
    fontSize: 14,
    fontFamily: "var(--font-body)",
    outline: "none",
    cursor: "pointer",
  };

  const binCleaned = binInput.replace(/\D/g, "");

  return (
    <div className="cg-page">
      <Nav />
      <main>
        {/* ─── HEADER ─────────────────────────────────────────────────── */}
        <section className="bin-head">
          <div className="container">
            <nav className="bin-crumb" aria-label="Breadcrumb">
              <Link href="/">CC Checker /edu</Link>
              <span className="sep">/</span>
              <Link href="/#tools">The lab</Link>
              <span className="sep">/</span>
              <span className="cur">T-04 · CC Generator</span>
            </nav>
            <div className="bin-title-row">
              <div>
                <div className="bin-title-label">TOOL 04 — EDUCATIONAL · SYNTHETIC DATA ONLY</div>
                <h1 className="bin-title serif">
                  Generate <em>valid</em> card numbers for testing.
                </h1>
                <p className="bin-sub">
                  Create Luhn-valid PANs with realistic issuer details. Choose
                  random generation or enter a BIN. All data is synthetic — never
                  used for real transactions.
                </p>
              </div>
              <div className="bin-meta">
                <div><strong>Method</strong> — Luhn check digit</div>
                <div><strong>BINs</strong> — 16 ranges indexed</div>
                <div><strong>Output</strong> — Batch card table</div>
                <div><strong>Standard</strong> — ISO/IEC 7812</div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── MAIN WORK ──────────────────────────────────────────────── */}
        <section className="cg-work">
          <div className="container">

            {/* Form panel */}
            <div className="cg-panel" style={{ marginBottom: 24 }}>
              <div className="cg-panel-head">
                <div className="cg-panel-head-l">
                  <Icon name="spark" size={16} />
                  <span className="cg-panel-tag">Generation mode</span>
                </div>
                <span className="cg-panel-num">FIG. 01</span>
              </div>

              <div className="cg-tabs">
                <button
                  type="button"
                  className={`cg-tab${tab === "random" ? " active" : ""}`}
                  onClick={() => onTabChange("random")}
                >
                  <Icon name="spark" size={14} /> Random CC
                </button>
                <button
                  type="button"
                  className={`cg-tab${tab === "bin" ? " active" : ""}`}
                  onClick={() => onTabChange("bin")}
                >
                  <Icon name="glass" size={14} /> BIN Generator
                </button>
              </div>

              {/* ── RANDOM FORM ── */}
              {tab === "random" && (
                <div style={{ paddingTop: 8 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <label className="cg-label">Card Network</label>
                      <select value={network} onChange={e => setNetwork(e.target.value)} style={sel}>
                        <option value="all">All Networks (Random)</option>
                        <option value="visa">Visa</option>
                        <option value="mastercard">Mastercard</option>
                        <option value="amex">American Express</option>
                        <option value="discover">Discover</option>
                      </select>
                    </div>
                    <div>
                      <label className="cg-label">Number of Cards</label>
                      <select value={quantity} onChange={e => setQuantity(e.target.value)} style={sel}>
                        <option value="10">10 Cards</option>
                        <option value="20">20 Cards</option>
                        <option value="50">50 Cards</option>
                        <option value="custom">Custom (1–100)</option>
                      </select>
                      {quantity === "custom" && (
                        <input
                          type="number"
                          min="1"
                          max="100"
                          placeholder="Enter number (1–100)"
                          value={customQty}
                          onChange={e => setCustomQty(e.target.value)}
                          style={{ marginTop: 8, ...sel }}
                        />
                      )}
                    </div>
                  </div>
                  <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
                    <button type="button" className="btn btn-primary cg-gen-btn" onClick={onGenerateRandom}>
                      <Icon name="spark" size={15} /> Generate Cards
                    </button>
                  </div>
                </div>
              )}

              {/* ── BIN FORM ── */}
              {tab === "bin" && (
                <div style={{ paddingTop: 8 }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
                    <div style={{ flex: "0 0 auto" }}>
                      <label className="cg-label" htmlFor="cg-bin-in">BIN Code</label>
                      <div className="cg-input-wrap">
                        <input
                          id="cg-bin-in"
                          type="text"
                          inputMode="numeric"
                          autoComplete="off"
                          placeholder="453214"
                          value={binInput}
                          onChange={e => {
                            setBinInput(e.target.value.replace(/\D/g, "").slice(0, 6));
                            setBinLookup(null);
                          }}
                        />
                        <span className="cg-count">{binCleaned.length}/6</span>
                      </div>
                    </div>
                    <div>
                      <button
                        type="button"
                        className="btn btn-soft"
                        onClick={onValidateBin}
                        disabled={binLoading || binCleaned.length !== 6}
                        style={{ whiteSpace: "nowrap" }}
                      >
                        {binLoading ? "Looking up…" : "Validate BIN"}
                      </button>
                    </div>
                    <div style={{ flex: "1 1 160px" }}>
                      <label className="cg-label">Number of Cards</label>
                      <select value={quantity} onChange={e => setQuantity(e.target.value)} style={sel}>
                        <option value="10">10 Cards</option>
                        <option value="20">20 Cards</option>
                        <option value="50">50 Cards</option>
                        <option value="custom">Custom (1–100)</option>
                      </select>
                    </div>
                    <div>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={onGenerateBin}
                        disabled={binCleaned.length !== 6}
                        style={{ whiteSpace: "nowrap" }}
                      >
                        <Icon name="spark" size={15} /> Generate
                      </button>
                    </div>
                  </div>

                  {quantity === "custom" && (
                    <input
                      type="number"
                      min="1"
                      max="100"
                      placeholder="Enter number (1–100)"
                      value={customQty}
                      onChange={e => setCustomQty(e.target.value)}
                      style={{ marginTop: 8, width: 220, ...sel }}
                    />
                  )}

                  <div className="cg-sample-chips" style={{ marginTop: 12 }}>
                    {SAMPLE_BINS.map(s => (
                      <button
                        key={s.bin}
                        type="button"
                        className="cg-chip"
                        onClick={() => { setBinInput(s.bin); setBinLookup(null); setError(""); }}
                      >
                        {s.label} <span>{s.bin}</span>
                      </button>
                    ))}
                  </div>

                  {binLookup && (
                    <div style={{ marginTop: 16, padding: "14px 16px", background: "var(--accent-tint)", border: "1.5px solid var(--accent-soft)", borderRadius: 10 }}>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 10 }}>
                        BIN Lookup Result
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12 }}>
                        {([["Bank", binLookup.bank], ["Country", binLookup.country], ["Network", binLookup.brand], ["Type", binLookup.cardType]] as [string, string][]).map(([l, v]) => (
                          <div key={l}>
                            <div style={{ fontSize: 11, color: "var(--ink-soft)", marginBottom: 3 }}>{l}</div>
                            <div style={{ fontWeight: 600, fontSize: 14 }}>{v || "—"}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {error && <div className="cg-error" style={{ marginTop: 12 }}>{error}</div>}
            </div>

            {/* Results table */}
            {cards.length > 0 && (
              <div className="cg-panel">
                <div className="cg-panel-head">
                  <div className="cg-panel-head-l">
                    <Icon name="grid" size={16} />
                    <span className="cg-panel-tag">Generated cards</span>
                  </div>
                  <span className="cg-panel-num">{cards.length} cards</span>
                </div>

                <div style={{ overflowX: "auto", marginBottom: 16 }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid var(--border)" }}>
                        {["#", "Card Number", "Expiry", "CVV", "Bank", "Type", "Network", "Country"].map(h => (
                          <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-soft)", whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {cards.map((c, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid var(--border-soft)" }}>
                          <td style={{ padding: "9px 12px", color: "var(--ink-soft)", fontFamily: "var(--font-mono)", fontSize: 12 }}>{i + 1}</td>
                          <td style={{ padding: "9px 12px", fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 14, letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{c.cardNumber}</td>
                          <td style={{ padding: "9px 12px", fontFamily: "var(--font-mono)" }}>{c.expiryDate}</td>
                          <td style={{ padding: "9px 12px", fontFamily: "var(--font-mono)" }}>{c.cvv}</td>
                          <td style={{ padding: "9px 12px" }}>{c.bank}</td>
                          <td style={{ padding: "9px 12px" }}>{c.type}</td>
                          <td style={{ padding: "9px 12px" }}>{c.network}</td>
                          <td style={{ padding: "9px 12px" }}>{c.country}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: "1px solid var(--border-soft)" }}>
                  <span style={{ fontSize: 13, color: "var(--ink-soft)" }}>
                    Generated: <strong style={{ color: "var(--ink)" }}>{cards.length} cards</strong>
                  </span>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button type="button" className="btn btn-soft" onClick={onCopyAll}>
                      <Icon name={copied ? "check" : "pen"} size={14} />
                      {copied ? "Copied!" : "Copy All"}
                    </button>
                    <button type="button" className="btn btn-soft" onClick={onExportCSV}>Export CSV</button>
                    <button type="button" className="btn btn-soft" onClick={onExportJSON}>Export JSON</button>
                    <button type="button" className="btn btn-soft" onClick={() => setCards([])}>Clear</button>
                  </div>
                </div>

                <div style={{ marginTop: 16, padding: "12px 16px", background: "var(--gold-soft)", border: "1.5px solid var(--border)", borderRadius: 10, fontSize: 13, color: "var(--ink-2)", display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <Icon name="lock" size={15} />
                  <span>
                    <strong>Educational use only.</strong> These are synthetic test cards.
                    Do not use with real payment processors or for any fraudulent activities.
                  </span>
                </div>
              </div>
            )}

            {/* Empty state */}
            {cards.length === 0 && (
              <div className="cg-panel cg-empty">
                <div className="cg-empty-icon"><Icon name="cap" size={48} stroke={1.2} /></div>
                <h2 className="cg-empty-title serif">Ready to generate</h2>
                <p className="cg-empty-desc">
                  Configure generation options above and click <strong>Generate Cards</strong> to create
                  a batch of Luhn-valid synthetic test cards.
                </p>
              </div>
            )}

          </div>
        </section>

        {/* ─── EDUCATIONAL INFO ────────────────────────────────────────── */}
        <section className="cg-info">
          <div className="container">
            <div className="cg-info-grid-full">
              <div className="cg-info-card">
                <div className="cg-info-icon"><Icon name="spark" size={20} /></div>
                <h3 className="serif">Luhn Check Digit</h3>
                <p>Every generated PAN ends with a valid Luhn digit. The algorithm doubles every second digit from the right, sums them, and computes <code>(10 - sum % 10) % 10</code>.</p>
              </div>
              <div className="cg-info-card">
                <div className="cg-info-icon"><Icon name="network" size={20} /></div>
                <h3 className="serif">BIN Routing</h3>
                <p>The first 6 digits identify the issuer and network. Our database maps 16 BIN ranges across 10 brands — Visa, Mastercard, Amex, Discover, JCB, Diners, Hipercard, and more.</p>
              </div>
              <div className="cg-info-card">
                <div className="cg-info-icon"><Icon name="lock" size={20} /></div>
                <h3 className="serif">Synthetic Only</h3>
                <p>All generated numbers are educational samples. They pass Luhn but are not registered with any network. Never use generated numbers for real transactions.</p>
              </div>
            </div>
            <div className="cg-disclaimer">
              <Icon name="lock" size={16} />
              <span>
                <strong>Educational tool.</strong> CC Generator produces synthetic card data for
                learning and testing. Generated numbers are not associated with any real account
                and cannot be used for transactions. Always comply with PCI DSS requirements
                when handling card data.
              </span>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
