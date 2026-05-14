import OpenAI from "openai";
import { getServerEnv } from "@/lib/env";

let cachedClient: OpenAI | null = null;

export function getOpenAIClient() {
  if (!cachedClient) {
    const env = getServerEnv();
    cachedClient = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });
  }

  return cachedClient;
}

export function getDefaultModel() {
  const env = getServerEnv();
  return env.OPENAI_RESUME_ANALYSIS_MODEL || "gpt-4o-mini";
}
