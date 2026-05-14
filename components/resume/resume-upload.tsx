"use client";

import { useEffect, useState } from "react";
import { BrainCircuit, CheckCircle2, FileText, Search } from "lucide-react";
import { AiAnalysis } from "@/components/resume/ai-analysis";
import { JobMatcher } from "@/components/resume/job-matcher";
import { ParsedResumePreview } from "@/components/resume/parsed-resume-preview";
import { ResumeDropzone } from "@/components/resume/resume-dropzone";
import { UploadError } from "@/components/resume/upload-error";
import { UploadProgress } from "@/components/resume/upload-progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { uploadResponseSchema, deleteResponseSchema } from "@/types/resume";
import type { ResumeApiError, StoredResume } from "@/types/resume";

interface ResumeUploadProps {
  initialResume: StoredResume | null;
}

type UploadStage = "uploading" | "parsing" | "saving";
type ViewTab = "preview" | "analysis" | "matching";

const TABS: { id: ViewTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "preview", label: "Resume Preview", icon: FileText },
  { id: "analysis", label: "AI Analysis", icon: BrainCircuit },
  { id: "matching", label: "Job Matching", icon: Search },
];

export function ResumeUpload({ initialResume }: ResumeUploadProps) {
  const [resume, setResume] = useState<StoredResume | null>(initialResume);
  const [error, setError] = useState<ResumeApiError | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [lastFile, setLastFile] = useState<File | null>(null);
  const [stage, setStage] = useState<UploadStage>("uploading");
  const [activeTab, setActiveTab] = useState<ViewTab>("preview");

  useEffect(() => {
    if (!isUploading) return;

    const stages: UploadStage[] = ["uploading", "parsing", "saving"];
    let index = 0;
    const timer = window.setInterval(() => {
      index = Math.min(index + 1, stages.length - 1);
      setStage(stages[index]);
    }, 1200);

    return () => window.clearInterval(timer);
  }, [isUploading]);

  async function handleUpload(file: File) {
    setLastFile(file);
    setError(null);
    setIsUploading(true);
    setStage("uploading");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/resume/upload", {
        method: "POST",
        body: formData,
      });

      let payload: unknown;
      try {
        payload = await response.json();
      } catch {
        throw new Error("Server returned an invalid response.");
      }

      const parsed = uploadResponseSchema.safeParse(payload);
      if (!parsed.success) {
        throw new Error("Unexpected response format from server.");
      }

      if (!response.ok || !parsed.data.success) {
        setError(
          parsed.data.success
            ? { code: "UNKNOWN_ERROR", message: "The upload failed unexpectedly." }
            : parsed.data.error,
        );
        return;
      }

      setResume(parsed.data.resume);
      setActiveTab("preview");
    } catch (err: unknown) {
      setError({
        code: "UNKNOWN_ERROR",
        message: err instanceof Error ? err.message : "A network error interrupted the upload.",
        details: ["Check your connection and retry the upload."],
      });
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDelete() {
    if (!resume) return;

    if (
      !confirm(
        "Are you sure you want to delete your resume? This action cannot be undone.",
      )
    ) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch("/api/resume/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId: resume.id }),
      });

      let payload: unknown;
      try {
        payload = await response.json();
      } catch {
        throw new Error("Server returned an invalid response.");
      }

      const parsed = deleteResponseSchema.safeParse(payload);
      if (!parsed.success) {
        throw new Error("Unexpected response format from server.");
      }

      if (!response.ok || !parsed.data.success) {
        setError(
          parsed.data.success
            ? { code: "UNKNOWN_ERROR", message: "The deletion failed unexpectedly." }
            : parsed.data.error,
        );
        return;
      }

      setResume(null);
      setLastFile(null);
    } catch (err: unknown) {
      setError({
        code: "UNKNOWN_ERROR",
        message: err instanceof Error ? err.message : "A network error interrupted the deletion.",
        details: ["Check your connection and retry."],
      });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Card */}
      <Card className="border-border/60 bg-card/70">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">Resume upload</CardTitle>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            Upload the latest version of your resume to parse text, extract skills, and
            feed the Smart Apply workflow.
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          <ResumeDropzone
            disabled={isUploading || isDeleting}
            onFileSelected={handleUpload}
            onValidationError={setError}
          />

          {isUploading ? <UploadProgress stage={stage} /> : null}

          {error ? (
            <UploadError
              error={error}
              canRetry={Boolean(lastFile) && !isUploading && !isDeleting}
              onRetry={() => {
                if (lastFile) void handleUpload(lastFile);
              }}
              onDismiss={() => setError(null)}
            />
          ) : null}

          {!isUploading && !error && resume ? (
            <div
              className="flex items-start gap-3 rounded-[1.5rem] border border-emerald-500/20 bg-emerald-500/5 p-4"
              role="status"
              aria-live="polite"
            >
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <div>
                <p className="font-medium text-foreground">
                  Resume processed successfully
                </p>
                <p className="text-sm text-muted-foreground">
                  Structured data and extracted skills are now available in your
                  workspace.
                </p>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Tab Content */}
      {resume ? (
        <div className="space-y-6">
          {/* Tab Bar */}
          <div className="flex flex-wrap gap-1 border-b border-border/60 pb-0">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  "flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-sm font-medium transition-all",
                  "border-b-2 -mb-px",
                  activeTab === id
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          {activeTab === "preview" && (
            <ParsedResumePreview
              resume={resume}
              onDelete={handleDelete}
              isDeleting={isDeleting}
            />
          )}
          {activeTab === "analysis" && <AiAnalysis resume={resume} />}
          {activeTab === "matching" && <JobMatcher resume={resume} />}
        </div>
      ) : (
        <PreviewSkeleton />
      )}
    </div>
  );
}

function PreviewSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]" aria-hidden="true">
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-full bg-muted" />
        <div className="h-[380px] animate-pulse rounded-[1.75rem] border border-border/60 bg-card/50" />
      </div>
      <div className="grid gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-36 animate-pulse rounded-[1.75rem] border border-border/60 bg-card/50"
          />
        ))}
      </div>
    </div>
  );
}
