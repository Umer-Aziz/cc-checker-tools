import Link from "next/link";
import Icon from "./Icon";
import SectionHead from "./SectionHead";

const TOOLS = [
  {
    n: "T-01",
    t: "BIN Lookup",
    d: "Search the educational index by BIN. Returns issuer, country, network, and card product — with everything sourced from public registries.",
    bullets: [
      "Public-registry data only",
      "Filter by country / network",
      "Citations on every record",
    ],
    cta: "Open explorer",
    href: "/bin-lookup",
  },
  {
    n: "T-02",
    t: "Luhn Walkthrough",
    d: "Paste a sample number and watch each step of the checksum render in real time. Read the maths, not just the verdict.",
    bullets: [
      "Step-by-step animation",
      "Test vectors included",
      "Visual modular arithmetic",
    ],
    cta: "Open lab",
    href: "/luhn-walkthrough",
  },
  {
    n: "T-03",
    t: "Pattern Analyzer",
    d: "Read anonymised transaction streams and learn to spot velocity spikes, geographic impossibilities, and merchant clustering.",
    bullets: [
      "Synthetic data sets",
      "Detection rule scaffolding",
      "Annotated case files",
    ],
    cta: "Open notebook",
    href: "/pattern-analyzer",
  },
  {
    n: "T-04",
    t: "CC Generator",
    d: "Generate Luhn-valid card numbers for testing. Random mode or enter a BIN. Realistic issuer details with every card.",
    bullets: [
      "Luhn check digit",
      "BIN-based generation",
      "Full card details",
    ],
    cta: "Open generator",
    href: "/cc-generator",
  },
];

export default function Tools() {
  return (
    <section className="tools" id="tools">
      <div className="container">
        <SectionHead
          idx="IV"
          eyebrow="The lab"
          title={
            <>
              Four teaching tools. <em>Sample data</em> only — no real cards,
              no live charging.
            </>
          }
        />
        <div className="tools-grid">
          {TOOLS.map((t, i) => (
            <article className="tool card" key={i}>
              <div className="tool-top">
                <span className="idx">{t.n}</span>
                <span className="pill">Educational</span>
              </div>
              <h3 className="tool-t serif">{t.t}</h3>
              <p className="tool-d">{t.d}</p>
              <ul className="tool-list">
                {t.bullets.map((b, j) => (
                  <li key={j}>
                    <Icon name="check" size={14} /> {b}
                  </li>
                ))}
              </ul>
              <div className="tool-foot">
                <Link className="btn btn-soft" href={t.href}>
                  {t.cta} <Icon name="arrow" size={14} />
                </Link>
              </div>
            </article>
          ))}
        </div>
        <div className="tools-disclaimer">
          <Icon name="lock" size={16} />
          <span>
            All tools operate on synthetic or publicly registered sample data.
            The platform never accepts a real PAN, never contacts a card
            network, and never attempts to authorise a transaction.
          </span>
        </div>
      </div>
    </section>
  );
}
