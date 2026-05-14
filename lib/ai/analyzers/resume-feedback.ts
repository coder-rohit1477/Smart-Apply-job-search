import { openai, DEFAULT_MODEL } from "../openai";
import { RESUME_FEEDBACK_PROMPT } from "../prompts/resume-feedback";

export interface ResumeFeedbackResult {
  formattingScore: number;
  impactScore: number;
  feedback: {
    formatting: string[];
    content: string[];
    tone: string[];
  };
  topThreeChanges: string[];
}

export async function getResumeFeedback(
  resumeText: string,
): Promise<ResumeFeedbackResult> {
  const prompt = RESUME_FEEDBACK_PROMPT.replace("{resumeText}", resumeText);

  const response = await openai.chat.completions.create({
    model: DEFAULT_MODEL,
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("No response from OpenAI");
  }

  return JSON.parse(content) as ResumeFeedbackResult;
}
