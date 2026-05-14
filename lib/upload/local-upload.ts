import "server-only";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const RESUME_UPLOAD_ROOT = path.join(
  process.cwd(),
  "public",
  "uploads",
  "resumes",
);

const PUBLIC_RESUME_URL_PREFIX = "/uploads/resumes";

interface UploadLocalResumeInput {
  buffer: Buffer;
  clerkUserId: string;
  originalFileName: string;
}

export async function uploadLocalResumeFile(input: UploadLocalResumeInput) {
  const extension = path.extname(input.originalFileName).toLowerCase() || ".bin";
  const safeBaseName = sanitizePathSegment(
    path.basename(input.originalFileName, extension),
  );
  const safeUserDirectory = sanitizePathSegment(input.clerkUserId);
  const storedFileName = `${randomUUID()}-${safeBaseName}${extension}`;
  const relativeDirectory = path.join(safeUserDirectory);
  const targetDirectory = path.join(RESUME_UPLOAD_ROOT, relativeDirectory);
  const targetFilePath = path.join(targetDirectory, storedFileName);

  await mkdir(targetDirectory, { recursive: true });
  await writeFile(targetFilePath, input.buffer);

  const relativeUrl = [PUBLIC_RESUME_URL_PREFIX, safeUserDirectory, storedFileName]
    .join("/")
    .replace(/\\/g, "/");

  return {
    fileUrl: relativeUrl,
    filePath: targetFilePath,
  };
}

export async function deleteLocalResumeFile(fileUrl: string) {
  if (!fileUrl.startsWith(PUBLIC_RESUME_URL_PREFIX)) {
    return;
  }

  const relativePath = fileUrl.replace(PUBLIC_RESUME_URL_PREFIX, "").replace(/^\//, "");
  const targetPath = path.join(RESUME_UPLOAD_ROOT, relativePath);

  try {
    await unlink(targetPath);
  } catch (error) {
    if (
      !(error instanceof Error) ||
      !("code" in error) ||
      error.code !== "ENOENT"
    ) {
      throw error;
    }
  }
}

function sanitizePathSegment(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64) || "resume";
}
