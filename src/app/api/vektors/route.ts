import { NextResponse } from "next/server";
import { publishVektorSchema } from "@/features/lab/schemas/dna";
import { parseVektorDNA } from "@/features/lab/engine/dna";
import { allowRequest } from "@/server/rate-limit";
import { vektorRepository } from "@/server/services/vektor-repository";

export async function GET() {
  return NextResponse.json({ items: vektorRepository.list() });
}

export async function POST(request: Request) {
  const client = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  if (!allowRequest(`publish:${client}`, 8, 60_000))
    return NextResponse.json(
      { error: "Too many creations. Let the field settle." },
      { status: 429 },
    );
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > 1_600_000)
    return NextResponse.json({ error: "Payload is too large." }, { status: 413 });
  try {
    const envelope = publishVektorSchema.parse(await request.json());
    const input = { ...envelope, dna: parseVektorDNA(envelope.dna) };
    const prohibited = /\b(?:fuck|shit|cunt|nazi)\b/i;
    if (prohibited.test(input.name) || prohibited.test(input.description)) {
      return NextResponse.json(
        { error: "Choose a different name or field note." },
        { status: 400 },
      );
    }
    return NextResponse.json(vektorRepository.create(input), { status: 201 });
  } catch {
    return NextResponse.json({ error: "The Vektor data is invalid." }, { status: 400 });
  }
}
