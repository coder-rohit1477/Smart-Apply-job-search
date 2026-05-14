import OpenAI from "openai";
import { getServerEnv } from "@/lib/env";

const env = getServerEnv();

export const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export const DEFAULT_MODEL = env.OPENAI_RESUME_ANALYSIS_MODEL || "gpt-4o-mini";
