import { NextResponse } from "next/server";
import { z } from "zod";
import { allowRequest } from "@/server/rate-limit";
import { vektorRepository } from "@/server/services/vektor-repository";

const reportSchema = z.object({ reason: z.enum(["spam", "abuse", "copyright", "other"]), details: z.string().max(500).optional() });

export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const session = request.headers.get("x-vektorix-session") ?? "anonymous";
  if (!allowRequest(`report:${session}`, 4, 3_600_000)) return NextResponse.json({ error: "Report limit reached." }, { status: 429 });
  try {
    reportSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid report." }, { status: 400 });
  }
  return vektorRepository.report(slug, session) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Vektor not found." }, { status: 404 });
}
