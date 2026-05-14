import type { ParsedResume, ResumeSkill } from "@/types/resume";
import {
  cleanBullet,
  createEmptyParsedResume,
  dedupeSkills,
  dedupeStrings,
  formatHeadlineCandidate,
  formatSummaryFromLines,
  normalizeResumeText,
  normalizeSkillName,
  splitInlineList,
  splitNormalizedLines,
} from "@/lib/parsers/normalize";

type ResumeSectionKey =
  | "skills"
  | "projects"
  | "education"
  | "experience"
  | "certifications";

const SECTION_ALIASES: Record<ResumeSectionKey, string[]> = {
  skills: [
    "skills",
    "technical skills",
    "core competencies",
    "technologies",
    "tooling",
  ],
  projects: ["projects", "selected projects", "project experience"],
  education: ["education", "academic background", "academics"],
  experience: [
    "experience",
    "work experience",
    "professional experience",
    "employment history",
    "career history",
  ],
  certifications: ["certifications", "licenses", "awards"],
};

const COMMON_SKILLS = [
  "accessibility",
  "agile",
  "aws",
  "azure",
  "c",
  "c#",
  "c++",
  "ci/cd",
  "clerk",
  "css",
  "cypress",
  "design systems",
  "django",
  "docker",
  "express",
  "figma",
  "firebase",
  "flask",
  "gatsby",
  "gcp",
  "git",
  "github actions",
  "go",
  "google analytics",
  "graphql",
  "html",
  "java",
  "javascript",
  "jest",
  "jira",
  "kubernetes",
  "laravel",
  "mongodb",
  "mysql",
  "nest.js",
  "next.js",
  "node.js",
  "nosql",
  "pandas",
  "php",
  "postgresql",
  "prisma",
  "product strategy",
  "project management",
  "python",
  "react",
  "react native",
  "redis",
  "redux",
  "rest api",
  "ruby",
  "rust",
  "scrum",
  "seo",
  "shopify",
  "sql",
  "storybook",
  "svelte",
  "tailwind",
  "terraform",
  "testing",
  "typescript",
  "ui/ux",
  "user research",
  "vercel",
  "vue",
  "web performance",
  "wordpress",
];

interface ResumeSections {
  skills: string[];
  projects: string[];
  education: string[];
  experience: string[];
  certifications: string[];
}

export function extractStructuredResume(rawText: string): ParsedResume {
  const normalizedText = normalizeResumeText(rawText);
  const lines = splitNormalizedLines(normalizedText);
  const sections = extractSections(lines);
  const fullName = extractFullName(lines);
  const email = extractEmail(normalizedText);
  const phoneNumber = extractPhoneNumber(normalizedText);
  const headline = extractHeadline(lines, fullName);
  const summary = extractSummary(lines, fullName, headline);
  const skills = extractSkills(normalizedText, sections);

  return {
    ...createEmptyParsedResume(),
    fullName,
    email,
    phoneNumber,
    headline,
    summary,
    estimatedYearsOfExperience: extractYearsOfExperience(normalizedText),
    skills,
    projects: normalizeSectionEntries(sections.projects),
    education: normalizeSectionEntries(sections.education),
    experience: normalizeSectionEntries(sections.experience),
    certifications: normalizeSectionEntries(sections.certifications),
  };
}

export function extractSections(lines: string[]): ResumeSections {
  const sections: ResumeSections = {
    skills: [],
    projects: [],
    education: [],
    experience: [],
    certifications: [],
  };

  let currentSection: ResumeSectionKey | null = null;

  for (const line of lines) {
    const detectedSection = detectSection(line);

    if (detectedSection) {
      currentSection = detectedSection;
      continue;
    }

    if (currentSection) {
      sections[currentSection].push(line);
    }
  }

  return sections;
}

export function extractEmail(rawText: string) {
  const match = rawText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);

  return match?.[0]?.toLowerCase() ?? null;
}

export function extractPhoneNumber(rawText: string) {
  const match = rawText.match(
    /(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)?\d{3}[\s.-]?\d{4}/,
  );

  return match?.[0]?.replace(/\s+/g, " ").trim() ?? null;
}

export function extractFullName(lines: string[]) {
  const candidate = lines.find((line) => isNameCandidate(line));

  return candidate ?? null;
}

export function extractHeadline(lines: string[], fullName: string | null) {
  const candidateLines = lines.filter((line) => {
    if (line === fullName) {
      return false;
    }

    if (extractEmail(line) || extractPhoneNumber(line) || detectSection(line)) {
      return false;
    }

    return true;
  });

  return formatHeadlineCandidate(candidateLines[0] ?? "");
}

export function extractSummary(
  lines: string[],
  fullName: string | null,
  headline: string | null,
) {
  const summaryLines = lines.filter((line) => {
    if (line === fullName || line === headline) {
      return false;
    }

    if (extractEmail(line) || extractPhoneNumber(line) || detectSection(line)) {
      return false;
    }

    return line.length > 40;
  });

  return formatSummaryFromLines(summaryLines.slice(0, 3));
}

export function extractYearsOfExperience(rawText: string) {
  const normalizedText = rawText.toLowerCase();
  const directMatch =
    normalizedText.match(/(\d{1,2})\+?\s+years? of experience/) ??
    normalizedText.match(/over\s+(\d{1,2})\s+years?/);

  if (directMatch) {
    return Number.parseInt(directMatch[1], 10);
  }

  return null;
}

export function extractSkills(
  rawText: string,
  sections: ResumeSections,
): ResumeSkill[] {
  const sectionSkills = sections.skills
    .flatMap((entry) => splitInlineList(entry))
    .map((entry) => normalizeSkill(entry, "skills-section", "high"))
    .filter((entry): entry is ResumeSkill => Boolean(entry));

  const keywordMatches = COMMON_SKILLS.filter((skill) =>
    includesSkill(rawText, skill),
  )
    .map((skill) => normalizeSkill(skill, "keyword-match", "medium"))
    .filter((entry): entry is ResumeSkill => Boolean(entry));

  const inferredSkills = sections.experience
    .concat(sections.projects)
    .flatMap((entry) => matchInlineSkills(entry))
    .map((skill) => normalizeSkill(skill, "section-inference", "medium"))
    .filter((entry): entry is ResumeSkill => Boolean(entry));

  return dedupeSkills([...sectionSkills, ...keywordMatches, ...inferredSkills]).sort(
    (left, right) => left.name.localeCompare(right.name),
  );
}

function detectSection(line: string): ResumeSectionKey | null {
  const normalizedLine = line
    .toLowerCase()
    .replace(/[:|]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  for (const [section, aliases] of Object.entries(SECTION_ALIASES)) {
    if (aliases.includes(normalizedLine)) {
      return section as ResumeSectionKey;
    }
  }

  return null;
}

function normalizeSectionEntries(entries: string[]) {
  return dedupeStrings(
    entries
      .map((entry) => cleanBullet(entry))
      .map((entry) => entry.replace(/\s+/g, " ").trim())
      .filter((entry) => entry.length > 1),
  );
}

function normalizeSkill(
  value: string,
  source: ResumeSkill["source"],
  confidence: ResumeSkill["confidence"],
) {
  const cleanedValue = cleanBullet(value).replace(/\s+/g, " ").trim();
  const normalizedName = normalizeSkillName(cleanedValue);

  if (!cleanedValue || cleanedValue.length < 2 || cleanedValue.length > 40) {
    return null;
  }

  if (!/[a-z0-9]/i.test(cleanedValue)) {
    return null;
  }

  return {
    name: cleanedValue,
    normalizedName,
    source,
    confidence,
  } satisfies ResumeSkill;
}

function isNameCandidate(line: string) {
  if (extractEmail(line) || extractPhoneNumber(line) || detectSection(line)) {
    return false;
  }

  if (line.length < 3 || line.length > 60 || /\d/.test(line)) {
    return false;
  }

  const words = line
    .replace(/[|,]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  return words.length >= 2 && words.length <= 5;
}

function includesSkill(rawText: string, skill: string) {
  const normalizedText = rawText.toLowerCase();

  if (skill === "c" || skill === "go") {
    return new RegExp(`(^|[^a-z])${skill}([^a-z]|$)`, "i").test(normalizedText);
  }

  if (skill.includes("+") || skill.includes(".") || skill.includes("/")) {
    return normalizedText.includes(skill.toLowerCase());
  }

  return new RegExp(`\\b${escapeRegExp(skill)}\\b`, "i").test(normalizedText);
}

function matchInlineSkills(entry: string) {
  return COMMON_SKILLS.filter((skill) => includesSkill(entry, skill));
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
