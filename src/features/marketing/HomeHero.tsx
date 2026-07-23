"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDownRight } from "lucide-react";
import { createDNA } from "@/features/lab/engine/dna";
import { DynamicLabCanvas } from "@/features/lab/components/DynamicLabCanvas";

export function HomeHero() {
  const router = useRouter();
  const [entering, setEntering] = useState(false);
  const dna = useMemo(() => createDNA({ seed: "landing-life-01", archetype: "organic", paletteId: "void-orchid" }), []);
  const enter = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { router.push("/lab"); return; }
    setEntering(true);
    window.setTimeout(() => router.push("/lab"), 320);
  };
  return (
    <section className="hero" data-entering={entering}>
      <div className="hero-canvas"><DynamicLabCanvas dna={dna} /></div>
      <div className="hero-topline"><span>Digital life lab</span><span>Procedural / deterministic</span></div>
      <div className="hero-copy">
        <p className="eyebrow">VEKTORIX / FIELD 01</p>
        <h1>Create life<br />from motion<br />and energy.</h1>
        <div className="hero-actions"><button type="button" onClick={enter}>Enter the Lab <ArrowDownRight /></button><a href="/explore">Explore the field</a></div>
      </div>
      <p className="hero-instruction">Move to disturb the field</p>
    </section>
  );
}
