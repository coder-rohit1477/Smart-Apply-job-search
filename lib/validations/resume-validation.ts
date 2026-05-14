import type { ResumeApiError, ResumeErrorCode } from "@/types/resume";

export const MAX_RESUME_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export const ACCEPTED_RESUME_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const ACCEPTED_RESUME_EXTENSIONS = [".pdf", ".docx"] as const;

export interface ResumeFileDescriptor {
  name: string;
  type: string;
  size: number;
}

export interface ResumeValidationIssue {
  code: ResumeErrorCode;
  message: string;
}

export function isAcceptedResumeMimeType(type: string) {
  return ACCEPTED_RESUME_MIME_TYPES.includes(
    type as (typeof ACCEPTED_RESUME_MIME_TYPES)[number],
  );
}

export function hasAcceptedResumeExtension(fileName: string) {
  const normalizedName = fileName.trim().toLowerCase();

  return ACCEPTED_RESUME_EXTENSIONS.some((extension) =>
    normalizedName.endsWith(extension),
  );
}

export function validateResumeFileDescriptor(
  file: ResumeFileDescriptor,
): ResumeValidationIssue[] {
  const issues: ResumeValidationIssue[] = [];

  if (!file.name.trim()) {
    issues.push({
      code: "INVALID_FILE",
      message: "The selected file must include a valid file name.",
    });
  }

  if (!hasAcceptedResumeExtension(file.name)) {
    issues.push({
      code: "INVALID_FILE_TYPE",
      message: "Only PDF and DOCX resume files are supported.",
    });
  }

  if (file.type && !isAcceptedResumeMimeType(file.type)) {
    issues.push({
      code: "INVALID_FILE_TYPE",
      message: "The uploaded file MIME type is not supported.",
    });
  }

  if (file.size === 0) {
    issues.push({
      code: "EMPTY_FILE",
      message: "The uploaded file is empty.",
    });
  }

  if (file.size > MAX_RESUME_FILE_SIZE_BYTES) {
    issues.push({
      code: "FILE_TOO_LARGE",
      message: "Resume files must be 5MB or smaller.",
    });
  }

  return dedupeValidationIssues(issues);
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function toValidationError(
  issues: ResumeValidationIssue[],
): ResumeApiError {
  return {
    code: issues[0]?.code ?? "INVALID_FILE",
    message:
      issues[0]?.message ??
      "The selected file did not pass resume upload validation.",
    details: issues.map((issue) => issue.message),
  };
}

function dedupeValidationIssues(issues: ResumeValidationIssue[]) {
  const seen = new Set<string>();

  return issues.filter((issue) => {
    const key = `${issue.code}:${issue.message}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}
