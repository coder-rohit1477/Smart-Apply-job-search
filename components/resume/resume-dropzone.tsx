"use client";

import { FileText, UploadCloud } from "lucide-react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { Button } from "@/components/ui/button";
import {
  ACCEPTED_RESUME_MIME_TYPES,
  MAX_RESUME_FILE_SIZE_BYTES,
  formatFileSize,
  toValidationError,
  validateResumeFileDescriptor,
} from "@/lib/validations/resume-validation";
import { cn } from "@/lib/utils";
import type { ResumeApiError } from "@/types/resume";

interface ResumeDropzoneProps {
  disabled?: boolean;
  onFileSelected: (file: File) => void;
  onValidationError: (error: ResumeApiError) => void;
}

const ACCEPT_CONFIG = {
  [ACCEPTED_RESUME_MIME_TYPES[0]]: [".pdf"],
  [ACCEPTED_RESUME_MIME_TYPES[1]]: [".docx"],
};

export function ResumeDropzone({
  disabled = false,
  onFileSelected,
  onValidationError,
}: ResumeDropzoneProps) {
  const { getRootProps, getInputProps, isDragActive, isDragReject, open } =
    useDropzone({
      accept: ACCEPT_CONFIG,
      disabled,
      maxSize: MAX_RESUME_FILE_SIZE_BYTES,
      multiple: false,
      noClick: true,
      noKeyboard: true,
      onDropAccepted: (files) => {
        const file = files[0];
        const issues = validateResumeFileDescriptor(file);

        if (issues.length > 0) {
          onValidationError(toValidationError(issues));
          return;
        }

        onFileSelected(file);
      },
      onDropRejected: (rejections) => {
        onValidationError(mapDropzoneError(rejections));
      },
    });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "rounded-[1.75rem] border border-dashed border-border/80 bg-background/70 p-8 transition-colors",
        isDragActive && "border-foreground/60 bg-secondary/40",
        isDragReject && "border-destructive/60 bg-destructive/5",
        disabled && "cursor-not-allowed opacity-70",
      )}
    >
      <input {...getInputProps()} aria-label="Upload resume file" />
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="rounded-full border border-border/70 bg-card p-4">
          {isDragActive ? (
            <UploadCloud className="h-8 w-8 text-foreground" />
          ) : (
            <FileText className="h-8 w-8 text-muted-foreground" />
          )}
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold tracking-tight">
            Drag and drop your resume
          </h3>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">
            Upload a PDF or DOCX up to {formatFileSize(MAX_RESUME_FILE_SIZE_BYTES)}.
            Validation runs before the file leaves the browser, then again on the
            server.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button type="button" onClick={open} disabled={disabled}>
            Choose file
          </Button>
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            PDF or DOCX only
          </span>
        </div>
      </div>
    </div>
  );
}

function mapDropzoneError(rejections: FileRejection[]): ResumeApiError {
  const issues = rejections.flatMap((rejection) =>
    rejection.errors.map((error) => {
      switch (error.code) {
        case "file-too-large":
          return {
            code: "FILE_TOO_LARGE" as const,
            message: "Resume files must be 5MB or smaller.",
          };
        case "file-invalid-type":
          return {
            code: "INVALID_FILE_TYPE" as const,
            message: "Only PDF and DOCX resume files are supported.",
          };
        default:
          return {
            code: "INVALID_FILE" as const,
            message: error.message,
          };
      }
    }),
  );

  return {
    code: issues[0]?.code ?? "INVALID_FILE",
    message: issues[0]?.message ?? "The selected file could not be uploaded.",
    details: issues.map((issue) => issue.message),
  };
}
