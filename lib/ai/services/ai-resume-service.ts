import { prisma } from "@/lib/prisma";
import { analyzeAtsScore } from "../analyzers/ats-score";
import { analyzeKeywords } from "../analyzers/keyword-analyzer";
import { getResumeFeedback } from "../analyzers/resume-feedback";
import { analyzeSkillGap } from "../analyzers/skill-gap";
import { getDefaultModel } from "../openai";

export interface FullResumeAnalysis {
  atsScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  missingKeywords: string[];
  matchedKeywords: string[];
  technicalGaps: string[];
  softSkillGaps: string[];
  readinessScore: number;
  executiveSummary: string;
  formattingScore: number;
  impactScore: number;
  upskillingPlan: string[];
}

export async function performFullResumeAnalysis(
  resumeId: string,
  userId: string,
  jobDescription?: string,
) {
  const resume = await prisma.resume.findUnique({
    where: { id: resumeId },
  });

  if (!resume || !resume.rawText) {
    throw new Error("Resume not found or has no text content");
  }

  // Run analyses in parallel where possible
  const [atsResult, feedbackResult] = await Promise.all([
    analyzeAtsScore(resume.rawText, jobDescription),
    getResumeFeedback(resume.rawText),
  ]);

  let keywordResult = null;
  let skillGapResult = null;

  if (jobDescription) {
    [keywordResult, skillGapResult] = await Promise.all([
      analyzeKeywords(resume.rawText, jobDescription),
      analyzeSkillGap(resume.rawText, jobDescription),
    ]);
  }

  const model = getDefaultModel();
  const analysisData: FullResumeAnalysis = {
    atsScore: atsResult.atsScore,
    strengths: atsResult.strengths,
    weaknesses: atsResult.weaknesses,
    recommendations: [
      ...atsResult.recommendations,
      ...feedbackResult.topThreeChanges,
    ],
    missingKeywords: keywordResult?.missingKeywords || [],
    matchedKeywords: keywordResult?.matchedKeywords || [],
    technicalGaps: skillGapResult?.technicalGaps || [],
    softSkillGaps: skillGapResult?.softSkillGaps || [],
    readinessScore: skillGapResult?.readinessScore || 0,
    executiveSummary: atsResult.executiveSummary,
    formattingScore: feedbackResult.formattingScore,
    impactScore: feedbackResult.impactScore,
    upskillingPlan: skillGapResult?.upskillingPlan || [],
  };

  // Save to database
  const savedAnalysis = await prisma.resumeAnalysis.create({
    data: {
      resumeId,
      userId,
      provider: "openai",
      model,
      promptVersion: "1.0",
      executiveSummary: analysisData.executiveSummary,
      atsScore: analysisData.atsScore,
      jobReadinessScore: analysisData.readinessScore,
      strengths: analysisData.strengths,
      weaknesses: analysisData.weaknesses,
      missingSkills: analysisData.technicalGaps,
      recommendations: analysisData.recommendations,
      analysisData: analysisData as any,
    },
  });

  // Update the main resume with the new ATS score if it's better or the latest
  await prisma.resume.update({
    where: { id: resumeId },
    data: {
      atsScore: analysisData.atsScore,
    },
  });

  return savedAnalysis;
}

export async function getLatestAnalysis(resumeId: string) {
  return prisma.resumeAnalysis.findFirst({
    where: { resumeId },
    orderBy: { createdAt: "desc" },
  });
}
