import type { ActivityItem, JobRecord, PipelineItem } from "@/lib/types";

const featuredJobs: JobRecord[] = [
  {
    id: "role-bridge-labs",
    company: "Bridge Labs",
    title: "Staff Frontend Engineer",
    location: "Remote, US",
    schedule: "Remote",
    salary: "$175k - $205k",
    summary:
      "Lead product-quality frontend architecture across complex SaaS workflows and internal tooling.",
    skills: ["typescript", "react", "next.js", "design systems", "testing"],
    postedAt: "2 days ago",
    stage: "Shortlisted",
  },
  {
    id: "role-orbit-ai",
    company: "Orbit AI",
    title: "AI Product Engineer",
    location: "New York, NY",
    schedule: "Hybrid",
    salary: "$160k - $190k",
    summary:
      "Build AI-enabled user experiences spanning orchestration, product analytics, and collaborative workflows.",
    skills: ["typescript", "react", "llm workflows", "next.js", "accessibility"],
    postedAt: "4 days ago",
    stage: "Curated",
  },
  {
    id: "role-cascade-cloud",
    company: "Cascade Cloud",
    title: "Design Systems Lead",
    location: "San Francisco, CA",
    schedule: "Hybrid",
    salary: "$185k - $220k",
    summary:
      "Own the design system roadmap, performance standards, and frontend platform consistency across teams.",
    skills: ["design systems", "typescript", "react", "performance", "governance"],
    postedAt: "6 days ago",
    stage: "Applied",
  },
];

const pipelineItems: PipelineItem[] = [
  {
    id: "pipeline-bridge-labs",
    company: "Bridge Labs",
    title: "Staff Frontend Engineer",
    status: "Interview prep",
    nextStep: "Finalize system design examples",
    fitScore: 92,
    updatedAt: "2 hours ago",
  },
  {
    id: "pipeline-orbit-ai",
    company: "Orbit AI",
    title: "AI Product Engineer",
    status: "Resume tailoring",
    nextStep: "Add LLM workflow evidence",
    fitScore: 86,
    updatedAt: "Yesterday",
  },
  {
    id: "pipeline-cascade-cloud",
    company: "Cascade Cloud",
    title: "Design Systems Lead",
    status: "Applied",
    nextStep: "Prepare follow-up note",
    fitScore: 84,
    updatedAt: "2 days ago",
  },
];

const activityFeed: ActivityItem[] = [
  {
    id: "activity-1",
    title: "Resume parser refreshed profile strengths",
    description:
      "Smart Apply re-scored the resume and detected stronger design-system signals from the latest update.",
    time: "Today · 08:30",
  },
  {
    id: "activity-2",
    title: "ATS engine flagged one missing keyword cluster",
    description:
      "The Orbit AI role is missing evidence for LLM workflow delivery and product experimentation language.",
    time: "Today · 07:10",
  },
  {
    id: "activity-3",
    title: "Application pipeline advanced to interview prep",
    description:
      "Bridge Labs moved into the preparation stage, so Smart Apply surfaced system-design and leadership talking points.",
    time: "Yesterday · 17:40",
  },
];

export async function getFeaturedJobs(): Promise<JobRecord[]> {
  return featuredJobs;
}

export async function getPipelineItems(_userId?: string): Promise<PipelineItem[]> {
  return pipelineItems;
}

export async function getActivityFeed(_userId?: string): Promise<ActivityItem[]> {
  return activityFeed;
}
