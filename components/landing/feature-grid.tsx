import { SectionHeading } from "@/components/shared/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FEATURE_CARDS } from "@/lib/constants";

export function FeatureGrid() {
  return (
    <section id="platform" className="mx-auto w-full max-w-7xl px-6 pt-20">
      <SectionHeading
        eyebrow="Platform architecture"
        title="A modular foundation for high-volume applications"
        description="Each feature area is separated into domain folders so matching logic, parsers, AI services, and workflow actions can evolve independently."
      />
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {FEATURE_CARDS.map((feature) => {
          const Icon = feature.icon;

          return (
            <Card
              key={feature.title}
              className="border-border/60 bg-card/70 backdrop-blur transition-transform duration-200 hover:-translate-y-1"
            >
              <CardHeader className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    {feature.eyebrow}
                  </p>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-7 text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
