import type { VektorDNA } from "@/features/lab/schemas/dna";

export function OrganismPoster({ dna, label }: { dna: VektorDNA; label: string }) {
  const style = {
    "--poster-primary": dna.palette.primary,
    "--poster-secondary": dna.palette.secondary,
    "--poster-accent": dna.palette.accent,
    "--poster-bg": dna.palette.background,
    "--poster-spin": `${10 + dna.motion.orbitStrength * 16}s`,
    "--poster-scale-x": String(0.82 + dna.form.elongation * 0.32),
  } as React.CSSProperties;
  return <div className="organism-poster" style={style} role="img" aria-label={label}><i /><i /><span /></div>;
}
