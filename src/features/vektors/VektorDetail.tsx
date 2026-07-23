"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Download, Flag, GitFork, Heart, Share2 } from "lucide-react";
import { DynamicLabCanvas } from "@/features/lab/components/DynamicLabCanvas";
import { encodeDNA } from "@/features/lab/engine/dna";
import { formatBehavioralCharacter } from "@/features/simulation/resolvers/behavioral-character";
import { getBiomeDefinition } from "@/features/simulation/registries/biomes";
import type { VektorRecord } from "./types";

function sessionId() {
  const key = "vektorix:anonymous-session";
  let value = localStorage.getItem(key);
  if (!value) {
    value = crypto.randomUUID();
    localStorage.setItem(key, value);
  }
  return value;
}

export function VektorDetail({ initialRecord }: { initialRecord: VektorRecord }) {
  const [record, setRecord] = useState(initialRecord);
  const [reacted, setReacted] = useState(false);
  const [status, setStatus] = useState("");
  const data = useMemo(() => encodeDNA(record.dna), [record.dna]);
  const biome = getBiomeDefinition(record.state.currentBiome);
  const traits = [
    [
      "Motion",
      record.dna.visual.motion.turbulence > 0.68
        ? "Restless"
        : record.dna.visual.motion.speed < 0.38
          ? "Patient"
          : "Fluid",
    ],
    ["Structure", record.dna.visual.form.symmetry > 0.58 ? "Symmetrical" : "Asymmetric"],
    ["Energy", record.dna.visual.gesture.intensity > 0.58 ? "High" : "Measured"],
    ["Pulse", record.dna.visual.motion.pulse > 0.62 ? "Fast" : "Slow"],
    ["Density", record.dna.visual.form.density > 0.55 ? "Dense" : "Diffuse"],
    ["Origin", record.generation === 1 ? "First generation" : `Generation ${record.generation}`],
  ];
  const behavioralTraits = formatBehavioralCharacter(record.dna.behavioral);
  const react = async () => {
    const response = await fetch(`/api/vektors/${record.slug}/reaction`, {
      method: "POST",
      headers: { "x-vektorix-session": sessionId() },
    });
    if (response.ok) {
      const result = (await response.json()) as { active: boolean; count: number };
      setReacted(result.active);
      setRecord((current) => ({ ...current, reactionCount: result.count }));
    } else {
      setReacted((value) => !value);
      setRecord((current) => ({
        ...current,
        reactionCount: Math.max(0, current.reactionCount + (reacted ? -1 : 1)),
      }));
    }
  };
  const share = async () => {
    const url = window.location.href;
    if (navigator.share)
      await navigator.share({ title: `${record.name} — Vektorix`, text: record.description, url });
    else {
      await navigator.clipboard.writeText(url);
      setStatus("Link copied to clipboard.");
    }
  };
  const download = () => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${record.slug}.webp`;
    link.href = canvas.toDataURL("image/webp", 0.9);
    link.click();
  };
  const report = async () => {
    if (!window.confirm("Report this Vektor for review?")) return;
    await fetch(`/api/vektors/${record.slug}/report`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-vektorix-session": sessionId() },
      body: JSON.stringify({ reason: "other" }),
    });
    setStatus("Report received. Thank you.");
  };
  return (
    <main id="main-content" className="detail-page">
      <section className="detail-stage">
        <DynamicLabCanvas dna={record.dna} lifeState={record.state} />
        <div className="detail-title">
          <p>
            {record.dna.visual.archetype} / GEN {record.generation}
          </p>
          <h1>{record.name}</h1>
          <span>by {record.creator}</span>
        </div>
        <p className="detail-hint">Move to examine the field</p>
      </section>
      <section className="detail-data">
        <div className="detail-description">
          <p className="section-index">SPECIMEN NOTE</p>
          <p>{record.description || "No note was left. The motion is the record."}</p>
          <span>
            Stabilized{" "}
            {new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(
              new Date(record.createdAt),
            )}
          </span>
        </div>
        <div className="trait-grid">
          {traits.map(([label, value]) => (
            <div key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
        <div className="behavior-panel">
          <p className="section-index">BEHAVIORAL CHARACTER</p>
          <div className="trait-grid">
            {behavioralTraits.map((trait) => (
              <div key={trait.label}>
                <span>{trait.label}</span>
                <strong>{trait.value}</strong>
              </div>
            ))}
          </div>
        </div>
        <div className="life-panel">
          <p className="section-index">CURRENT LIFE STATE</p>
          <h2>{biome.name}</h2>
          <p>{biome.atmosphere}</p>
          <dl>
            <div>
              <dt>Energy</dt>
              <dd>{Math.round(record.state.energy * 100)}%</dd>
            </div>
            <div>
              <dt>Stability</dt>
              <dd>{Math.round(record.state.stability * 100)}%</dd>
            </div>
            <div>
              <dt>Evolution</dt>
              <dd>Stage {record.state.evolutionStage}</dd>
            </div>
          </dl>
          {record.memories[0] && (
            <div className="detail-recent-memory">
              <span>Recent memory</span>
              <strong>{record.memories[0].title}</strong>
              <p>{record.memories[0].description}</p>
            </div>
          )}
          <Link
            className="journey-link"
            href={`/field/${record.state.currentBiome}?slug=${record.slug}&data=${data}`}
          >
            Follow its journey <span aria-hidden="true">→</span>
          </Link>
          <Link
            className="journey-link muted-link"
            href={`/v/${record.slug}/memories?data=${data}&name=${encodeURIComponent(record.name)}`}
          >
            Read its memories
          </Link>
        </div>
        {record.dna.ancestry && (
          <div className="ancestry">
            <p className="section-index">LINEAGE</p>
            <h2>Generation {record.dna.ancestry.generation}</h2>
            <p>Born from {record.dna.ancestry.parentIds.join(" × ")}</p>
          </div>
        )}
        <div className="detail-actions">
          <button type="button" data-active={reacted} onClick={() => void react()}>
            <Heart /> {record.reactionCount} pulses
          </button>
          <Link href={`/remix/${record.slug}?data=${data}`}>
            <GitFork /> Remix this Vektor
          </Link>
          <button type="button" onClick={() => void share()}>
            <Share2 /> Share
          </button>
          <button type="button" onClick={download}>
            <Download /> Poster
          </button>
          <button type="button" onClick={() => void report()}>
            <Flag /> Report
          </button>
        </div>
        {status && (
          <p className="inline-status" role="status">
            {status}
          </p>
        )}
      </section>
    </main>
  );
}
