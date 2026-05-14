import type { ResumeProfile } from "@/lib/types";
import { getKeywordOverlap } from "@/parser/resume-parser";

export function calculateAtsScore(
  profile: ResumeProfile,
  requiredSkills: string[],
) {
  const overlap = getKeywordOverlap(profile, requiredSkills).length;
  const overlapRatio = overlap / requiredSkills.length;
  const experienceBoost = Math.min(profile.yearsOfExperience * 2, 16);
  const rawScore = overlapRatio * 80 + experienceBoost;

  return Math.min(98, Math.round(rawScore));
}
