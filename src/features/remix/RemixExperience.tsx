"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Dna, Shuffle } from "lucide-react";
import type { VektorDNA } from "@/features/lab/schemas/dna";
import { encodeDNA } from "@/features/lab/engine/dna";
import { sampleVektors } from "@/features/vektors/samples";
import { DynamicLabCanvas } from "@/features/lab/components/DynamicLabCanvas";
import { fuseDNA, mutateDNA } from "./engine/remix";

export function RemixExperience({ parent, slug }: { parent: VektorDNA; slug: string }) {
  const [iteration, setIteration] = useState(1);
  const [mode, setMode] = useState<"mutation" | "fusion">("mutation");
  const child = useMemo(() => mode === "mutation" ? mutateDNA(parent, `${parent.seed}-m${iteration}`, 0.055 + (iteration % 5) * 0.012) : fuseDNA(parent, sampleVektors[2].dna, `${parent.seed}-f${iteration}`), [iteration, mode, parent]);
  const data = encodeDNA(child);
  return (
    <main id="main-content" className="remix-page">
      <div className="remix-canvas"><DynamicLabCanvas dna={child} /></div>
      <section className="remix-controls"><p className="eyebrow">LINEAGE / {slug}</p><h1>Evolve the<br />existing signal.</h1><div className="remix-mode"><button type="button" data-active={mode === "mutation"} onClick={() => setMode("mutation")}><Dna /><strong>Mutation</strong><span>One parent, bounded change</span></button><button type="button" data-active={mode === "fusion"} onClick={() => setMode("fusion")}><Shuffle /><strong>Fusion</strong><span>Weighted deterministic crossover</span></button></div><div className="remix-lineage"><span>Generation {child.ancestry?.generation}</span><p>Born from {child.ancestry?.parentIds.join(" × ")}</p><p>Mutation rate {Math.round((child.ancestry?.mutationRate ?? 0) * 100)}%</p></div><button className="mutation-button" type="button" onClick={() => setIteration((value) => value + 1)}>Generate variation {String(iteration + 1).padStart(2, "0")}</button><Link className="publish-button" href={`/v/${slug}-remix-${iteration}?data=${data}&name=${encodeURIComponent(`${slug} / ${mode} ${iteration}`)}`}>Stabilize child <ArrowUpRight /></Link></section>
    </main>
  );
}
