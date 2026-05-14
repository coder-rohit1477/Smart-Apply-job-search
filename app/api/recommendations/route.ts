import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { recommendJobsBySkills } from "@/lib/recommendations";
import { getStore } from "@/lib/storage";

export async function GET(request: NextRequest) {
  const { error, user } = requireAuth(request, "candidate");
  if (error || !user) {
    return error;
  }

  const store = getStore();
  const latestResume = user.resumes[0];
  const recommendations = latestResume ? recommendJobsBySkills(latestResume.skills, store.jobs) : [];

  return NextResponse.json({
    recommendations: recommendations.map((entry) => ({
      ...entry.job,
      matchScore: Math.round(entry.score * 100),
    })),
  });
}
