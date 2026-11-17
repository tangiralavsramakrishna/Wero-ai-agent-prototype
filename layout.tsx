import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WERO AI | Founder Demo",
  description: "Voice-first healthcare appointment booking assistant demo"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}