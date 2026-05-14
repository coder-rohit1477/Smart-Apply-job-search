import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";

const MAX_FILE_SIZE = 2 * 1024 * 1024;

function extractSkills(content: string) {
  const suggestedSkills = [
    "react",
    "next.js",
    "typescript",
    "javascript",
    "node.js",
    "mongodb",
    "postgresql",
    "python",
    "aws",
    "docker",
    "tailwind",
    "security",
    "api",
  ];

  const text = content.toLowerCase();
  return suggestedSkills.filter((skill) => text.includes(skill));
}

export async function POST(request: NextRequest) {
  const { error, user } = requireAuth(request, "candidate");
  if (error || !user) {
    return error;
  }

  const formData = await request.formData();
  const file = formData.get("resume");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Resume file is required" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File too large (max 2MB)" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const uploadDir = "/tmp/smart-apply-uploads";
  await mkdir(uploadDir, { recursive: true });
  const storedName = `${randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  await writeFile(join(uploadDir, storedName), buffer);

  const textPreview = buffer.toString("utf8");
  const resume = {
    id: randomUUID(),
    filename: file.name,
    uploadedAt: new Date().toISOString(),
    skills: extractSkills(textPreview),
  };

  user.resumes.unshift(resume);
  return NextResponse.json({ resume }, { status: 201 });
}
