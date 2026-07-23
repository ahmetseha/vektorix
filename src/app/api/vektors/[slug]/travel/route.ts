import { NextResponse } from "next/server";
import { z } from "zod";
import { biomeTypeSchema } from "@/features/simulation/schemas/biome";
import { allowRequest } from "@/server/rate-limit";
import { vektorRepository } from "@/server/services/vektor-repository";

const travelSchema = z.object({ biome: biomeTypeSchema }).strict();

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const client = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  if (!allowRequest(`travel:${client}:${slug}`, 12, 60_000)) {
    return NextResponse.json({ error: "The passage needs time to settle." }, { status: 429 });
  }
  const parsed = travelSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid biome." }, { status: 400 });
  }
  const record = vektorRepository.travel(slug, parsed.data.biome);
  if (!record) {
    return NextResponse.json({ error: "Vektor not found." }, { status: 404 });
  }
  return NextResponse.json(record);
}
