import "server-only";
import { Queue } from "bullmq";
import IORedis from "ioredis";

let analyticsQueue: Queue | null = null;

export function getAnalyticsQueue() {
  if (!process.env.REDIS_URL) return null;
  if (!analyticsQueue) {
    const connection = new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null });
    analyticsQueue = new Queue("analytics-sync", { connection });
  }
  return analyticsQueue;
}

export async function enqueueAnalyticsSync(workspaceId: string) {
  return getAnalyticsQueue()?.add("sync-workspace", { workspaceId }, {
    jobId: `analytics-${workspaceId}`,
    attempts: 3,
    backoff: { type: "exponential", delay: 1000 },
    removeOnComplete: 100,
    removeOnFail: 250,
  });
}
