"use client";

import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadProgressProps {
  stage: "uploading" | "parsing" | "saving";
}

const STAGE_ORDER: UploadProgressProps["stage"][] = [
  "uploading",
  "parsing",
  "saving",
];

const STAGE_LABELS: Record<UploadProgressProps["stage"], string> = {
  uploading: "Uploading secure file",
  parsing: "Parsing resume content",
  saving: "Saving structured resume data",
};

export function UploadProgress({ stage }: UploadProgressProps) {
  const activeStageIndex = STAGE_ORDER.indexOf(stage);

  return (
    <div
      className="rounded-[1.5rem] border border-border/70 bg-card/80 p-5"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        <LoaderCircle className="h-5 w-5 animate-spin text-foreground" />
        <div>
          <p className="font-medium">{STAGE_LABELS[stage]}</p>
          <p className="text-sm text-muted-foreground">
            This usually completes in a few seconds.
          </p>
        </div>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {STAGE_ORDER.map((item, index) => (
          <div
            key={item}
            className={cn(
              "h-2 rounded-full bg-secondary",
              index <= activeStageIndex && "bg-foreground",
            )}
          />
        ))}
      </div>
    </div>
  );
}
