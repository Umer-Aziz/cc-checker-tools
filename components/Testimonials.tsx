import Icon from "./Icon";
import SectionHead from "./SectionHead";

const QUOTES = [
  {
    q: "Finally an explanation of velocity rules that doesn't presume I already know what they are. I've reused chapter three in onboarding for two years.",
    n: "M. Okonkwo",
    r: "Risk Analyst, mid-market acquirer",
  },
  {
    q: "We point every new engineer who touches the checkout to the Luhn lab. The animation does in five minutes what a lecture couldn't do in an hour.",
    n: "Priya Vellore",
    r: "Staff Engineer, fintech",
  },
  {
    q: "I teach a payments-security elective from this material. The case studies turned a dry compliance unit into the most-attended week of the term.",
    n: "Prof. R. Mendel",
    r: "CS Department, state university",
  },
];

export default function Testimonials() {
  return (
    <section className="testimonials">
      <div className="container">
        <SectionHead
          idx="VI"
          eyebrow="The classroom"
          title={
            <>
              Used by engineers, analysts, and <em>professors</em>.
            </>
          }
        />
        <div className="quote-grid">
          {QUOTES.map((q, i) => (
            <figure className="quote card" key={i}>
              <div className="quote-mark">
                <Icon name="quote" size={22} />
              </div>
              <blockquote className="quote-text">{q.q}</blockquote>
              <figcaption className="quote-attr">
                <div className="quote-name serif">{q.n}</div>
                <div className="quote-role mono">{q.r}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
