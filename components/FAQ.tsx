"use client";

import { useState } from "react";
import Icon from "./Icon";
import SectionHead from "./SectionHead";

const ITEMS = [
  {
    q: "Is this a tool to test real credit cards?",
    a: "No. The platform operates only on synthetic or publicly registered sample data. There is no path that submits a real PAN to a card network. Anyone arriving here looking for that should leave.",
  },
  {
    q: "Can I validate my own credit card?",
    a: "The Luhn walkthrough will tell you whether a number is well-formed, but that's a structural check — it doesn't confirm a card is real, active, or yours to validate. For real validation, your payment processor's official tooling is the right surface.",
  },
  {
    q: "Is this legal to use?",
    a: "Yes, for educational use. Reverse-engineering issuer detection logic in order to defraud is a federal offence in most jurisdictions, and our terms prohibit it explicitly.",
  },
  {
    q: "Who is this designed for?",
    a: "Primarily: undergraduate and graduate CS students taking a payments or security elective; engineers integrating with payment processors; fraud and risk analysts at acquirers, issuers, and merchants.",
  },
  {
    q: "Do I get a certificate?",
    a: "Student-tier learners receive a signed completion certificate after the final assessment. Faculty-tier instructors can issue institution-branded certificates to their cohorts.",
  },
  {
    q: "How do you prevent abuse of the platform?",
    a: "Rate limiting, no PAN ingestion endpoints, mandatory educational-use attestation at signup, audit logs on every tool, and a published abuse-reporting channel monitored by a real human.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number>(0);

  return (
    <section className="faq" id="faq">
      <div className="container faq-grid">
        <aside className="faq-side">
          <SectionHead
            idx="VIII"
            eyebrow="Questions, asked"
            title={
              <>
                Anticipated, in <em>good faith</em>.
              </>
            }
          />
          <p className="muted faq-aside">
            Don&apos;t see yours? Email{" "}
            <span className="mono">faculty@cc-checker.edu</span>.
          </p>
        </aside>
        <ul className="faq-list">
          {ITEMS.map((it, i) => (
            <li key={i} className={`faq-row ${open === i ? "open" : ""}`}>
              <button
                className="faq-q"
                onClick={() => setOpen(open === i ? -1 : i)}
              >
                <span className="faq-num mono">
                  Q.{String(i + 1).padStart(2, "0")}
                </span>
                <span className="faq-q-t serif">{it.q}</span>
                <span className="faq-toggle">
                  <Icon name={open === i ? "minus" : "plus"} size={18} />
                </span>
              </button>
              <div className="faq-a-wrap">
                <p className="faq-a">{it.a}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
