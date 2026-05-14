import "server-only";
import { openai, getDefaultModel } from "../openai";
import { SKILL_GAP_PROMPT } from "../prompts/skill-gap";

export interface SkillGapResult {
  technicalGaps: string[];
  softSkillGaps: string[];
  experienceGaps: string[];
  readinessScore: number;
  upskillingPlan: string[];
}

export async function analyzeSkillGap(
  resumeText: string,
  jobDescription: string,
): Promise<SkillGapResult> {
  const prompt = SKILL_GAP_PROMPT
    .replace("{resumeText}", resumeText)
    .replace("{jobDescription}", jobDescription);

  const response = await openai.chat.completions.create({
    model: getDefaultModel(),
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from OpenAI");
  }

  return JSON.parse(content) as SkillGapResult;
}
