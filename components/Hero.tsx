import Icon from "./Icon";

function BinDiagram() {
  // Sample PAN — clearly educational/synthetic
  const digits = "4 5 3 2  4 8 8 0  3 4 3 6  4 6 6 7".split("");

  return (
    <figure className="diagram">
      <figcaption className="diagram-cap">
        <span className="mono">FIG. 01</span> — Anatomy of a Primary Account Number (PAN)
      </figcaption>
      <div className="diagram-body">
        <div className="pan">
          {digits.map((ch, i) => {
            if (ch === " ") return <span key={i} className="pan-d sp" />;
            // Digits 0–5 (first 6) are BIN, last char is check digit
            const nonSpace = digits.slice(0, i + 1).filter((c) => c !== " ").length;
            const total = digits.filter((c) => c !== " ").length;
            let cls = "pan-d pan-acct";
            if (nonSpace <= 6) cls = "pan-d pan-bin";
            else if (nonSpace === total) cls = "pan-d pan-chk";
            return (
              <span key={i} className={cls}>
                {ch}
              </span>
            );
          })}
        </div>
        <div className="annot">
          <div className="annot-row a-bin">
            <span className="bracket" />
            <span className="annot-label">
              <span className="mono">[1–6]</span> Issuer Identification (BIN)
            </span>
          </div>
          <div className="annot-row a-acct">
            <span className="bracket" />
            <span className="annot-label">
              <span className="mono">[7–15]</span> Individual Account Identifier
            </span>
          </div>
          <div className="annot-row a-chk">
            <span className="bracket" />
            <span className="annot-label">
              <span className="mono">[16]</span> Luhn check digit
            </span>
          </div>
        </div>
      </div>
      <div className="diagram-foot">
        <div className="foot-cell">
          <div className="foot-k">Network</div>
          <div className="foot-v">
            Visa <span className="muted">(starts with 4)</span>
          </div>
        </div>
        <div className="foot-cell">
          <div className="foot-k">Length</div>
          <div className="foot-v">
            16 digits <span className="muted">· ISO/IEC 7812</span>
          </div>
        </div>
        <div className="foot-cell">
          <div className="foot-k">Use</div>
          <div className="foot-v">Sample · educational</div>
        </div>
      </div>
    </figure>
  );
}

export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="container hero-grid">
        <div className="hero-left">
          <div className="eyebrow">
            <span className="dot" />
            An educational platform · Est. 2024
          </div>
          <h1 className="hero-h1 serif">
            Learn how banks <em>verify</em> a card before a single dollar moves.
          </h1>
          <p className="hero-sub">
            A self-paced curriculum on the{" "}
            <strong>Luhn algorithm</strong>,{" "}
            <strong>BIN database structure</strong>, and the detection systems
            that catch fraud at the network edge — built for CS students,
            fraud-prevention analysts, and developers shipping payments.
          </p>
          <div className="hero-cta">
            <a href="#enroll" className="btn btn-primary">
              Start learning <Icon name="arrow" size={16} />
            </a>
            <a href="#features" className="btn btn-ghost">
              Read the syllabus
            </a>
          </div>
          <div className="hero-meta">
            <div>
              <span className="mono">12</span> modules
            </div>
            <div className="hero-meta-rule" />
            <div>
              <span className="mono">~9 hrs</span> read time
            </div>
            <div className="hero-meta-rule" />
            <div>
              Sample data only · <span className="muted">no real cards</span>
            </div>
          </div>
        </div>
        <div className="hero-right">
          <BinDiagram />
        </div>
      </div>
    </section>
  );
}
