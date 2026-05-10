import Link from "next/link";
import Icon from "./Icon";
import SectionHead from "./SectionHead";

const ITEMS = [
  {
    ic: "db" as const,
    n: "01",
    t: "BIN Database Explorer",
    b: "Educational",
    d: "Browse a reference index of 500+ issuing banks. Understand how the first six digits of a PAN map to an institution, country, and card product.",
    href: "/bin-lookup",
  },
  {
    ic: "glass" as const,
    n: "02",
    t: "Luhn Algorithm Lab",
    b: "Interactive",
    d: "Step through the doubling-and-summing checksum. Watch each transformation animate as the algorithm decides whether a number is well-formed.",
    href: "#tools",
  },
  {
    ic: "shield" as const,
    n: "03",
    t: "Detection Mechanisms",
    b: "Industry",
    d: "Velocity rules, geographic anomalies, behavioural baselines. Learn the layered defences issuers run before authorising a transaction.",
    href: "#tools",
  },
  {
    ic: "chart" as const,
    n: "04",
    t: "Anonymised Case Studies",
    b: "Field Notes",
    d: "Read post-mortems from real fraud rings (with all PII scrubbed). Trace how analysts spotted the signal in the noise.",
    href: "#enroll",
  },
  {
    ic: "code" as const,
    n: "05",
    t: "Implementation Guide",
    b: "Code",
    d: "Reference implementations of Luhn and BIN parsing in Python, JavaScript, and Go. Built for learning — not production payments.",
    href: "#enroll",
  },
  {
    ic: "lock" as const,
    n: "06",
    t: "Compliance Primer",
    b: "Standards",
    d: "Plain-English walkthrough of PCI DSS v4.0, tokenisation patterns, and what 'never store the CVV' means in practice.",
    href: "#enroll",
  },
];

export default function Features() {
  return (
    <section className="features rule-band" id="features">
      <div className="container">
        <SectionHead
          idx="II"
          eyebrow="Curriculum"
          title={
            <>
              Six modules. One coherent <em>map</em> of how the rails actually
              work.
            </>
          }
        />
        <div className="feat-grid">
          {ITEMS.map((f, i) => (
            <article className="feat card" key={i}>
              <div className="feat-top">
                <span className="idx">§ {f.n}</span>
                <span className="pill">{f.b}</span>
              </div>
              <div className="feat-icon">
                <Icon name={f.ic} size={26} stroke={1.4} />
              </div>
              <h3 className="feat-t serif">{f.t}</h3>
              <p className="feat-d">{f.d}</p>
              <Link className="btn-link" href={f.href}>
                Open module <Icon name="arrow" size={14} />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
