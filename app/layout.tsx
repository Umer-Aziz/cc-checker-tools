import type { Metadata } from "next";
import { Instrument_Serif, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  display: "swap",
});

const ibmPlexSans = IBM_Plex_Sans({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-ibm-plex-sans",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

const FAVICON_SVG = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#0F1B2D" stroke-width="1.8">
    <rect x="3" y="6" width="18" height="14" rx="1.5"/>
    <path d="M3 10h18"/>
    <path d="M7 15.5h4"/>
  </svg>`
)}`;

export const metadata: Metadata = {
  title: "CC Checker /edu — Learn Credit-Card Validation",
  description:
    "An educational platform on the Luhn algorithm, BIN database structure, and the detection systems that catch fraud at the network edge.",
  applicationName: "CC Checker /edu",
  icons: {
    icon: FAVICON_SVG,
    shortcut: FAVICON_SVG,
  },
  other: {
    "theme-color": "#F4F0E6",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="ivory"
      data-headings="sans"
      data-scroll-behavior="smooth"
      className={`${instrumentSerif.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
