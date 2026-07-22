import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import { siteConfig } from "@/config/site";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: `${siteConfig.name} — Analytics`, template: `%s — ${siteConfig.name}` },
  description: siteConfig.description,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="antialiased">
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
