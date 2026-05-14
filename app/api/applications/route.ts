import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/api-auth";
import { getStore } from "@/lib/storage";

const applySchema = z.object({
  jobId: z.string().uuid(),
  coverLetter: z.string().max(2000).optional(),
});

export async function GET(request: NextRequest) {
  const { error, user } = requireAuth(request);
  if (error || !user) {
    return error;
  }

  const store = getStore();
  const applications =
    user.role === "recruiter"
      ? store.applications
      : store.applications.filter((application) => application.userId === user.id);

  return NextResponse.json({ applications });
}

export async function POST(request: NextRequest) {
  const { error, user } = requireAuth(request, "candidate");
  if (error || !user) {
    return error;
  }

  const body = await request.json().catch(() => null);
  const parsed = applySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid application payload" }, { status: 400 });
  }

  const store = getStore();
  const jobExists = store.jobs.some((job) => job.id === parsed.data.jobId);
  if (!jobExists) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const alreadyApplied = store.applications.some(
    (application) => application.jobId === parsed.data.jobId && application.userId === user.id,
  );
  if (alreadyApplied) {
    return NextResponse.json({ error: "Already applied" }, { status: 409 });
  }

  const application = {
    id: randomUUID(),
    jobId: parsed.data.jobId,
    userId: user.id,
    coverLetter: parsed.data.coverLetter,
    status: "applied" as const,
    createdAt: new Date().toISOString(),
  };

  store.applications.unshift(application);
  return NextResponse.json({ application }, { status: 201 });
}
