# Smart Apply - Issues Analysis

## Critical Build Errors Found:

### 1. Missing `@/napi-rs/wasm-runtime` in oxide wasm bundle (minor, optional dep)
### 2. Zod v4 API Breaking Changes
- `zod` v4.4.3 is installed but code uses `z.ZodError` (v3 API)
- `error.issues` is now `error.errors` in zod v4
- Import pattern changed

### 3. `lib/env.ts` uses `import "server-only"` but calls `getAppEnv()` which combines server+public
- `getAppEnv()` is called in `app/layout.tsx` which is a Server Component — OK
- But pattern of merging server env at module level can fail in edge runtime

### 4. Missing `.env.local` / `.env.example` file (users need guidance)

### 5. `services/resume-service.ts` — Zod v4 compatibility 
- `ZodError` import from "zod" needs update

### 6. `app/api/ai/analyze-resume/route.ts` — missing Content-Type header on fetch

### 7. `components/resume/job-matcher.tsx` — missing Content-Type header on fetch

### 8. `components/resume/ai-analysis.tsx` — missing Content-Type header on fetch

### 9. TypeScript: `parser/resume-parser.ts` uses `@/services/resume-service` which is `server-only`
- This file doesn't have "server-only" guard but imports from server-only module

### 10. `lib/ai/openai.ts` — `getServerEnv()` called at module level (top level await issue in some runtimes)

### 11. `app/dashboard/resume/page.tsx` — double `auth()` call (minor perf issue)

### 12. Missing `middleware.ts` public routes for sign-in/sign-up pages
- Currently only protects /dashboard(.*) which is correct

### 13. Zod v4 - `z.ZodError` vs `ZodError` named import changes

### 14. `types/resume.ts` — emailSchema allows null but `.email()` validation fails on null

### 15. `lib/parsers/pdf-parser.ts` — pdfjs-dist v5 has different API than expected

### 16. Missing error boundary components

### 17. `next.config.mjs` is empty — should have webpack config for pdf/canvas

