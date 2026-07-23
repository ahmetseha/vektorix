import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { HomeHero } from "@/features/marketing/HomeHero";
import { OrganismPoster } from "@/components/shared/OrganismPoster";
import { sampleVektors } from "@/features/vektors/samples";
import { encodeDNA } from "@/features/lab/engine/dna";

export default function HomePage() {
  return (
    <main id="main-content">
      <HomeHero />
      <section className="signature-section"><p className="section-index">01 / SIGNATURE</p><h2>Every movement<br />leaves a signature.</h2><p>Velocity becomes turbulence. Curvature creates orbit. Pressure feeds the core. Only the distilled character remains.</p><div className="signal-line" aria-hidden="true"><span /><span /><span /><span /><span /></div></section>
      <section className="field-section"><header><p className="section-index">02 / THE FIELD</p><h2>Recently stabilized</h2><Link href="/explore">View all <ArrowUpRight /></Link></header><div className="field-grid">{sampleVektors.slice(0, 3).map((record) => <Link key={record.slug} href={`/v/${record.slug}?data=${encodeDNA(record.dna)}`} className="field-card"><OrganismPoster dna={record.dna} label={`Preview of ${record.name}`} /><div><span>{record.dna.archetype} / gen {record.generation}</span><h3>{record.name}</h3><p>{record.creator}</p></div></Link>)}</div></section>
      <section className="remix-section"><div><p className="section-index">03 / LINEAGE</p><h2>Nothing is copied.<br />Everything evolves.</h2></div><p>Mutate one signal or fuse two deterministic DNA records. Every child remembers where it came from.</p><Link href={`/remix/${sampleVektors[0].slug}?data=${encodeDNA(sampleVektors[0].dna)}`}>Begin a remix <ArrowUpRight /></Link></section>
      <section className="final-cta"><p>THE FIELD IS WAITING</p><h2>Shape something that<br />has never existed before.</h2><Link href="/lab">Enter the Lab <ArrowUpRight /></Link></section>
      <footer className="site-footer"><span>VEKTORIX © 2026</span><span>No prompts. No AI. Only motion, sound and mathematics.</span></footer>
    </main>
  );
}
