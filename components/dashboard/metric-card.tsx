import { TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { DashboardMetric } from "@/lib/types";

interface MetricCardProps {
  metric: DashboardMetric;
}

export function MetricCard({ metric }: MetricCardProps) {
  return (
    <Card className="border-border/60 bg-card/70 backdrop-blur">
      <CardContent className="space-y-4 p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">{metric.label}</p>
          <Badge variant={metric.trend === "up" ? "success" : "secondary"}>
            <TrendingUp className="mr-1 h-3.5 w-3.5" />
            {metric.delta}
          </Badge>
        </div>
        <div className="space-y-2">
          <p className="text-3xl font-semibold tracking-tight">{metric.value}</p>
          <p className="text-sm leading-6 text-muted-foreground">
            {metric.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
