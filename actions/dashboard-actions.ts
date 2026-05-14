"use server";

import { auth } from "@clerk/nextjs/server";
import { getDashboardSnapshot } from "@/services/dashboard-service";

export async function getDashboardSnapshotAction() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  return getDashboardSnapshot(userId);
}
