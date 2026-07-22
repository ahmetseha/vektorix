import "server-only";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function hasWorkspaceAccess(workspaceId: string) {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || !process.env.CLERK_SECRET_KEY) return true;
  const { userId } = await auth();
  if (!userId) return false;
  const membership = await db.workspaceMember.findFirst({
    where: { workspaceId, user: { clerkId: userId } },
    select: { id: true },
  });
  return Boolean(membership);
}

export async function assertWorkspaceAccess(workspaceId: string) {
  if (!(await hasWorkspaceAccess(workspaceId))) throw new Error("Unauthorized workspace access");
}
