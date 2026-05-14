import { getDefaultModel, getOpenAIClient } from "../openai";
import { KEYWORD_ANALYSIS_PROMPT } from "../prompts/keyword-analysis";

export interface KeywordAnalysisResult {
  missingKeywords: string[];
  matchedKeywords: string[];
  priorityKeywords: string[];
}

export async function analyzeKeywords(
  resumeText: string,
  jobDescription: string,
): Promise<KeywordAnalysisResult> {
  const prompt = KEYWORD_ANALYSIS_PROMPT
    .replace("{resumeText}", resumeText)
    .replace("{jobDescription}", jobDescription);

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

  return JSON.parse(content) as KeywordAnalysisResult;
}
