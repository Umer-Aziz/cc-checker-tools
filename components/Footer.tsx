import Link from "next/link";

type ColEntry = { label: string; href: string };
type Cols = Record<string, ColEntry[]>;

const COLS: Cols = {
  Curriculum: [
    { label: "Module index", href: "/#features" },
    { label: "Sample chapter", href: "/#features" },
    { label: "Reading list", href: "/#features" },
    { label: "Test vectors", href: "/#features" },
  ],
  Tools: [
    { label: "BIN explorer", href: "/bin-lookup" },
    { label: "Luhn walkthrough", href: "/luhn-walkthrough" },
    { label: "Pattern analyzer", href: "/pattern-analyzer" },
    { label: "CC Generator", href: "/cc-generator" },
    { label: "Case files", href: "/#tools" },
  ],
  Faculty: [
    { label: "Classroom plans", href: "/#pricing" },
    { label: "LTI integration", href: "/#pricing" },
    { label: "Site licence", href: "/#pricing" },
    { label: "Office hours", href: "/#enroll" },
  ],
  Policy: [
    { label: "Acceptable use", href: "#legal" },
    { label: "Abuse reporting", href: "#legal" },
    { label: "Privacy", href: "#legal" },
    { label: "Terms", href: "#legal" },
  ],
};

export default function Footer() {
  return (
    <footer className="footer" id="legal">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <Link href="/" className="logo" style={{ marginBottom: 16 }}>
              <span className="logo-mark">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                >
                  <rect x="3" y="6" width="18" height="14" rx="1" />
                  <path d="M3 10h18" />
                  <path d="M7 16h4" />
                </svg>
              </span>
              <span className="logo-text">
                CC&nbsp;Checker<span className="logo-edu">/edu</span>
              </span>
            </Link>
            <p className="footer-blurb">
              An educational platform on credit-card validation, BIN structure,
              and fraud-prevention concepts. Sample data only.
            </p>
            <div className="footer-legal mono">
              <p>
                <strong>Notice.</strong> This platform exists to teach. All
                tools operate on synthetic or publicly registered sample data.
                Use of this material to attempt unauthorised access, charge, or
                validation against accounts you do not own is illegal. Misuse
                will be reported to the appropriate authority.
              </p>
            </div>
          </div>
          <div className="footer-cols">
            {Object.entries(COLS).map(([k, v]) => (
              <div key={k} className="footer-col">
                <div className="footer-h">{k}</div>
                <ul>
                  {v.map((x) => (
                    <li key={x.label}>
                      <Link href={x.href}>{x.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="footer-bottom">
          <div className="mono">
            © 2024–2026 CC Checker /edu · Independent educational publisher
          </div>
          <div className="footer-socials mono">
            <a href="https://github.com/Umer-Aziz/" target="_blank" rel="noreferrer">GitHub</a>
            <a href="https://github.com/Umer-Aziz/" target="_blank" rel="noreferrer">Contact developer</a>
            <span className="footer-hearts">Built with &#9829; for the community</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
