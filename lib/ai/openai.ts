import "server-only";
import OpenAI from "openai";
import { getServerEnv } from "@/lib/env";

// Use a getter function to avoid evaluating env at module import time.
// This prevents build-time failures when env vars aren't available.
export function getOpenAI(): OpenAI {
  const env = getServerEnv();
  return new OpenAI({ apiKey: env.OPENAI_API_KEY });
}

export function getDefaultModel(): string {
  try {
    const env = getServerEnv();
    return env.OPENAI_RESUME_ANALYSIS_MODEL || "gpt-4o-mini";
  } catch {
    return "gpt-4o-mini";
  }
}

// Lazy singleton wrappers — safe to use anywhere without top-level env issues
let _client: OpenAI | null = null;

export const openai: OpenAI = new Proxy({} as OpenAI, {
  get(_target, prop) {
    if (!_client) _client = getOpenAI();
    return (_client as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export const DEFAULT_MODEL = "gpt-4o-mini";
