import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { db } from "@/lib/db";
import { cache } from "@/lib/redis";
import { getStripe } from "@/lib/stripe";

function planFromPrice(priceId?: string | null) {
  if (priceId?.toLowerCase().includes("enterprise")) return "ENTERPRISE" as const;
  return "PRO" as const;
}

function subscriptionStatus(status: Stripe.Subscription.Status) {
  switch (status) {
    case "active": return "ACTIVE" as const;
    case "trialing": return "TRIALING" as const;
    case "past_due":
    case "unpaid": return "PAST_DUE" as const;
    case "canceled": return "CANCELED" as const;
    default: return "INCOMPLETE" as const;
  }
}

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!stripe || !secret || !signature) return NextResponse.json({ error: "Stripe webhook is not configured" }, { status: 503 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await request.text(), signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (["customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted"].includes(event.type)) {
    const subscription = event.data.object as Stripe.Subscription;
    const workspaceId = subscription.metadata.workspaceId;
    const priceId = subscription.items.data[0]?.price.id;
    if (workspaceId) {
      const stripeSubscription = subscription as Stripe.Subscription & { current_period_end?: number };
      await db.subscription.upsert({
        where: { stripeSubscriptionId: subscription.id },
        update: {
          plan: event.type === "customer.subscription.deleted" ? "FREE" : planFromPrice(priceId),
          status: event.type === "customer.subscription.deleted" ? "CANCELED" : subscriptionStatus(subscription.status),
          stripePriceId: priceId,
          currentPeriodEnd: stripeSubscription.current_period_end ? new Date(stripeSubscription.current_period_end * 1000) : null,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        },
        create: {
          workspaceId,
          stripeSubscriptionId: subscription.id,
          stripePriceId: priceId,
          plan: event.type === "customer.subscription.deleted" ? "FREE" : planFromPrice(priceId),
          status: event.type === "customer.subscription.deleted" ? "CANCELED" : subscriptionStatus(subscription.status),
          currentPeriodEnd: stripeSubscription.current_period_end ? new Date(stripeSubscription.current_period_end * 1000) : null,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        },
      });
      await cache.invalidateWorkspace(workspaceId);
    }
  }

  return NextResponse.json({ received: true });
}
