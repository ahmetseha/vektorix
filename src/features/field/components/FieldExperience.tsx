"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Compass, Orbit } from "lucide-react";
import { DynamicLabCanvas } from "@/features/lab/components/DynamicLabCanvas";
import { encodeDNA } from "@/features/lab/engine/dna";
import { formatMemory } from "@/features/simulation/resolvers/format-memory";
import { biomeList, getBiomeDefinition } from "@/features/simulation/registries/biomes";
import type { BiomeType } from "@/features/simulation/schemas/biome";
import type { VektorRecord } from "@/features/vektors/types";

export function FieldExperience({
  initialRecord,
  biome,
}: {
  initialRecord: VektorRecord;
  biome: BiomeType;
}) {
  const router = useRouter();
  const [record, setRecord] = useState(initialRecord);
  const [travelling, setTravelling] = useState<BiomeType | null>(null);
  const [message, setMessage] = useState("");
  const definition = getBiomeDefinition(biome);
  const encodedDNA = useMemo(() => encodeDNA(record.dna), [record.dna]);
  const recentMemory = record.memories[0];

  const travel = async (destination: BiomeType) => {
    if (destination === biome) return;
    setTravelling(destination);
    setMessage("");
    const response = await fetch(`/api/vektors/${record.slug}/travel`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ biome: destination }),
    });
    if (response.ok) {
      const nextRecord = (await response.json()) as VektorRecord;
      setRecord(nextRecord);
      localStorage.setItem(`vektorix:published:${nextRecord.slug}`, JSON.stringify(nextRecord));
      router.push(`/field/${destination}?slug=${record.slug}&data=${encodedDNA}`);
      return;
    }
    setMessage("The passage is quiet. Try entering this biome again.");
    setTravelling(null);
  };

  return (
    <main
      id="main-content"
      className="field-experience"
      style={
        {
          "--field-primary": definition.visualTheme.primary,
          "--field-secondary": definition.visualTheme.secondary,
        } as React.CSSProperties
      }
    >
      <div className="field-canvas">
        <DynamicLabCanvas dna={record.dna} biome={biome} lifeState={record.state} showNearby />
      </div>

      <header className="field-topbar">
        <Link href="/" aria-label="Vektorix home">
          VX
        </Link>
        <p>
          <Orbit aria-hidden="true" /> Active life / {record.name}
        </p>
        <Link href={`/v/${record.slug}?data=${encodedDNA}`}>Specimen record</Link>
      </header>

      <section className="field-identity" aria-labelledby="field-title">
        <p className="eyebrow">{definition.risk} RISK / LIVE FIELD</p>
        <h1 id="field-title">{definition.name}</h1>
        <p>{definition.atmosphere}</p>
      </section>

      <aside className="field-state" aria-label={`${record.name} current state`}>
        <p className="section-index">CURRENT STATE</p>
        <h2>{record.name}</h2>
        <div className="state-signal">
          <label>
            Energy <output>{Math.round(record.state.energy * 100)}%</output>
          </label>
          <meter min="0" max="1" value={record.state.energy}>
            {Math.round(record.state.energy * 100)}%
          </meter>
        </div>
        <div className="state-signal">
          <label>
            Stability <output>{Math.round(record.state.stability * 100)}%</output>
          </label>
          <meter min="0" max="1" value={record.state.stability}>
            {Math.round(record.state.stability * 100)}%
          </meter>
        </div>
        <dl>
          <div>
            <dt>Status</dt>
            <dd>{record.state.status}</dd>
          </div>
          <div>
            <dt>Evolution</dt>
            <dd>Stage {record.state.evolutionStage}</dd>
          </div>
          <div>
            <dt>Next signal</dt>
            <dd>{definition.possibleTraits[0]}</dd>
          </div>
        </dl>
        {recentMemory && (
          <div className="field-memory">
            <span>Recent memory</span>
            <strong>{recentMemory.title}</strong>
            <p>{formatMemory(recentMemory)}</p>
          </div>
        )}
        <Link
          className="field-text-link"
          href={`/v/${record.slug}/memories?data=${encodedDNA}&name=${encodeURIComponent(record.name)}`}
        >
          Memory archive <ArrowRight aria-hidden="true" />
        </Link>
      </aside>

      <nav className="biome-passages" aria-label="Biome passages">
        <p>
          <Compass aria-hidden="true" /> Passages
        </p>
        {biomeList.map((destination) => (
          <button
            key={destination.id}
            type="button"
            data-current={destination.id === biome}
            disabled={destination.id === biome || travelling !== null}
            onClick={() => void travel(destination.id)}
          >
            <span style={{ background: destination.visualTheme.primary }} />
            {destination.name}
            {travelling === destination.id ? <em>Entering…</em> : null}
          </button>
        ))}
        {message && <small role="alert">{message}</small>}
      </nav>
    </main>
  );
}
