import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LeadShift — Situational Leadership Laboratory",
  description:
    "Explore management styles as movable dials, discover archetypes, and test situational fit.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
