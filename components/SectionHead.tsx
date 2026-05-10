interface SectionHeadProps {
  idx: string;
  eyebrow?: string;
  title: React.ReactNode;
  kicker?: string;
}

export default function SectionHead({ idx, eyebrow, title, kicker }: SectionHeadProps) {
  return (
    <header className="sec-head">
      <div className="sec-head-meta">
        <span className="sec-idx mono">CHAPTER {idx}</span>
        {eyebrow && <span className="sec-eyebrow mono">— {eyebrow}</span>}
      </div>
      <h2 className="sec-title serif">{title}</h2>
      {kicker && <p className="sec-kicker">{kicker}</p>}
    </header>
  );
}
