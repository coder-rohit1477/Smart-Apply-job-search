import { SectionHeading } from "@/components/shared/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { WORKFLOW_STEPS } from "@/lib/constants";

export function ProcessSection() {
  return (
    <section id="workflow" className="mx-auto w-full max-w-7xl px-6 pt-20">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <SectionHeading
          eyebrow="Workflow"
          title="From raw resume to targeted application in three steps"
          description="The product surface is simple for candidates, but the underlying flow is designed for extendable server-side automation and durable storage."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {WORKFLOW_STEPS.map((step, index) => (
            <Card key={step.title} className="border-border/60 bg-card/70 backdrop-blur">
              <CardContent className="space-y-4 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  0{index + 1}
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                  <p className="text-sm leading-7 text-muted-foreground">
                    {step.description}
                  </p>
                </div>
                <p className="text-sm font-medium text-foreground/80">{step.detail}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
