export const palettes = [
  { id: "void-orchid", name: "Void Orchid", primary: "#C7A0FF", secondary: "#5030A4", accent: "#F4E7FF", background: "#07070A" },
  { id: "solar-flare", name: "Solar Flare", primary: "#FF6A2A", secondary: "#FFB000", accent: "#FFF0CC", background: "#0B0704" },
  { id: "ion-blue", name: "Ion Blue", primary: "#56D9FF", secondary: "#2256FF", accent: "#D8FAFF", background: "#04080C" },
  { id: "toxic-bloom", name: "Toxic Bloom", primary: "#B9FF38", secondary: "#268E56", accent: "#EDFFB7", background: "#060A06" },
  { id: "infrared", name: "Infrared", primary: "#FF385C", secondary: "#8B163D", accent: "#FFD3D9", background: "#0B0507" },
  { id: "deep-ocean", name: "Deep Ocean", primary: "#43F0CE", secondary: "#075F72", accent: "#C8FFF4", background: "#030A0B" },
  { id: "pale-signal", name: "Pale Signal", primary: "#F0EFDB", secondary: "#8E947B", accent: "#FFFFFF", background: "#080907" },
  { id: "monochrome", name: "Monochrome", primary: "#F3F1EA", secondary: "#6F7077", accent: "#FFFFFF", background: "#07070A" },
] as const;

export type PaletteId = (typeof palettes)[number]["id"];

export function getPalette(id: PaletteId) {
  return palettes.find((palette) => palette.id === id) ?? palettes[0];
}
