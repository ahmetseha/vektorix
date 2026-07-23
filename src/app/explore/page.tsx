import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { ExploreGrid } from "@/features/explore/ExploreGrid";

export const metadata: Metadata = { title: "Explore", description: "Discover deterministic organisms shaped by the Vektorix community." };
export default function ExplorePage() { return <><SiteHeader /><main id="main-content" className="page-shell"><header className="page-intro"><p className="eyebrow">COMMUNITY FIELD / LIVE INDEX</p><h1>Signals made<br />by human motion.</h1><p>Low-cost posters preserve the field. Live rendering begins only when you enter a specimen.</p></header><Suspense fallback={<p className="inline-status" role="status">Reading field index…</p>}><ExploreGrid /></Suspense></main></>; }
