import { NextResponse } from "next/server";
import { getCurrentSessionUser } from "@/lib/auth";
import { buildResumeErrorResponse, parseResumeOnly } from "@/services/resume-service";
import type { ParseResponse } from "@/types/resume";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const user = await getCurrentSessionUser();

    if (!user) {
      return NextResponse.json<ParseResponse>(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "You must be signed in to parse a resume.",
          },
        },
        { status: 401 },
      );
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json<ParseResponse>(
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
      return NextResponse.json<ParseResponse>(
        {
          success: false,
          error: {
            code: "INVALID_FILE",
            message: "The parse request did not include a resume file.",
          },
        },
        { status: 400 },
      );
    }

    const result = await parseResumeOnly({
      file: fileEntry,
    });

    return NextResponse.json<ParseResponse>(
      {
        success: true,
        result,
      },
      { status: 200 },
    );
  } catch (error) {
    const response = buildResumeErrorResponse(error);

    return NextResponse.json<ParseResponse>(response.body, {
      status: response.status,
    });
  }
}
