import { ImageResponse } from "next/og";
import { getSampleVektor } from "@/features/vektors/samples";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const record = getSampleVektor(slug);
  const palette = record?.dna.visual.palette ?? {
    background: "#07070A",
    primary: "#C7A0FF",
    secondary: "#5030A4",
    accent: "#F4E7FF",
  };

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          background: palette.background,
          color: "#F3F1EA",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background: `radial-gradient(circle at 68% 48%, ${palette.primary}30, transparent 34%), linear-gradient(115deg, ${palette.background}, #07070A)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 40,
            right: 52,
            bottom: 40,
            left: 52,
            display: "flex",
            border: "1px solid rgba(255,255,255,.16)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 132,
            display: "flex",
            width: 330,
            height: 330,
            borderRadius: "46% 54% 58% 42%",
            background: `radial-gradient(circle at 35% 30%, ${palette.accent}, ${palette.primary} 25%, ${palette.secondary} 68%, #07070A)`,
            boxShadow: `0 0 120px ${palette.primary}66`,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 68,
            left: 78,
            display: "flex",
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: 4,
          }}
        >
          VEKTORIX
        </div>
        <div
          style={{
            position: "absolute",
            left: 78,
            bottom: 76,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              marginBottom: 18,
              display: "flex",
              color: "rgba(243,241,234,.6)",
              fontSize: 15,
              letterSpacing: 3,
              textTransform: "uppercase",
            }}
          >
            {record?.dna.visual.archetype ?? "digital life"} / deterministic field
          </div>
          <div
            style={{
              display: "flex",
              maxWidth: 660,
              fontSize: 68,
              fontWeight: 500,
              letterSpacing: -4,
              lineHeight: 1,
            }}
          >
            {record?.name ?? "Shared Vektor"}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
