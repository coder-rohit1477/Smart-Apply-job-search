import { NextResponse } from "next/server";
import { getCurrentSessionUser } from "@/lib/auth";
import { buildResumeErrorResponse, uploadResumeForActor } from "@/services/resume-service";
import type { UploadResponse } from "@/types/resume";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const user = await getCurrentSessionUser();

    if (!user) {
      return NextResponse.json<UploadResponse>(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "You must be signed in to upload a resume.",
          },
        },
        { status: 401 },
      );
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json<UploadResponse>(
        {
          success: false,
          error: {
            code: "INVALID_FILE",
            message: "The request must be multipart/form-data.",
          },
        },
        { status: 400 },
      );
    }

    const fileEntry = formData.get("file");

    if (!(fileEntry instanceof File)) {
      return NextResponse.json<UploadResponse>(
        {
          success: false,
          error: {
            code: "INVALID_FILE",
            message: "The upload request did not include a resume file.",
          },
        },
        { status: 400 },
      );
    }

    const resume = await uploadResumeForActor({
      actor: {
        clerkUserId: user.id,
        email: user.email,
        firstName: user.firstName,
      },
      file: fileEntry,
    });

    return NextResponse.json<UploadResponse>(
      {
        success: true,
        resume,
      },
      { status: 201 },
    );
  } catch (error) {
    const response = buildResumeErrorResponse(error);

    return NextResponse.json<UploadResponse>(response.body, {
      status: response.status,
    });
  }
}
