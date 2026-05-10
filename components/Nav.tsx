"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "./Icon";

const HASH_LINKS = [
  { label: "Features", hash: "features" },
  { label: "Tools", hash: "tools" },
  { label: "Pricing", hash: "pricing" },
  { label: "FAQ", hash: "faq" },
];

const TOOL_LINKS = [
  { label: "BIN Lookup", href: "/bin-lookup", icon: "glass" },
  { label: "Card Validator", href: "/card-validator", icon: "grid" },
  { label: "CC Generator", href: "/cc-generator", icon: "spark" },
  { label: "Card Status Checker", href: "/live-dead-checker", icon: "shield" },
  { label: "Luhn Walkthrough", href: "/luhn-walkthrough", icon: "spark" },
  { label: "Pattern Analyzer", href: "/pattern-analyzer", icon: "chart" },
] as const;

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const toolsRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
      if (!toolsOpen) return;
      const onClick = (event: MouseEvent) => {
        if (!toolsRef.current) return;
        if (!toolsRef.current.contains(event.target as Node)) {
          setToolsOpen(false);
        }
      };
      document.addEventListener("click", onClick);
      return () => document.removeEventListener("click", onClick);
    }, [toolsOpen]);

  const pathname = usePathname();
  const isHome = pathname === "/";
  // On sub-pages, hash links need the home prefix
  const pfx = isHome ? "" : "/";

  const close = () => {
    setOpen(false);
    setToolsOpen(false);
  };

  return (
    <header className="nav">
      <div className="container nav-row">
        {/* Logo */}
        <Link href="/" className="logo" onClick={close}>
          <span className="logo-mark" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <rect x="3" y="6" width="18" height="14" rx="1" />
              <path d="M3 10h18" />
              <path d="M7 16h4" />
            </svg>
          </span>
          <span className="logo-text">
            CC&nbsp;Checker<span className="logo-edu">/edu</span>
          </span>
        </Link>

        {/* Desktop links */}
        <nav className="nav-links" aria-label="Main navigation">
          {HASH_LINKS.filter((l) => l.label !== "Tools").map((l) => (
            <a key={l.label} href={`${pfx}#${l.hash}`} className="nav-hash-link">
              {l.label}
            </a>
          ))}
          <div className={`nav-tools${toolsOpen ? " open" : ""}`} ref={toolsRef}>
            <button
              type="button"
              className="nav-tools-trigger"
              aria-expanded={toolsOpen}
              aria-haspopup="menu"
              onClick={() => setToolsOpen((prev) => !prev)}
            >
              Tools <Icon name="arrowdr" size={14} stroke={1.6} />
            </button>
            <div className="nav-tools-menu" role="menu">
              {TOOL_LINKS.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className={`nav-tools-item${pathname === tool.href ? " active" : ""}`}
                  role="menuitem"
                  onClick={() => setToolsOpen(false)}
                >
                  <Icon name={tool.icon} size={14} stroke={1.6} />
                  {tool.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {/* Desktop CTA */}
        <div className="nav-cta">
          <a href={`${pfx}#enroll`} className="muted nav-signin">
            Sign in
          </a>
          <a href={`${pfx}#enroll`} className="btn btn-primary nav-btn">
            Start learning
          </a>
          <button
            className="nav-burger"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            <Icon name={open ? "x" : "menu"} />
          </button>
        </div>
      </div>

      {/* Mobile drawer — always in DOM, animated via CSS */}
      <div className={`nav-mobile${open ? " nav-mobile-open" : ""}`} aria-hidden={!open}>
        {HASH_LINKS.map((l) => (
          <a
            key={l.label}
            href={`${pfx}#${l.hash}`}
            className="nav-mobile-link"
            onClick={close}
          >
            {l.label}
          </a>
        ))}
        {TOOL_LINKS.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className={`nav-mobile-link nav-mobile-tool${pathname === tool.href ? " active" : ""}`}
            onClick={close}
          >
            <Icon name={tool.icon} size={15} stroke={1.6} />
            {tool.label}
            <span className="nav-tool-badge">Tool</span>
          </Link>
        ))}
        <div className="nav-mobile-divider" />
        <a href={`${pfx}#enroll`} className="btn btn-primary" onClick={close}>
          Start learning <Icon name="arrow" size={15} />
        </a>
        <a href={`${pfx}#enroll`} className="nav-mobile-signin" onClick={close}>
          Sign in
        </a>
      </div>
    </header>
  );
}
