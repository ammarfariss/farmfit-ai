import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FarmFit AI — Site-aware farm portfolio optimizer",
  description: "Explainable farm portfolio decision support for land, crops, production systems, budget, water and energy.",
  applicationName: "FarmFit AI",
  keywords: ["agriculture", "Qatar", "farm planning", "site suitability", "decision support", "open source"],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
