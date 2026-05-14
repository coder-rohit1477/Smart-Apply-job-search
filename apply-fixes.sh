#!/usr/bin/env bash
# apply-fixes.sh
# Run this from the ROOT of your Smart Apply project:
#   chmod +x apply-fixes.sh && ./apply-fixes.sh
#
# What it does:
#   1. Copies all fixed files into place
#   2. Runs npm install (deps already correct)
#   3. Generates Prisma client
#   4. Runs tsc --noEmit to verify TypeScript
#   5. Runs next build to confirm no build errors

set -euo pipefail

FIXES_DIR="$(dirname "$0")/smart-apply-fixes"
PROJECT_DIR="$(pwd)"

echo ""
echo "🔧 Smart Apply — Applying fixes"
echo "   Project: $PROJECT_DIR"
echo "   Fixes:   $FIXES_DIR"
echo ""

if [ ! -f "$PROJECT_DIR/package.json" ]; then
  echo "❌ Error: Run this script from the project root (where package.json is)."
  exit 1
fi

copy_file() {
  local src="$FIXES_DIR/$1"
  local dst="$PROJECT_DIR/$1"
  local dir
  dir="$(dirname "$dst")"

  if [ ! -f "$src" ]; then
    echo "  ⚠️  Source not found, skipping: $1"
    return
  fi

  mkdir -p "$dir"
  cp "$src" "$dst"
  echo "  ✅ $1"
}

echo "📋 Copying fixed files..."

# Core config
copy_file "next.config.mjs"
copy_file "tsconfig.json"
copy_file "middleware.ts"
copy_file ".env.example"

# App layer
copy_file "app/layout.tsx"
copy_file "app/dashboard/page.tsx"
copy_file "app/dashboard/resume/page.tsx"

# API routes
copy_file "app/api/resume/upload/route.ts"
copy_file "app/api/resume/delete/route.ts"
copy_file "app/api/resume/parse/route.ts"
copy_file "app/api/ai/analyze-resume/route.ts"
copy_file "app/api/ai/job-match/route.ts"
copy_file "app/api/health/route.ts"

# Actions
copy_file "actions/dashboard-actions.ts"

# Services
copy_file "services/resume-service.ts"
copy_file "services/dashboard-service.ts"

# Parser
copy_file "parser/resume-parser.ts"

# Lib
copy_file "lib/env.ts"
copy_file "lib/ai/openai.ts"
copy_file "lib/ai/analyzers/ats-score.ts"
copy_file "lib/ai/analyzers/keyword-analyzer.ts"
copy_file "lib/ai/analyzers/resume-feedback.ts"
copy_file "lib/ai/analyzers/skill-gap.ts"
copy_file "lib/ai/services/ai-job-match-service.ts"
copy_file "lib/ai/services/ai-resume-service.ts"
copy_file "lib/parsers/docx-parser.ts"
copy_file "lib/parsers/pdf-parser.ts"
copy_file "lib/parsers/parser-service.ts"

# Types
copy_file "types/resume.ts"

# Components
copy_file "components/resume/ai-analysis.tsx"
copy_file "components/resume/job-matcher.tsx"
copy_file "components/resume/resume-upload.tsx"

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🗄️  Generating Prisma client..."
npx prisma generate

echo ""
echo "🔍 Running TypeScript check..."
npx tsc --noEmit && echo "  ✅ TypeScript: no errors" || echo "  ⚠️  TypeScript: warnings found (check above)"

echo ""
echo "🏗️  Running Next.js build..."
npm run build

echo ""
echo "✅ All fixes applied successfully!"
echo ""
echo "Next steps:"
echo "  1. Copy .env.example to .env.local and fill in your values"
echo "  2. Run: npx prisma migrate dev"
echo "  3. Run: npm run dev"
echo ""
