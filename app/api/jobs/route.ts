import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/api-auth";
import { getStore } from "@/lib/storage";

const createJobSchema = z.object({
  title: z.string().min(3),
  company: z.string().min(2),
  location: z.string().min(2),
  type: z.enum(["full-time", "part-time", "contract", "internship"]),
  description: z.string().min(10),
  skills: z.array(z.string().min(1)).min(1),
});

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.toLowerCase();
  const store = getStore();
  const jobs = query
    ? store.jobs.filter(
        (job) =>
          job.title.toLowerCase().includes(query) ||
          job.company.toLowerCase().includes(query) ||
          job.skills.some((skill) => skill.toLowerCase().includes(query)),
      )
    : store.jobs;

  return NextResponse.json({ jobs });
}

export async function POST(request: NextRequest) {
  const { error, user } = requireAuth(request, "recruiter");
  if (error || !user) {
    return error;
  }

  const body = await request.json().catch(() => null);
  const parsed = createJobSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid job payload" }, { status: 400 });
  }

  const store = getStore();
  const job = {
    id: randomUUID(),
    postedBy: user.id,
    createdAt: new Date().toISOString(),
    ...parsed.data,
  };

  store.jobs.unshift(job);
  return NextResponse.json({ job }, { status: 201 });
}
