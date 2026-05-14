"use client";

import { useState } from "react";
import {
  AlertCircle,
  BrainCircuit,
  CheckCircle2,
  FileSearch,
  Lightbulb,
  Target,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { FullResumeAnalysis, StoredResume } from "@/types/resume";

interface AiAnalysisProps {
  resume: StoredResume;
}

export function AiAnalysis({ resume }: AiAnalysisProps) {
  const [analysis, setAnalysis] = useState<FullResumeAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startAnalysis() {
    setIsAnalyzing(true);
    setError(null);
    try {
      const response = await fetch("/api/ai/analyze-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId: resume.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Analysis failed");

      setAnalysis(data.analysis.analysisData as FullResumeAnalysis);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsAnalyzing(false);
    }
  }

  if (!analysis && !isAnalyzing) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <BrainCircuit className="h-8 w-8" />
          </div>
          <h3 className="mb-2 text-xl font-semibold">AI Resume Insights</h3>
          <p className="mb-6 max-w-md text-sm leading-7 text-muted-foreground">
            Get an ATS score, identify strengths and weaknesses, and receive
            personalized recommendations to improve your resume.
          </p>
          <Button onClick={startAnalysis} size="lg" className="rounded-full">
            Start AI Analysis
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isAnalyzing) {
    return (
      <Card className="border-primary/20">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="relative mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <BrainCircuit className="h-8 w-8 animate-pulse" />
            </div>
          </div>
          <h3 className="mb-2 text-xl font-semibold">Analyzing your resume…</h3>
          <p className="mb-6 text-sm text-muted-foreground">
            Our AI is processing your content against industry standards.
          </p>
          <div className="w-full max-w-xs space-y-2">
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div className="h-full w-2/3 animate-pulse bg-primary transition-all" />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Extracting semantics</span>
              <span>Scanning ATS patterns</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/20 bg-destructive/5">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
          <h3 className="mb-2 text-xl font-semibold">Analysis Failed</h3>
          <p className="mb-6 text-sm text-muted-foreground">{error}</p>
          <Button onClick={startAnalysis} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) return null;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <ScoreCard
          title="ATS Score"
          score={analysis.atsScore}
          icon={Target}
          description="How well your resume passes automated filters."
        />
        <ScoreCard
          title="Formatting"
          score={analysis.formattingScore}
          icon={FileSearch}
          description="Readability and structure quality."
        />
        <ScoreCard
          title="Impact"
          score={analysis.impactScore}
          icon={TrendingUp}
          description="Strength of your achievements and metrics."
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {analysis.executiveSummary}
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <ListCard
          title="Strengths"
          items={analysis.strengths}
          icon={CheckCircle2}
          itemClass="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30"
          iconClass="text-emerald-500"
        />
        <ListCard
          title="Areas for Improvement"
          items={analysis.weaknesses}
          icon={AlertCircle}
          itemClass="text-amber-600 bg-amber-50 dark:bg-amber-950/30"
          iconClass="text-amber-500"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-primary" />
            Keyword Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium">Matched Keywords</p>
            <div className="flex flex-wrap gap-2">
              {analysis.matchedKeywords.length > 0 ? (
                analysis.matchedKeywords.map((kw) => (
                  <Badge
                    key={kw}
                    variant="secondary"
                    className="bg-emerald-500/10 text-emerald-600"
                  >
                    {kw}
                  </Badge>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">
                  No matching industry keywords detected yet.
                </p>
              )}
            </div>
          </div>
          <Separator />
          <div>
            <p className="mb-2 text-sm font-medium">Missing Industry Keywords</p>
            <div className="flex flex-wrap gap-2">
              {analysis.missingKeywords.length > 0 ? (
                analysis.missingKeywords.map((kw) => (
                  <Badge
                    key={kw}
                    variant="outline"
                    className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-400"
                  >
                    {kw}
                  </Badge>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">
                  Your resume contains most expected industry keywords.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Top Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {analysis.recommendations.map((rec, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {i + 1}
                </span>
                {rec}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

interface ScoreCardProps {
  title: string;
  score: number;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

function ScoreCard({ title, score, icon: Icon, description }: ScoreCardProps) {
  const getColor = (s: number) => {
    if (s >= 80) return "text-emerald-500";
    if (s >= 60) return "text-amber-500";
    return "text-destructive";
  };

  const getBg = (s: number) => {
    if (s >= 80) return "bg-emerald-500";
    if (s >= 60) return "bg-amber-500";
    return "bg-destructive";
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-4 flex items-center justify-between">
          <Icon className="h-5 w-5 text-muted-foreground" />
          <span className={cn("text-2xl font-bold", getColor(score))}>{score}%</span>
        </div>
        <h4 className="font-semibold">{title}</h4>
        <p className="mb-4 text-xs text-muted-foreground">{description}</p>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className={cn("h-full transition-all duration-1000", getBg(score))}
            style={{ width: `${score}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

interface ListCardProps {
  title: string;
  items: string[];
  icon: React.ComponentType<{ className?: string }>;
  itemClass: string;
  iconClass: string;
}

function ListCard({ title, items, icon: Icon, itemClass, iconClass }: ListCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className={cn("h-5 w-5", iconClass)} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li key={i} className={cn("rounded-lg px-3 py-2 text-sm", itemClass)}>
              {item}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
