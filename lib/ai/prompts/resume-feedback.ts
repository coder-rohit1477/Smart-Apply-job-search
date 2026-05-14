export const RESUME_FEEDBACK_PROMPT = `
You are a senior hiring manager at a top tech company.
Provide constructive, high-impact feedback on the following resume.

RESUME TEXT:
{resumeText}

Focus on:
- Formatting and readability
- Impact-driven bullet points (use of metrics/results)
- Professional tone and summary
- Skill presentation

Return ONLY a JSON object:
{{
  "formattingScore": number,
  "impactScore": number,
  "feedback": {{
    "formatting": string[],
    "content": string[],
    "tone": string[]
  }},
  "topThreeChanges": string[]
}}
`;
