import { randomUUID } from "node:crypto";
import { Application, Job, User } from "./types";

type Store = {
  users: User[];
  jobs: Job[];
  applications: Application[];
};

const globalStore = globalThis as typeof globalThis & { __smartApplyStore?: Store };

function seedJobs(): Job[] {
  const now = new Date().toISOString();
  return [
    {
      id: randomUUID(),
      title: "Frontend Engineer",
      company: "Nova Labs",
      location: "Remote",
      type: "full-time",
      description: "Build modern React/Next.js UIs with strong accessibility practices.",
      skills: ["react", "next.js", "typescript", "tailwind"],
      postedBy: "system",
      createdAt: now,
    },
    {
      id: randomUUID(),
      title: "Backend Engineer",
      company: "DataForge",
      location: "Bangalore",
      type: "full-time",
      description: "Build secure APIs and data pipelines with Node.js and SQL databases.",
      skills: ["node.js", "postgresql", "api", "security"],
      postedBy: "system",
      createdAt: now,
    },
  ];
}

export function getStore() {
  if (!globalStore.__smartApplyStore) {
    globalStore.__smartApplyStore = { users: [], jobs: seedJobs(), applications: [] };
  }

  return globalStore.__smartApplyStore;
}
