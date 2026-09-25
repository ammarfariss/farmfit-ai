import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "FarmFit", description: "Design the farm. Don't guess the farm." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
