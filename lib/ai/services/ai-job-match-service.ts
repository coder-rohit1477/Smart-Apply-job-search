import { getDefaultModel, getOpenAIClient } from "../openai";

export interface JobMatchResult {
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  recommendation: string;
  reasoning: string;
}

export async function performAiJobMatch(
  resumeText: string,
  jobDescription: string,
): Promise<JobMatchResult> {
  const prompt = `
You are a senior technical recruiter.
Match the following resume against the job description.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Evaluate the match and provide:
1. A match score (0-100).
2. A list of matched skills.
3. A list of missing critical skills.
4. A brief recommendation for the candidate.
5. Reasoning for the score.

Return ONLY a JSON object:
{
  "matchScore": number,
  "matchedSkills": string[],
  "missingSkills": string[],
  "recommendation": string,
  "reasoning": string
}
`;

  const openai = getOpenAIClient();
  const model = getDefaultModel();

  const response = await openai.chat.completions.create({
    model,
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("No response from OpenAI");
  }

  return JSON.parse(content) as JobMatchResult;
}
