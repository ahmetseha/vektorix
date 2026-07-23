"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { VektorRecord } from "@/features/vektors/types";
import { FieldExperience } from "./FieldExperience";

export function ActiveFieldHome() {
  const [record, setRecord] = useState<VektorRecord | null | undefined>();

  useEffect(() => {
    const slug = localStorage.getItem("vektorix:active-vektor");
    if (!slug) {
      queueMicrotask(() => setRecord(null));
      return;
    }
    fetch(`/api/vektors/${slug}`)
      .then(async (response) => {
        if (response.ok) return (await response.json()) as VektorRecord;
        const cached = localStorage.getItem(`vektorix:published:${slug}`);
        return cached ? (JSON.parse(cached) as VektorRecord) : null;
      })
      .then(setRecord)
      .catch(() => setRecord(null));
  }, []);

  if (record === undefined) {
    return (
      <main className="field-empty">
        <p role="status">Listening for your active Vektor…</p>
      </main>
    );
  }
  if (!record) {
    return (
      <main id="main-content" className="field-empty">
        <p className="eyebrow">FIELD / NO ACTIVE SIGNAL</p>
        <h1>The field is waiting.</h1>
        <p>Create and release a Vektor to follow its life here.</p>
        <Link href="/lab">
          Enter the Lab <span aria-hidden="true">→</span>
        </Link>
      </main>
    );
  }
  return <FieldExperience initialRecord={record} biome={record.state.currentBiome} />;
}
