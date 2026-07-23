import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "Vektorix — Digital Life Lab", template: "%s — Vektorix" },
  description: "Create living digital organisms from motion, sound and energy.",
  applicationName: "Vektorix",
  openGraph: { title: "Vektorix — Digital Life Lab", description: "Create life from motion, sound and energy.", type: "website" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark",
  themeColor: "#07070A",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-scroll-behavior="smooth"><body><a className="skip-link" href="#main-content">Skip to content</a><Providers>{children}</Providers></body></html>;
}
