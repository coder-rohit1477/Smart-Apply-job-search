import type { ParsedResume, ResumeSkill } from "@/types/resume";

export function normalizeResumeText(rawText: string) {
  return rawText
    .replace(/\u00a0/g, " ")
    .replace(/\r\n/g, "\n")
    .replace(/\t/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function splitNormalizedLines(rawText: string) {
  return normalizeResumeText(rawText)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function cleanBullet(line: string) {
  return line.replace(/^[\u2022•*\-–—]+\s*/, "").trim();
}

export function normalizeSkillName(value: string) {
  return value
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[()]/g, "")
    .trim();
}

export function dedupeStrings(values: string[]) {
  const seen = new Set<string>();

  return values.filter((value) => {
    const normalizedValue = value.trim().toLowerCase();

    if (!normalizedValue || seen.has(normalizedValue)) {
      return false;
    }

    seen.add(normalizedValue);
    return true;
  });
}

export function dedupeSkills(skills: ResumeSkill[]) {
  const seen = new Set<string>();

  return skills.filter((skill) => {
    if (seen.has(skill.normalizedName)) {
      return false;
    }

    seen.add(skill.normalizedName);
    return true;
  });
}

export function createEmptyParsedResume(): ParsedResume {
  return {
    fullName: null,
    email: null,
    phoneNumber: null,
    headline: null,
    summary: null,
    estimatedYearsOfExperience: null,
    skills: [],
    projects: [],
    education: [],
    experience: [],
    certifications: [],
  };
}

export function formatHeadlineCandidate(value: string) {
  const normalizedValue = cleanBullet(value).replace(/\s+/g, " ").trim();

  if (!normalizedValue || normalizedValue.length > 120) {
    return null;
  }

  return normalizedValue;
}

export function formatSummaryFromLines(lines: string[], limit = 280) {
  const summary = lines.join(" ").replace(/\s+/g, " ").trim();

  if (!summary) {
    return null;
  }

  if (summary.length <= limit) {
    return summary;
  }

  return `${summary.slice(0, limit - 3).trimEnd()}...`;
}

export function splitInlineList(value: string) {
  return value
    .split(/[,|/•]/)
    .map((entry) => cleanBullet(entry))
    .filter(Boolean);
}
