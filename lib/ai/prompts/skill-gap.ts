export const SKILL_GAP_PROMPT = `
You are a technical recruiter.
Analyze the skill gap between the candidate's resume and the target role.

RESUME TEXT:
{resumeText}

TARGET ROLE/JOB DESCRIPTION:
{jobDescription}

Evaluate:
1. Technical skill gaps.
2. Soft skill gaps.
3. Certifications or experience gaps.

Return ONLY a JSON object:
{{
  "technicalGaps": string[],
  "softSkillGaps": string[],
  "experienceGaps": string[],
  "readinessScore": number,
  "upskillingPlan": string[]
}}
`;
