import "server-only";
import type { Prisma, Resume } from "@prisma/client";
import { z } from "zod";
import { createEmptyParsedResume } from "@/lib/parsers/normalize";
import { prisma } from "@/lib/prisma";
import { deleteLocalResumeFile, uploadLocalResumeFile } from "@/lib/upload/local-upload";
import { ensureUserProfile } from "@/lib/user-profiles";
import {
  toValidationError,
  validateResumeFileDescriptor,
} from "@/lib/validations/resume-validation";
import {
  parsedResumeSchema,
  storedResumeSchema,
  type DeleteResponse,
  type ParsedResume,
  type ParserResult,
  type ResumeApiError,
  type ResumeErrorCode,
  type StoredResume,
} from "@/types/resume";

interface ResumeActor {
  clerkUserId: string;
  email: string | null;
  firstName: string | null;
}

export class ResumeServiceError extends Error {
  readonly code: ResumeErrorCode;
  readonly details?: string[];
  readonly status: number;

  constructor(
    code: ResumeErrorCode,
    message: string,
    status: number,
    details?: string[],
  ) {
    super(message);
    this.name = "ResumeServiceError";
    this.code = code;
    this.status = status;
    this.details = details;
  }

  toApiError(): ResumeApiError {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
    };
  }
}

export async function uploadResumeForActor(input: {
  actor: ResumeActor;
  file: File;
}) {
  const buffer = await readResumeFile(input.file);
  const parserResult = await parseResumeOnly({ file: input.file, buffer });
  const uploadedFile = await uploadLocalResumeFile({
    buffer,
    clerkUserId: input.actor.clerkUserId,
    originalFileName: input.file.name,
  });

  try {
    const userProfile = await ensureUserProfile({
      clerkUserId: input.actor.clerkUserId,
      email: input.actor.email,
      firstName: input.actor.firstName ?? null,
    });
    const storedResume = await prisma.resume.create({
      data: {
        userId: userProfile.id,
        name: parserResult.parsedResume.fullName ?? input.file.name,
        version: null,
        targetRole: parserResult.parsedResume.headline,
        summary: parserResult.parsedResume.summary,
        atsScore: 0,
        parsedSkills: parserResult.parsedResume.skills.map((skill) => skill.name),
        fileName: input.file.name,
        fileType: input.file.type || "application/octet-stream",
        fileSize: input.file.size,
        fileUrl: uploadedFile.fileUrl,
        rawText: parserResult.rawText,
        parsedData: toParsedResumeJson(parserResult.parsedResume),
        extractedSkills: parserResult.parsedResume.skills.map((skill) => skill.name),
      },
    });

    return serializeStoredResume(storedResume);
  } catch (error) {
    // Try to clean up the uploaded file if DB save fails
    try {
      await deleteLocalResumeFile(uploadedFile.fileUrl);
    } catch {
      // Ignore cleanup errors
    }
    throw mapUnknownResumeError(error, "DATABASE_FAILED", "Unable to save the parsed resume.");
  }
}

export async function parseResumeOnly(input: {
  file: File;
  buffer?: Buffer;
}): Promise<ParserResult> {
  const validationIssues = validateResumeFileDescriptor({
    name: input.file.name,
    type: input.file.type,
    size: input.file.size,
  });

  if (validationIssues.length > 0) {
    const validationError = toValidationError(validationIssues);
    throw new ResumeServiceError(
      validationError.code,
      validationError.message,
      400,
      validationError.details,
    );
  }

  const buffer = input.buffer ?? (await readResumeFile(input.file));

  try {
    const { parseResumeBuffer } = await import("@/lib/parsers/parser-service");
    return await parseResumeBuffer({
      buffer,
      fileName: input.file.name,
      fileType: input.file.type || "application/octet-stream",
      fileSize: input.file.size,
      fileUrl: null,
    });
  } catch (error) {
    throw mapUnknownResumeError(
      error,
      "PARSE_FAILED",
      "We couldn't extract text from that resume. Try another PDF or DOCX file.",
    );
  }
}

export async function deleteResumeForActor(input: {
  actor: ResumeActor;
  resumeId: string;
}): Promise<DeleteResponseSuccess> {
  const existingResume = await prisma.resume.findFirst({
    where: {
      id: input.resumeId,
      user: {
        clerkUserId: input.actor.clerkUserId,
      },
    },
  });

  if (!existingResume) {
    throw new ResumeServiceError(
      "NOT_FOUND",
      "The requested resume could not be found.",
      404,
    );
  }

  await prisma.resume.delete({
    where: {
      id: existingResume.id,
    },
  });

  if (existingResume.fileUrl) {
    try {
      await deleteLocalResumeFile(existingResume.fileUrl);
    } catch {
      // Non-fatal: file deletion failure shouldn't block the response
    }
  }

  return {
    success: true,
    deletedResumeId: existingResume.id,
  };
}

export async function getLatestResumeForActor(
  clerkUserId: string,
): Promise<StoredResume | null> {
  const resume = await prisma.resume.findFirst({
    where: {
      user: {
        clerkUserId,
      },
    },
    select: {
      id: true,
      name: true,
      fileName: true,
      fileType: true,
      fileSize: true,
      fileUrl: true,
      parsedData: true,
      extractedSkills: true,
      parsedSkills: true,
      summary: true,
      rawText: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!resume) return null;

  return serializeStoredResume(resume as unknown as Resume);
}

export function buildResumeErrorResponse(error: unknown) {
  const resumeError =
    error instanceof ResumeServiceError
      ? error
      : isZodError(error)
        ? new ResumeServiceError(
            "INVALID_FILE",
            "The resume request payload was invalid.",
            400,
            getZodErrorMessages(error),
          )
        : mapUnknownResumeError(
            error,
            "UNKNOWN_ERROR",
            "Something went wrong while processing the resume.",
          );

  return {
    status: resumeError.status,
    body: {
      success: false,
      error: resumeError.toApiError(),
    } as const,
  };
}

type DeleteResponseSuccess = Extract<DeleteResponse, { success: true }>;

async function readResumeFile(file: File) {
  const arrayBuffer = await file.arrayBuffer();

  if (arrayBuffer.byteLength === 0) {
    throw new ResumeServiceError(
      "EMPTY_FILE",
      "The uploaded file is empty.",
      400,
    );
  }

  return Buffer.from(arrayBuffer);
}

function serializeStoredResume(resume: Resume | Record<string, unknown>) {
  const r = resume as Record<string, unknown>;
  const parsedResume = parseStoredResumeJson(r.parsedData as Prisma.JsonValue | null);

  const rawText =
    typeof r.rawText === "string" && r.rawText.length > 0
      ? r.rawText
      : typeof parsedResume.summary === "string"
        ? parsedResume.summary
        : typeof r.summary === "string"
          ? r.summary
          : "Resume text unavailable.";

  return storedResumeSchema.parse({
    id: r.id,
    metadata: {
      fileName: r.fileName ?? r.name,
      fileType: r.fileType ?? "application/octet-stream",
      fileSize: r.fileSize ?? 0,
      fileUrl: r.fileUrl ?? "",
    },
    rawText,
    parsedData: parsedResume,
    extractedSkills:
      Array.isArray(r.extractedSkills) && r.extractedSkills.length > 0
        ? r.extractedSkills
        : Array.isArray(r.parsedSkills)
          ? r.parsedSkills
          : [],
    createdAt: r.createdAt instanceof Date
      ? r.createdAt.toISOString()
      : String(r.createdAt),
    updatedAt: r.updatedAt instanceof Date
      ? r.updatedAt.toISOString()
      : String(r.updatedAt),
  });
}

function parseStoredResumeJson(parsedData: Prisma.JsonValue | null): ParsedResume {
  if (!parsedData) {
    return createEmptyParsedResume();
  }

  const parsed = parsedResumeSchema.safeParse(parsedData);

  if (parsed.success) {
    return parsed.data;
  }

  return createEmptyParsedResume();
}

function toParsedResumeJson(parsedResume: ParsedResume): Prisma.InputJsonObject {
  return {
    fullName: parsedResume.fullName,
    email: parsedResume.email,
    phoneNumber: parsedResume.phoneNumber,
    headline: parsedResume.headline,
    summary: parsedResume.summary,
    estimatedYearsOfExperience: parsedResume.estimatedYearsOfExperience,
    skills: parsedResume.skills.map((skill) => ({
      name: skill.name,
      normalizedName: skill.normalizedName,
      source: skill.source,
      confidence: skill.confidence,
    })),
    projects: parsedResume.projects,
    education: parsedResume.education,
    experience: parsedResume.experience,
    certifications: parsedResume.certifications,
  };
}

function mapUnknownResumeError(
  error: unknown,
  code: ResumeErrorCode,
  message: string,
): ResumeServiceError {
  if (error instanceof ResumeServiceError) {
    return error;
  }

  const errorMessage = error instanceof Error ? error.message : message;
  const finalCode: ResumeErrorCode =
    error instanceof Error && error.message.includes("supported")
      ? "INVALID_FILE_TYPE"
      : code;

  return new ResumeServiceError(
    finalCode,
    errorMessage,
    inferStatus(finalCode),
    error instanceof Error ? [error.message] : [],
  );
}

function inferStatus(code: ResumeErrorCode): number {
  switch (code) {
    case "UNAUTHORIZED":
      return 401;
    case "FORBIDDEN":
      return 403;
    case "NOT_FOUND":
      return 404;
    case "INVALID_FILE":
    case "INVALID_FILE_TYPE":
    case "FILE_TOO_LARGE":
    case "EMPTY_FILE":
      return 400;
    case "PARSE_FAILED":
    case "CORRUPTED_FILE":
      return 422;
    case "STORAGE_FAILED":
    case "DATABASE_FAILED":
      return 500;
    case "UNKNOWN_ERROR":
    default:
      return 500;
  }
}

// Zod v4 compatibility helpers
function isZodError(error: unknown): boolean {
  return error instanceof z.ZodError;
}

function getZodErrorMessages(error: unknown): string[] {
  if (error instanceof z.ZodError) {
    // Zod v4 uses .errors, v3 uses .issues — handle both
    const issues = (error as z.ZodError).issues ?? [];
    return issues.map((issue) => issue.message);
  }
  return [];
}
