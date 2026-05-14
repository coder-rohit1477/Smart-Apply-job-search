import { Job } from "./types";

export function recommendJobsBySkills(skills: string[], jobs: Job[]) {
  const normalized = skills.map((skill) => skill.toLowerCase());
  return jobs
    .map((job) => {
      const normalizedJobSkills = job.skills.map((skill) => skill.toLowerCase());
      const matches = normalizedJobSkills.filter((skill) => normalized.includes(skill)).length;
      const unionCount = new Set([...normalized, ...normalizedJobSkills]).size;
      const score = unionCount === 0 ? 0 : matches / unionCount;
      return { job, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}
