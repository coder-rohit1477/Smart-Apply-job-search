import { getDefaultModel, getOpenAIClient } from "../openai";
import { ATS_ANALYSIS_PROMPT } from "../prompts/ats-analysis";

export interface AtsAnalysisResult {
  atsScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  executiveSummary: string;
}

export async function analyzeAtsScore(
  resumeText: string,
  jobDescription?: string,
): Promise<AtsAnalysisResult> {
  const jobDescriptionInstruction = jobDescription
    ? `JOB DESCRIPTION:\n${jobDescription}\n\nCompare the resume against this job description.`
    : "No specific job description provided. Analyze against general industry standards for the detected role.";

  const prompt = ATS_ANALYSIS_PROMPT
    .replace("{resumeText}", resumeText)
    .replace("{jobDescriptionInstruction}", jobDescriptionInstruction);

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

  return JSON.parse(content) as AtsAnalysisResult;
}
