import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { getStore } from "@/lib/storage";

export async function GET(request: NextRequest) {
  const { error, user } = requireAuth(request, "recruiter");
  if (error || !user) {
    return error;
  }

  const store = getStore();
  const jobs = store.jobs.filter((job) => job.postedBy === user.id || job.postedBy === "system");
  const applications = store.applications.filter((application) =>
    jobs.some((job) => job.id === application.jobId),
  );

  return NextResponse.json({
    stats: {
      totalJobs: jobs.length,
      totalApplications: applications.length,
      activeCandidates: new Set(applications.map((application) => application.userId)).size,
    },
    recentApplications: applications.slice(0, 10),
  });
}
