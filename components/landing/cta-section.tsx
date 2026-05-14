import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { routes } from "@/utils/routes";

interface CTASectionProps {
  authenticated: boolean;
}

export function CTASection({ authenticated }: CTASectionProps) {
  const href = authenticated ? routes.dashboard : routes.signUp;
  const label = authenticated ? "Go to dashboard" : "Create your workspace";

  return (
    <section className="mx-auto w-full max-w-7xl px-6 pt-20">
      <Card className="overflow-hidden border-border/60 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--color-primary)_12%,var(--color-card)),color-mix(in_srgb,var(--color-chart-2)_14%,var(--color-card)))]">
        <CardContent className="flex flex-col gap-8 p-8 lg:flex-row lg:items-center lg:justify-between lg:p-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Built for App Router, Prisma, Clerk, and PostgreSQL
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-semibold tracking-tight">
                Start with a clean production baseline, then plug in your AI stack.
              </h2>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                The platform already has typed utilities, protected routes, modular
                services, and reusable shadcn-style components. Extend the
                matching engine, webhook sync, and background processing from here.
              </p>
            </div>
          </div>
          <Button asChild size="lg">
            <Link href={href} prefetch={href === routes.dashboard ? false : undefined}>
              {label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
