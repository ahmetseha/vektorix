"use client";

import Link from "next/link";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body>
        <main className="error-page">
          <p>FIELD INTERRUPTION</p>
          <h1>The signal collapsed.</h1>
          <p>Your local DNA may still be recoverable. Re-enter the field to restore it.</p>
          <button type="button" onClick={reset}>Restore field</button>
          <Link href="/">Return home</Link>
        </main>
      </body>
    </html>
  );
}
