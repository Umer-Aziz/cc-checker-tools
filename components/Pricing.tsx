import Icon from "./Icon";
import SectionHead from "./SectionHead";

const TIERS = [
  {
    n: "Auditor",
    p: "$0",
    per: "free, forever",
    d: "Sample chapters, the BIN explorer with daily limits, and the public Luhn walkthrough.",
    f: [
      "First 3 modules",
      "5 BIN searches per day",
      "Read-only case files",
      "Community Q&A",
    ],
    cta: "Start auditing",
    hl: false,
  },
  {
    n: "Student",
    p: "$9.99",
    per: "per month",
    d: "The full self-paced track with code labs, certificate of completion, and unlimited tool access.",
    f: [
      "All 12 modules",
      "Unlimited BIN searches",
      "Luhn lab + code labs",
      "Certificate of completion",
      "Email support",
    ],
    cta: "Enrol",
    hl: true,
  },
  {
    n: "Faculty",
    p: "$99.99",
    per: "per month",
    d: "For universities and risk teams: classroom seats, custom case studies, and instructor materials.",
    f: [
      "Everything in Student",
      "5 instructor + 50 seats",
      "Custom case studies",
      "LMS integration (LTI)",
      "1-on-1 onboarding",
    ],
    cta: "Talk to faculty",
    hl: false,
  },
];

export default function Pricing() {
  return (
    <section className="pricing rule-band" id="pricing">
      <div className="container">
        <SectionHead
          idx="VII"
          eyebrow="Tuition"
          title={
            <>
              Three tiers. <em>No</em> usage-based gotchas.
            </>
          }
        />
        <div className="tier-grid">
          {TIERS.map((t, i) => (
            <article className={`tier card ${t.hl ? "hl" : ""}`} key={i}>
              {t.hl && <div className="tier-flag mono">— most enrolled —</div>}
              <div className="tier-head">
                <h3 className="tier-n serif">{t.n}</h3>
                <p className="tier-d">{t.d}</p>
              </div>
              <div className="tier-price">
                <span className="tier-p serif">{t.p}</span>
                <span className="tier-per mono">{t.per}</span>
              </div>
              <ul className="tier-list">
                {t.f.map((x, j) => (
                  <li key={j}>
                    <Icon name="check" size={14} /> {x}
                  </li>
                ))}
              </ul>
              <a
                className={`btn ${t.hl ? "btn-primary" : "btn-ghost"} tier-cta`}
                href="#enroll"
              >
                {t.cta} <Icon name="arrow" size={14} />
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
