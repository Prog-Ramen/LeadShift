import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LeadShift — Situational Leadership Laboratory",
  description:
    "Separate your natural and chosen management styles, build context-aware recommendations, compare team perception, and practice through simulations.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
