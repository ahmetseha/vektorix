import { PrismaClient, CampaignChannel, CampaignStatus } from "@prisma/client";
import { monthlySales } from "../src/lib/mock-data";

const prisma = new PrismaClient();

async function main() {
  const workspace = await prisma.workspace.upsert({
    where: { slug: "spark-pixel-team" },
    update: {},
    create: { name: "Spark Pixel Team", slug: "spark-pixel-team" },
  });

  await Promise.all(
    monthlySales.map((metric, index) =>
      prisma.metric.upsert({
        where: { workspaceId_date: { workspaceId: workspace.id, date: new Date(2026, index, 1) } },
        update: {},
        create: {
          workspaceId: workspace.id,
          date: new Date(2026, index, 1),
          revenue: metric.newUser + metric.existingUser,
          orders: Math.round((metric.newUser + metric.existingUser) / 96),
          newCustomers: Math.round(metric.newUser / 84),
          newUserRevenue: metric.newUser,
          existingRevenue: metric.existingUser,
        },
      }),
    ),
  );

  await prisma.campaign.createMany({
    skipDuplicates: true,
    data: [
      { name: "Summer Retargeting", channel: CampaignChannel.META_ADS, status: CampaignStatus.ACTIVE, budget: 12000, spent: 8420, revenue: 29840, startsAt: new Date("2026-06-01"), workspaceId: workspace.id },
      { name: "Brand Search", channel: CampaignChannel.GOOGLE_ADS, status: CampaignStatus.ACTIVE, budget: 8500, spent: 5360, revenue: 18200, startsAt: new Date("2026-06-15"), workspaceId: workspace.id },
    ],
  });
}

main().finally(() => prisma.$disconnect());
