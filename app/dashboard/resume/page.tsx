import { auth } from "@clerk/nextjs/server";
import { ResumeUpload } from "@/components/resume/resume-upload";
import { Badge } from "@/components/ui/badge";
import { getLatestResumeForActor } from "@/services/resume-service";

export default async function ResumeDashboardPage() {
  const { userId } = await auth.protect();

  const latestResume = userId ? await getLatestResumeForActor(userId) : null;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10">
      <section className="rounded-[2rem] border border-border/60 bg-card/70 p-8 shadow-[0_30px_90px_-50px_rgba(15,23,42,0.4)] backdrop-blur-xl">
        <div className="max-w-3xl space-y-4">
          <Badge variant="secondary" className="w-fit">
            Resume Workspace
          </Badge>
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Upload and parse your resume
            </h1>
            <p className="text-base leading-7 text-muted-foreground">
              This workspace validates PDF and DOCX uploads, extracts structured
              profile data, and stores the result in PostgreSQL for downstream
              matching and ATS workflows.
            </p>
          </div>
        </div>
      </section>

      <ResumeUpload initialResume={latestResume} />
    </div>
  );
}
