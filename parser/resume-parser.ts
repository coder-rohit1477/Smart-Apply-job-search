import type { ResumeProfile } from "@/lib/types";
import { getLatestResumeForActor } from "@/services/resume-service";

const defaultResumeProfile: ResumeProfile = {
  roleFocus: "Senior Frontend Engineer",
  yearsOfExperience: 7,
  strengths: ["React architecture", "Design systems", "Product collaboration"],
  keywords: [
    "typescript",
    "react",
    "next.js",
    "performance",
    "design systems",
    "testing",
    "accessibility",
  ],
  seniority: "Senior",
};

export async function getResumeProfile(userId?: string): Promise<ResumeProfile> {
  if (!userId) {
    return defaultResumeProfile;
  }

  const latestResume = await getLatestResumeForActor(userId);

  if (!latestResume) {
    return defaultResumeProfile;
  }

  const strengths = latestResume.parsedData.skills
    .slice(0, 3)
    .map((skill) => skill.name);
  const yearsOfExperience =
    latestResume.parsedData.estimatedYearsOfExperience ??
    Math.min(Math.max(latestResume.parsedData.experience.length, 1), 15);
  const seniority =
    yearsOfExperience >= 8
      ? "Lead"
      : yearsOfExperience >= 4
        ? "Senior"
        : "Mid-level";

  return {
    roleFocus:
      latestResume.parsedData.headline ??
      latestResume.parsedData.experience[0] ??
      defaultResumeProfile.roleFocus,
    yearsOfExperience,
    strengths: strengths.length > 0 ? strengths : defaultResumeProfile.strengths,
    keywords:
      latestResume.extractedSkills.length > 0
        ? latestResume.extractedSkills
        : defaultResumeProfile.keywords,
    seniority,
  };
}

export function getKeywordOverlap(profile: ResumeProfile, skills: string[]) {
  const normalizedProfileKeywords = new Set(
    profile.keywords.map((keyword) => keyword.toLowerCase()),
  );

  return skills.filter((skill) => normalizedProfileKeywords.has(skill.toLowerCase()));
}
