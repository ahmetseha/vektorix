import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { cache } from "@/lib/redis";
import { monthlySales } from "@/lib/mock-data";
import { hasWorkspaceAccess } from "@/lib/auth";
import type { AnalyticsResponse } from "@/types";

const querySchema = z.object({
  workspaceId: z.string().min(1).default("demo-workspace"),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  channel: z.enum(["META_ADS", "GOOGLE_ADS", "TIKTOK_ADS", "EMAIL"]).optional(),
}).refine((value) => !value.from || !value.to || value.from <= value.to, { message: "'from' must be before 'to'" });

export async function GET(request: NextRequest) {
  const parsed = querySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid analytics query", issues: parsed.error.flatten() }, { status: 400 });
  }

  const { workspaceId, from, to, channel } = parsed.data;
  if (!(await hasWorkspaceAccess(workspaceId))) {
    return NextResponse.json({ error: "Unauthorized workspace" }, { status: 403 });
  }
  const cacheKey = `analytics:${workspaceId}:${from?.toISOString() ?? "start"}:${to?.toISOString() ?? "now"}:${channel ?? "all"}`;
  const cached = await cache.get<AnalyticsResponse>(cacheKey);
  if (cached) return NextResponse.json({ ...cached, cached: true });

  try {
    const [metrics, sales] = await Promise.all([
      db.metric.findMany({
        where: { workspaceId, date: { gte: from, lte: to } },
        orderBy: { date: "asc" },
      }),
      db.sale.aggregate({
        where: { workspaceId, soldAt: { gte: from, lte: to }, ...(channel ? { channel } : {}) },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    const response: AnalyticsResponse = {
      summary: {
        revenue: Number(sales._sum.amount ?? metrics.reduce((total, item) => total + Number(item.revenue), 0)),
        orders: sales._count || metrics.reduce((total, item) => total + item.orders, 0),
        newCustomers: metrics.reduce((total, item) => total + item.newCustomers, 0),
      },
      trend: metrics.map((item) => ({
        label: item.date.toLocaleDateString("en-US", { month: "short" }),
        newUser: Number(item.newUserRevenue),
        existingUser: Number(item.existingRevenue),
      })),
      cached: false,
    };
    await cache.set(cacheKey, response);
    return NextResponse.json(response);
  } catch (error) {
    if (process.env.NODE_ENV === "production") {
      console.error("Analytics query failed", error);
      return NextResponse.json({ error: "Analytics service unavailable" }, { status: 503 });
    }
    const fallback: AnalyticsResponse = {
      summary: { revenue: 20320, orders: 10320, newCustomers: 4305 },
      trend: monthlySales,
      cached: false,
    };
    return NextResponse.json(fallback, { headers: { "X-Vektorix-Data-Source": "demo" } });
  }
}
