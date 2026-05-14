import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { performAiJobMatch } from "@/lib/ai/services/ai-job-match-service";
import { prisma } from "@/lib/prisma";

const matchSchema = z.object({
  resumeId: z.string().min(1),
  jobDescription: z.string().min(10),
});

export async function POST(req: Request) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { resumeId, jobDescription } = matchSchema.parse(body);

    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
    });

    if (!resume || !resume.rawText) {
      return NextResponse.json({ error: "Resume not found or has no text" }, { status: 404 });
    }

    const matchResult = await performAiJobMatch(resume.rawText, jobDescription);

    return NextResponse.json({
      success: true,
      match: matchResult,
    });
  } catch (error) {
    console.error("Job Match Error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to match job" }, { status: 500 });
  }
}
