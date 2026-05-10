import { SVGProps } from "react";

type IconName =
  | "book" | "glass" | "shield" | "chart" | "code" | "lock" | "db"
  | "grid" | "arrow" | "arrowdr" | "check" | "plus" | "minus" | "quote"
  | "menu" | "x" | "spark" | "network" | "pen" | "cap" | "award";

interface IconProps {
  name: IconName;
  size?: number;
  stroke?: number;
  className?: string;
}

export default function Icon({ name, size = 20, stroke = 1.5, className }: IconProps) {
  const props: SVGProps<SVGSVGElement> = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: stroke,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className,
  };

  const paths: Record<IconName, React.ReactNode> = {
    book: (
      <>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </>
    ),
    glass: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </>
    ),
    shield: (
      <path d="M12 2 4 5v6c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V5l-8-3z" />
    ),
    chart: (
      <>
        <path d="M3 3v18h18" />
        <path d="M7 14l4-4 4 4 5-6" />
      </>
    ),
    code: (
      <>
        <path d="m9 18-6-6 6-6" />
        <path d="m15 6 6 6-6 6" />
      </>
    ),
    lock: (
      <>
        <rect x="4" y="11" width="16" height="10" rx="2" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      </>
    ),
    db: (
      <>
        <ellipse cx="12" cy="5" rx="8" ry="3" />
        <path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5" />
        <path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
      </>
    ),
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </>
    ),
    arrowdr: (
      <>
        <path d="m7 7 10 10" />
        <path d="M17 7v10H7" />
      </>
    ),
    check: <path d="m4 12 5 5L20 6" />,
    plus: (
      <>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </>
    ),
    minus: <path d="M5 12h14" />,
    quote: (
      <>
        <path d="M3 21c3 0 7-1 7-8V5H3v8h4c0 4-2 4-4 4z" />
        <path d="M14 21c3 0 7-1 7-8V5h-7v8h4c0 4-2 4-4 4z" />
      </>
    ),
    menu: (
      <>
        <path d="M4 6h16" />
        <path d="M4 12h16" />
        <path d="M4 18h16" />
      </>
    ),
    x: (
      <>
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
      </>
    ),
    spark: (
      <>
        <path d="M12 2v6" />
        <path d="M12 16v6" />
        <path d="M2 12h6" />
        <path d="M16 12h6" />
        <path d="m4.93 4.93 4.24 4.24" />
        <path d="m14.83 14.83 4.24 4.24" />
        <path d="m4.93 19.07 4.24-4.24" />
        <path d="m14.83 9.17 4.24-4.24" />
      </>
    ),
    network: (
      <>
        <circle cx="12" cy="5" r="2" />
        <circle cx="5" cy="19" r="2" />
        <circle cx="19" cy="19" r="2" />
        <path d="M12 7v4M7 17l4-4M17 17l-4-4" />
      </>
    ),
    pen: <path d="M16 3l5 5L8 21H3v-5z" />,
    cap: (
      <>
        <path d="M22 10 12 5 2 10l10 5 10-5z" />
        <path d="M6 12v5c2 1 4 2 6 2s4-1 6-2v-5" />
      </>
    ),
    award: (
      <>
        <circle cx="12" cy="9" r="6" />
        <path d="m9 14-2 7 5-3 5 3-2-7" />
      </>
    ),
  };

  return <svg {...props}>{paths[name]}</svg>;
}
