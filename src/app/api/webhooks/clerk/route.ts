import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";

interface ClerkUserEvent {
  type: "user.created" | "user.updated" | "user.deleted";
  data: {
    id: string;
    first_name?: string | null;
    last_name?: string | null;
    image_url?: string | null;
    email_addresses?: Array<{ id: string; email_address: string }>;
    primary_email_address_id?: string | null;
  };
}

export async function POST(request: NextRequest) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Clerk webhook is not configured" }, { status: 503 });

  const headers = {
    "svix-id": request.headers.get("svix-id") ?? "",
    "svix-timestamp": request.headers.get("svix-timestamp") ?? "",
    "svix-signature": request.headers.get("svix-signature") ?? "",
  };

  let event: ClerkUserEvent;
  try {
    event = new Webhook(secret).verify(await request.text(), headers) as ClerkUserEvent;
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "user.deleted") {
    await db.user.deleteMany({ where: { clerkId: event.data.id } });
    return NextResponse.json({ received: true });
  }

  const primaryEmail = event.data.email_addresses?.find((email) => email.id === event.data.primary_email_address_id)?.email_address
    ?? event.data.email_addresses?.[0]?.email_address;
  if (!primaryEmail) return NextResponse.json({ error: "User email is required" }, { status: 422 });

  const name = [event.data.first_name, event.data.last_name].filter(Boolean).join(" ") || primaryEmail.split("@")[0];
  if (event.type === "user.created") {
    const workspaceSlug = `${slugify(name)}-${event.data.id.slice(-6).toLowerCase()}`;
    await db.user.upsert({
      where: { clerkId: event.data.id },
      update: { email: primaryEmail, name, imageUrl: event.data.image_url },
      create: {
        clerkId: event.data.id,
        email: primaryEmail,
        name,
        imageUrl: event.data.image_url,
        memberships: {
          create: {
            role: "OWNER",
            workspace: { create: { name: `${name}'s Workspace`, slug: workspaceSlug } },
          },
        },
      },
    });
  } else {
    await db.user.update({ where: { clerkId: event.data.id }, data: { email: primaryEmail, name, imageUrl: event.data.image_url } });
  }

  return NextResponse.json({ received: true });
}
