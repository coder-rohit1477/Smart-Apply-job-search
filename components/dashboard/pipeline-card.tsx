import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { PipelineItem } from "@/lib/types";

interface PipelineCardProps {
  item: PipelineItem;
}

export function PipelineCard({ item }: PipelineCardProps) {
  return (
    <Card className="border-border/60 bg-card/70 backdrop-blur">
      <CardContent className="space-y-5 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-lg font-semibold">
              {item.title} · {item.company}
            </p>
            <p className="text-sm text-muted-foreground">Updated {item.updatedAt}</p>
          </div>
          <Badge variant="secondary">{item.status}</Badge>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3">
            <p className="text-sm text-muted-foreground">Fit score</p>
            <p className="mt-1 font-medium">{item.fitScore}%</p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3">
            <p className="text-sm text-muted-foreground">Next step</p>
            <p className="mt-1 flex items-center gap-2 font-medium">
              {item.nextStep}
              <ArrowRight className="h-4 w-4 text-primary" />
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
