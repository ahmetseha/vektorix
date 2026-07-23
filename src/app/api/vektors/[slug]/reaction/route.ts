import { NextResponse } from "next/server";
import { allowRequest } from "@/server/rate-limit";
import { vektorRepository } from "@/server/services/vektor-repository";

export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const session = request.headers.get("x-vektorix-session") ?? "anonymous";
  if (!allowRequest(`reaction:${session}`, 30)) return NextResponse.json({ error: "Slow down." }, { status: 429 });
  const result = vektorRepository.toggleReaction(slug, session);
  return result ? NextResponse.json(result) : NextResponse.json({ error: "Vektor not found." }, { status: 404 });
}
