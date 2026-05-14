"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ResumeApiError } from "@/types/resume";

interface UploadErrorProps {
  error: ResumeApiError;
  canRetry: boolean;
  onRetry: () => void;
  onDismiss: () => void;
}

export function UploadError({
  error,
  canRetry,
  onRetry,
  onDismiss,
}: UploadErrorProps) {
  return (
    <div
      className="rounded-[1.5rem] border border-destructive/30 bg-destructive/5 p-5"
      role="alert"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 text-destructive" />
        <div className="min-w-0 flex-1 space-y-2">
          <div>
            <p className="font-medium text-destructive">{error.message}</p>
            {error.details?.length ? (
              <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
                {error.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {canRetry ? (
              <Button type="button" variant="outline" onClick={onRetry}>
                <RotateCcw className="h-4 w-4" />
                Retry upload
              </Button>
            ) : null}
            <Button type="button" variant="ghost" onClick={onDismiss}>
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
