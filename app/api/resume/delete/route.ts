import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentSessionUser } from "@/lib/auth";
import { buildResumeErrorResponse, deleteResumeForActor } from "@/services/resume-service";
import type { DeleteResponse } from "@/types/resume";

export const runtime = "nodejs";

const deleteResumeSchema = z.object({
  resumeId: z.string().trim().min(1, "resumeId is required."),
});

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentSessionUser();

    if (!user) {
      return NextResponse.json<DeleteResponse>(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "You must be signed in to delete a resume.",
          },
        },
        { status: 401 },
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json<DeleteResponse>(
        {
          success: false,
          error: {
            code: "INVALID_FILE",
            message: "Invalid request body.",
          },
        },
        { status: 400 },
      );
    }

    const parsed = deleteResumeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json<DeleteResponse>(
        {
          success: false,
          error: {
            code: "INVALID_FILE",
            message: "resumeId is required.",
          },
        },
        { status: 400 },
      );
    }

    const result = await deleteResumeForActor({
      actor: {
        clerkUserId: user.id,
        email: user.email,
        firstName: user.firstName,
      },
      resumeId: parsed.data.resumeId,
    });

    return NextResponse.json<DeleteResponse>(result, {
      status: 200,
    });
  } catch (error) {
    const response = buildResumeErrorResponse(error);

    return NextResponse.json<DeleteResponse>(response.body, {
      status: response.status,
    });
  }
}
