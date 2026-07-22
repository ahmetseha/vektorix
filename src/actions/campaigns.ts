"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { cache } from "@/lib/redis";
import { assertWorkspaceAccess } from "@/lib/auth";

const campaignSchema = z.object({
  workspaceId: z.string().min(1),
  name: z.string().min(3).max(80),
  channel: z.enum(["META_ADS", "GOOGLE_ADS", "TIKTOK_ADS", "EMAIL"]),
  budget: z.coerce.number().positive(),
  startsAt: z.coerce.date(),
});

export async function createCampaign(input: z.input<typeof campaignSchema>) {
  const data = campaignSchema.parse(input);
  await assertWorkspaceAccess(data.workspaceId);
  const campaign = await db.campaign.create({ data: { ...data, status: "DRAFT" } });
  await cache.invalidateWorkspace(data.workspaceId);
  return campaign;
}
