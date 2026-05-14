export const KEYWORD_ANALYSIS_PROMPT = `
You are an expert in keyword optimization for resumes.
Analyze the resume against the provided job description to identify missing keywords.

RESUME TEXT:
{resumeText}

JOB DESCRIPTION:
{jobDescription}

Identify:
1. Keywords present in the job description but missing from the resume.
2. Keywords present in both.
3. Priority keywords to add.

Return ONLY a JSON object:
{{
  "missingKeywords": string[],
  "matchedKeywords": string[],
  "priorityKeywords": string[]
}}
`;
