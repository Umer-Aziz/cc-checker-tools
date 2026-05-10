const ITEMS = [
  "ISO/IEC 7812",
  "PCI DSS v4.0",
  "Luhn 1960",
  "EMV 4.4",
  "ANSI X9.59",
  "ISO 8583",
  "FFIEC IT Booklet",
  "OWASP ASVS",
  "NIST SP 800-53",
];

function Block() {
  return (
    <>
      {ITEMS.map((t, i) => (
        <span key={i}>
          <span className="dot" />
          {t}
        </span>
      ))}
    </>
  );
}

export default function MarqueeBand() {
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        <Block />
        <Block />
        <Block />
      </div>
    </div>
  );
}
