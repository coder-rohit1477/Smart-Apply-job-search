import "server-only";
import { z } from "zod";

const nonEmptyString = (label: string) =>
  z.string().trim().min(1, `${label} is required.`);

const httpUrl = (label: string) =>
  z
    .string()
    .trim()
    .url(`${label} must be a valid URL.`)
    .refine(
      (value) => value.startsWith("http://") || value.startsWith("https://"),
      `${label} must start with http:// or https://.`,
    );

const databaseUrl = z
  .string()
  .trim()
  .min(1, "DATABASE_URL is required.")
  .refine(
    (value) =>
      value.startsWith("postgresql://") || value.startsWith("postgres://"),
    "DATABASE_URL must be a valid PostgreSQL connection string.",
  );

const serverEnvSchema = z.object({
  DATABASE_URL: databaseUrl,
  CLERK_SECRET_KEY: nonEmptyString("CLERK_SECRET_KEY"),
  OPENAI_API_KEY: nonEmptyString("OPENAI_API_KEY"),
  OPENAI_RESUME_ANALYSIS_MODEL: z.string().trim().default("gpt-4o-mini"),
  CLERK_SIGN_IN_URL: z.string().trim().default("/sign-in"),
  CLERK_SIGN_UP_URL: z.string().trim().default("/sign-up"),
  CLERK_AFTER_SIGN_IN_URL: z.string().trim().default("/dashboard"),
  CLERK_AFTER_SIGN_UP_URL: z.string().trim().default("/dashboard"),
});

const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: httpUrl("NEXT_PUBLIC_APP_URL"),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: nonEmptyString(
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  ),
});

type ServerEnv = z.infer<typeof serverEnvSchema>;
type PublicEnv = z.infer<typeof publicEnvSchema>;

let serverEnvCache: ServerEnv | undefined;
let publicEnvCache: PublicEnv | undefined;

function formatEnvError(
  scope: "server" | "public",
  error: z.ZodError,
): string {
  const issues = error.issues
    .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");

  return [
    `❌ Invalid ${scope} environment variables:`,
    issues,
    "",
    "  → Copy .env.example to .env.local and fill in the required values.",
  ].join("\n");
}

function parseEnv<TSchema extends z.ZodTypeAny>(
  scope: "server" | "public",
  schema: TSchema,
  values: Record<string, string | undefined>,
): z.infer<TSchema> {
  const parsed = schema.safeParse(values);

  if (!parsed.success) {
    throw new Error(formatEnvError(scope, parsed.error));
  }

  return parsed.data;
}

export function getServerEnv(): ServerEnv {
  if (!serverEnvCache) {
    serverEnvCache = parseEnv("server", serverEnvSchema, {
      DATABASE_URL: process.env.DATABASE_URL,
      CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      OPENAI_RESUME_ANALYSIS_MODEL: process.env.OPENAI_RESUME_ANALYSIS_MODEL,
      CLERK_SIGN_IN_URL: process.env.CLERK_SIGN_IN_URL,
      CLERK_SIGN_UP_URL: process.env.CLERK_SIGN_UP_URL,
      CLERK_AFTER_SIGN_IN_URL: process.env.CLERK_AFTER_SIGN_IN_URL,
      CLERK_AFTER_SIGN_UP_URL: process.env.CLERK_AFTER_SIGN_UP_URL,
    });
  }

  return serverEnvCache;
}

export function getPublicEnv(): PublicEnv {
  if (!publicEnvCache) {
    publicEnvCache = parseEnv("public", publicEnvSchema, {
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
        process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    });
  }

  return publicEnvCache;
}

export function getAppEnv() {
  return {
    ...getPublicEnv(),
    ...getServerEnv(),
  };
}

export function hasClerkCredentials(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
      process.env.CLERK_SECRET_KEY,
  );
}
