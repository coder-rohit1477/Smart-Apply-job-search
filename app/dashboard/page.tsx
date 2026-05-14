import { auth, currentUser } from "@clerk/nextjs/server";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { MatchCard } from "@/components/dashboard/match-card";
import { MetricCard } from "@/components/dashboard/metric-card";
import { PipelineCard } from "@/components/dashboard/pipeline-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardSnapshot } from "@/services/dashboard-service";
import { routes } from "@/utils/routes";

export default async function DashboardPage() {
  const { userId } = await auth.protect();

  const [user, snapshot] = await Promise.all([
    currentUser(),
    getDashboardSnapshot(userId),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10">
      {/* Hero Card */}
      <section className="grid gap-6 rounded-[2rem] border border-border/60 bg-card/70 p-8 shadow-[0_30px_90px_-50px_rgba(15,23,42,0.4)] backdrop-blur-xl lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          <Badge variant="secondary" className="w-fit">
            Smart Apply Control Center
          </Badge>
          <div className="space-y-3">
            <h1 className="max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
              {user?.firstName
                ? `Welcome back, ${user.firstName}.`
                : "Welcome back."}
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              Your career operating system — powered by Clerk, Prisma, and PostgreSQL.
              Resume parsing, ATS scoring, and job matching all in one workflow.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <a href={routes.dashboard}>Refresh insights</a>
            </Button>
            <Button variant="outline" asChild>
              <a href={routes.dashboardResume}>Manage resume</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="#recommendations">Review priorities</a>
            </Button>
          </div>
        </div>

        <Card className="border-border/60 bg-background/70">
          <CardHeader className="space-y-2">
            <CardTitle className="text-lg">Resume focus</CardTitle>
            <p className="text-sm text-muted-foreground">
              Parsed profile derived from your latest resume.
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <p className="text-sm text-muted-foreground">Target role</p>
              <p className="text-xl font-semibold">
                {snapshot.resumeProfile.roleFocus}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/60 bg-card px-4 py-3">
                <p className="text-sm text-muted-foreground">Seniority</p>
                <p className="mt-1 font-medium">{snapshot.resumeProfile.seniority}</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-card px-4 py-3">
                <p className="text-sm text-muted-foreground">Experience</p>
                <p className="mt-1 font-medium">
                  {snapshot.resumeProfile.yearsOfExperience} years
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {snapshot.resumeProfile.strengths.map((strength) => (
                <Badge key={strength} variant="outline">
                  {strength}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Metrics Row */}
      <section className="grid gap-4 md:grid-cols-3">
        {snapshot.metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      {/* Recommendations + Activity */}
      <section
        id="recommendations"
        className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]"
      >
        <div className="space-y-4">
          <SectionHeading
            eyebrow="AI priorities"
            title="Recommended next moves"
            description="Actionable suggestions generated from the matching, ATS, and activity domains."
          />
          <div className="grid gap-4">
            {snapshot.recommendations.map((recommendation) => (
              <Card
                key={recommendation.id}
                className="border-border/60 bg-card/70 backdrop-blur"
              >
                <CardHeader className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle className="text-lg">{recommendation.title}</CardTitle>
                    <Badge variant="secondary">{recommendation.impact}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {recommendation.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <ActivityFeed items={snapshot.activities} />
      </section>

      {/* Pipeline + Matches */}
      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-4">
          <SectionHeading
            eyebrow="Pipeline"
            title="Application workflow"
            description="Each card maps to the PostgreSQL-backed application state."
          />
          <div className="grid gap-4">
            {snapshot.pipeline.map((item) => (
              <PipelineCard key={item.id} item={item} />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <SectionHeading
            eyebrow="Top matches"
            title="Highest-fit roles"
            description="Roles scored through ATS and matching services."
          />
          <div className="grid gap-4">
            {snapshot.matches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
