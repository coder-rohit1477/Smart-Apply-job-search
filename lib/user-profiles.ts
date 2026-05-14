import "server-only";
import { prisma } from "@/lib/prisma";

interface EnsureUserProfileInput {
  clerkUserId: string;
  email: string | null;
  firstName: string | null;
}

export async function ensureUserProfile(input: EnsureUserProfileInput) {
  return prisma.userProfile.upsert({
    where: {
      clerkUserId: input.clerkUserId,
    },
    update: {
      email: input.email ?? `${input.clerkUserId}@smartapply.local`,
      firstName: input.firstName ?? undefined,
    },
    create: {
      clerkUserId: input.clerkUserId,
      email: input.email ?? `${input.clerkUserId}@smartapply.local`,
      firstName: input.firstName ?? undefined,
    },
  });
}
