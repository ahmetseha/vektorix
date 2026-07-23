import type { VektorDNA } from "@/features/lab/schemas/dna";

export function OrganismPoster({ dna, label }: { dna: VektorDNA; label: string }) {
  const style = {
    "--poster-primary": dna.visual.palette.primary,
    "--poster-secondary": dna.visual.palette.secondary,
    "--poster-accent": dna.visual.palette.accent,
    "--poster-bg": dna.visual.palette.background,
    "--poster-spin": `${10 + dna.visual.motion.orbitStrength * 16}s`,
    "--poster-scale-x": String(0.82 + dna.visual.form.elongation * 0.32),
  } as React.CSSProperties;
  return <div className="organism-poster" style={style} role="img" aria-label={label}><i /><i /><span /></div>;
}
