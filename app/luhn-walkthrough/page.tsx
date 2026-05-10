"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Icon from "@/components/Icon";

const SAMPLE_VECTORS = [
  { label: "Visa sample", value: "4242424242424242" },
  { label: "Mastercard sample", value: "5555555555554444" },
  { label: "Amex sample", value: "378282246310005" },
  { label: "Discover sample", value: "6011111111111117" },
];

function formatDigits(value: string) {
  return value.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

function buildSteps(digits: string) {
  const nums = digits.split("").map((d) => Number(d));
  const length = nums.length;
  let running = 0;

  return nums.map((digit, idx) => {
    const positionFromRight = length - 1 - idx;
    const shouldDouble = positionFromRight % 2 === 1;
    const doubled = shouldDouble ? digit * 2 : digit;
    const reduced = doubled > 9 ? doubled - 9 : doubled;
    running += reduced;

    return {
      idx,
      position: idx + 1,
      digit,
      shouldDouble,
      doubled,
      reduced,
      running,
    };
  });
}

export default function LuhnWalkthroughPage() {
  const [raw, setRaw] = useState("4242424242424242");
  const [stepIndex, setStepIndex] = useState(-1);
  const [playing, setPlaying] = useState(false);

  const digits = useMemo(() => raw.replace(/\D/g, "").slice(0, 19), [raw]);
  const formatted = useMemo(() => formatDigits(digits), [digits]);
  const steps = useMemo(() => buildSteps(digits), [digits]);
  const total = steps.length ? steps[steps.length - 1].running : 0;
  const isValid = steps.length > 0 && total % 10 === 0;

  useEffect(() => {
    setStepIndex(-1);
    setPlaying(false);
  }, [digits]);

  useEffect(() => {
    if (!playing || steps.length === 0) return;
    const timer = window.setInterval(() => {
      setStepIndex((prev) => {
        const next = prev + 1;
        if (next >= steps.length) {
          setPlaying(false);
          return steps.length - 1;
        }
        return next;
      });
    }, 650);

    return () => window.clearInterval(timer);
  }, [playing, steps.length]);

  const onSample = (value: string) => setRaw(value);

  return (
    <div className="luhn-page">
      <Nav />

      <main>
        <section className="bin-head">
          <div className="container">
            <nav className="bin-crumb" aria-label="Breadcrumb">
              <Link href="/">CC Checker /edu</Link>
              <span className="sep">/</span>
              <Link href="/#tools">The lab</Link>
              <span className="sep">/</span>
              <span className="cur">T-02 · Luhn Walkthrough</span>
            </nav>
            <div className="bin-title-row">
              <div>
                <div className="bin-title-label">TOOL 02 — EDUCATIONAL · SAMPLE DATA ONLY</div>
                <h1 className="bin-title serif">
                  Luhn Walkthrough: <em>see</em> every checksum step.
                </h1>
                <p className="bin-sub">
                  Paste a sample number and watch each digit transform in real time. This lab
                  explains the arithmetic behind the checksum, not just the verdict.
                </p>
              </div>
              <div className="bin-meta">
                <div><strong>Mode</strong> — Step-by-step animation</div>
                <div><strong>Vectors</strong> — 4 public samples</div>
                <div><strong>Math</strong> — Modular arithmetic</div>
              </div>
            </div>
          </div>
        </section>

        <section className="luhn-work">
          <div className="container luhn-grid">
            <div className="luhn-left">
              <div className="luhn-panel">
                <div className="luhn-panel-head">
                  <div>
                    <h2 className="luhn-title serif">Enter a sample number</h2>
                    <p className="luhn-sub">Digits only. Up to 19 digits supported.</p>
                  </div>
                  <span className={`luhn-pill ${isValid ? "ok" : steps.length ? "bad" : ""}`}>
                    {steps.length === 0 ? "Awaiting" : isValid ? "Valid" : "Invalid"}
                  </span>
                </div>

                <label htmlFor="luhn-input" className="luhn-label">Card number</label>
                <div className="luhn-input-wrap">
                  <input
                    id="luhn-input"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    value={formatted}
                    onChange={(e) => setRaw(e.target.value)}
                    placeholder="4242 4242 4242 4242"
                  />
                  <span className="luhn-count">{digits.length}</span>
                </div>

                <div className="luhn-samples">
                  {SAMPLE_VECTORS.map((sample) => (
                    <button
                      key={sample.value}
                      type="button"
                      className="luhn-chip"
                      onClick={() => onSample(sample.value)}
                    >
                      {sample.label} <span>{formatDigits(sample.value)}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="luhn-panel">
                <div className="luhn-panel-head">
                  <h3 className="luhn-title serif">Step-by-step animation</h3>
                  <div className="luhn-actions">
                    <button
                      type="button"
                      className="btn btn-soft"
                      onClick={() => setStepIndex((prev) => Math.max(prev - 1, -1))}
                      disabled={steps.length === 0}
                    >
                      Step back
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => setPlaying((prev) => !prev)}
                      disabled={steps.length === 0}
                    >
                      {playing ? "Pause" : "Play"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-soft"
                      onClick={() => setStepIndex((prev) => Math.min(prev + 1, steps.length - 1))}
                      disabled={steps.length === 0}
                    >
                      Step forward
                    </button>
                  </div>
                </div>

                <div className="luhn-steps">
                  <div className="luhn-step-row head">
                    <span>Pos</span>
                    <span>Digit</span>
                    <span>Rule</span>
                    <span>Result</span>
                    <span>Sum</span>
                  </div>
                  {steps.map((step) => (
                    <div
                      key={step.idx}
                      className={`luhn-step-row${stepIndex >= step.idx ? " active" : ""}`}
                    >
                      <span>{step.position}</span>
                      <span className="mono">{step.digit}</span>
                      <span>{step.shouldDouble ? "x2" : "keep"}</span>
                      <span className="mono">{step.reduced}</span>
                      <span className="mono">{step.running}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <aside className="luhn-right">
              <div className="luhn-panel">
                <h3 className="luhn-title serif">Visual modular arithmetic</h3>
                <p className="luhn-copy">
                  The checksum is valid when the running sum ends in a zero. We compute
                  $sum \bmod 10$ and compare it to zero.
                </p>
                <div className="luhn-math">
                  <div className="luhn-math-row">
                    <span>Running sum</span>
                    <strong className="mono">{total}</strong>
                  </div>
                  <div className="luhn-math-row">
                    <span>Sum mod 10</span>
                    <strong className="mono">{steps.length ? total % 10 : "--"}</strong>
                  </div>
                  <div className={`luhn-math-result ${isValid ? "ok" : steps.length ? "bad" : ""}`}>
                    {steps.length === 0 ? "Awaiting digits" : isValid ? "Checksum passes" : "Checksum fails"}
                  </div>
                </div>
              </div>

              <div className="luhn-panel">
                <h3 className="luhn-title serif">Test vectors included</h3>
                <ul className="luhn-list">
                  <li><Icon name="check" size={14} /> Visa 4242 4242 4242 4242</li>
                  <li><Icon name="check" size={14} /> Mastercard 5555 5555 5555 4444</li>
                  <li><Icon name="check" size={14} /> Amex 3782 8224 6310 005</li>
                  <li><Icon name="check" size={14} /> Discover 6011 1111 1111 1117</li>
                </ul>
              </div>

              <div className="luhn-panel luhn-cta">
                <h3 className="luhn-title serif">Open the lab notes</h3>
                <p className="luhn-copy">Download the printable worksheet and practice with new numbers.</p>
                <Link className="btn btn-primary" href="/card-validator">
                  Continue to Card Validator <Icon name="arrow" size={14} />
                </Link>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
