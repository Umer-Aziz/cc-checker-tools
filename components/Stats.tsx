const DATA = [
  { k: "12,400+", l: "Students enrolled" },
  { k: "500+", l: "Banks indexed in BIN registry" },
  { k: "47", l: "Universities using the curriculum" },
  { k: "98%", l: "Completion satisfaction" },
];

export default function Stats() {
  return (
    <section className="stats">
      <div className="container">
        <div className="stats-row">
          {DATA.map((s, i) => (
            <div className="stats-cell" key={i}>
              <div className="stats-k serif">{s.k}</div>
              <div className="stats-l">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
