import Icon from "./Icon";

export default function CTA() {
  return (
    <section className="cta" id="enroll">
      <div className="container cta-inner">
        <span className="eyebrow">
          <span className="dot" />
          Chapter IX — Begin
        </span>
        <h2 className="cta-h serif">
          A working literacy of how a card becomes <em>trustworthy</em>. Start
          today.
        </h2>
        <p className="cta-sub">
          Free auditor access. No credit card required to enrol — yes,
          intentionally.
        </p>
        <div className="cta-row">
          <a className="btn btn-primary" href="#">
            Start auditing free <Icon name="arrow" size={16} />
          </a>
          <a className="btn btn-ghost" href="#">
            View the syllabus
          </a>
        </div>
        <div className="cta-foot mono">
          For educational use only · Sample &amp; synthetic data only ·{" "}
          <a href="#legal">Read the use policy</a>
        </div>
      </div>
    </section>
  );
}
