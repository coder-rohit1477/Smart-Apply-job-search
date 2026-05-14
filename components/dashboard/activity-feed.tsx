import { Clock3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { ActivityItem } from "@/lib/types";

interface ActivityFeedProps {
  items: ActivityItem[];
}

export function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <Card className="border-border/60 bg-card/70 backdrop-blur">
      <CardHeader className="space-y-2">
        <CardTitle className="text-xl">Recent activity</CardTitle>
        <p className="text-sm leading-7 text-muted-foreground">
          System events, AI actions, and application checkpoints appear here.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item, index) => (
          <div key={item.id} className="space-y-4">
            <div className="flex gap-4">
              <div className="mt-1 rounded-full bg-secondary p-2 text-primary">
                <Clock3 className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <p className="font-medium">{item.title}</p>
                <p className="text-sm leading-6 text-muted-foreground">
                  {item.description}
                </p>
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  {item.time}
                </p>
              </div>
            </div>
            {index < items.length - 1 ? <Separator /> : null}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
