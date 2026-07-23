import { NextResponse } from "next/server";
import { vektorRepository } from "@/server/services/vektor-repository";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const record = vektorRepository.get(slug);
  return record ? NextResponse.json(record) : NextResponse.json({ error: "Vektor not found." }, { status: 404 });
}
