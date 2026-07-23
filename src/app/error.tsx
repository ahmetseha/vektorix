"use client";

import Link from "next/link";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <main className="error-page"><p className="eyebrow">FIELD INTERRUPTION</p><h1>The signal collapsed.</h1><p>Your local DNA may still be recoverable. Re-enter the field to restore it.</p><button type="button" onClick={reset}>Restore field</button><Link href="/">Return home</Link></main>; }
