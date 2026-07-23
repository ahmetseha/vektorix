import Link from "next/link";

export default function NotFound() { return <main className="error-page"><p className="eyebrow">404 / ABSENT SIGNAL</p><h1>This Vektor is no longer in the field.</h1><p>It may be private, deleted, or built with an unsupported DNA version.</p><Link href="/explore">Explore living signals</Link></main>; }
