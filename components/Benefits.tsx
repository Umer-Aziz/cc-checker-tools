import SectionHead from "./SectionHead";

const ITEMS = [
  {
    t: "A career path",
    d: "Fraud-prevention roles are growing 18% YoY. The vocabulary in this curriculum is the vocabulary of the interview.",
  },
  {
    t: "Builder fluency",
    d: "Stop guessing why your Stripe webhook returned a CVV mismatch. Read the failure as a network signal.",
  },
  {
    t: "Compliance literacy",
    d: "PCI DSS reads like an alien dialect. We translate. By module four it sounds like English.",
  },
  {
    t: "Detection intuition",
    d: "Velocity, geo, behavioural — learn the layers as a system instead of a checklist.",
  },
  {
    t: "Standards anchored",
    d: "Every claim cites ISO, ANSI, EMVCo, or NIST. No folklore, no carder forum lore.",
  },
  {
    t: "Educational, period",
    d: "If you came here to test stolen cards, leave. We cooperate fully with abuse reports and law enforcement.",
  },
];

export default function Benefits() {
  return (
    <section className="benefits rule-band" id="benefits">
      <div className="container benefits-grid">
        <aside className="benefits-side">
          <SectionHead
            idx="V"
            eyebrow="Why bother"
            title={
              <>
                The discipline that keeps the <em>rails</em> trustworthy.
              </>
            }
          />
          <p className="benefits-lead">
            Most developers ship payments without ever reading the spec. Most
            fraud analysts inherit rules they didn&apos;t write. This curriculum
            closes the gap on both sides.
          </p>
          <div className="benefits-stamp stripes">
            <div className="stamp-inner">
              <div className="stamp-mono mono">PROOF · CHAPTER V</div>
              <div className="stamp-h serif">
                a working
                <br />
                literacy of
                <br />
                the rails.
              </div>
              <div className="stamp-mono mono">EST. 2024</div>
            </div>
          </div>
        </aside>
        <ul className="benefits-list">
          {ITEMS.map((b, i) => (
            <li className="benefit-row" key={i}>
              <span className="benefit-num mono">0{i + 1}</span>
              <div>
                <h4 className="benefit-t serif">{b.t}</h4>
                <p className="benefit-d">{b.d}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
