import { Job } from "./types";

export function recommendJobsBySkills(skills: string[], jobs: Job[]) {
  const normalized = skills.map((skill) => skill.toLowerCase());
  return jobs
    .map((job) => {
      const matches = job.skills.filter((skill) => normalized.includes(skill.toLowerCase())).length;
      const score = job.skills.length === 0 ? 0 : matches / job.skills.length;
      return { job, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}
