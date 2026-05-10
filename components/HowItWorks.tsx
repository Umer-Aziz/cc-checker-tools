import SectionHead from "./SectionHead";

const STEPS = [
  {
    n: "01",
    t: "Read the structure",
    d: "Decompose a PAN into its issuer, account, and check-digit fields. Understand why ISO/IEC 7812 chose this layout.",
  },
  {
    n: "02",
    t: "Run the algorithm",
    d: "Apply Luhn by hand on five sample numbers. Then watch the lab animate each doubling and modular reduction.",
  },
  {
    n: "03",
    t: "Layer the defences",
    d: "See where validation, BIN risk scoring, velocity, and behavioural models compose into an issuer's authorisation pipeline.",
  },
  {
    n: "04",
    t: "Apply with code",
    d: "Translate the concepts into reference implementations. Compare your output against published test vectors.",
  },
];

export default function HowItWorks() {
  return (
    <section className="hiw" id="how-it-works">
      <div className="container">
        <SectionHead
          idx="III"
          eyebrow="The arc"
          title={
            <>
              How a single charge gets <em>interrogated</em>.
            </>
          }
        />
        <div className="hiw-list">
          {STEPS.map((s, i) => (
            <div className="hiw-row" key={i}>
              <div className="hiw-n serif">{s.n}</div>
              <div className="hiw-line" />
              <div className="hiw-body">
                <h3 className="hiw-t serif">{s.t}</h3>
                <p className="hiw-d">{s.d}</p>
              </div>
              <div className="hiw-tag mono">Step {i + 1} of 4</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
