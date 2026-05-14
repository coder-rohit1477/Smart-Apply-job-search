import type {
  AiRecommendation,
  MatchInsight,
  PipelineItem,
  ResumeProfile,
} from "@/lib/types";

export function buildAiRecommendations(
  profile: ResumeProfile,
  matches: MatchInsight[],
  pipeline: PipelineItem[],
): AiRecommendation[] {
  const topMatch = matches[0];
  const firstGap = topMatch?.missingSkills[0] ?? "case-study storytelling";
  const nextPipelineItem = pipeline[0];

  return [
    {
      id: "tailor-resume",
      title: `Tailor keywords for ${topMatch?.company ?? "priority roles"}`,
      description: `Add stronger evidence for ${firstGap} and keep ${profile.strengths[0].toLowerCase()} above the fold. This increases both ATS coverage and recruiter skim quality.`,
      impact: "High impact",
    },
    {
      id: "follow-up-sequence",
      title: "Schedule a proactive follow-up",
      description: `Create a follow-up message around the ${nextPipelineItem?.company ?? "current top"} process so the application does not stall after submission.`,
      impact: "Medium impact",
    },
    {
      id: "interview-brief",
      title: "Prepare a project narrative pack",
      description:
        "Generate STAR-style stories tied to performance, cross-functional execution, and delivery outcomes before the interview loop starts.",
      impact: "High impact",
    },
  ];
}
