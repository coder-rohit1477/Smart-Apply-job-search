# Smart-Apply-job-search

A full-stack AI-powered job search platform built with **Next.js**, **Tailwind CSS**, and secure API routes, with adapter support for **MongoDB/PostgreSQL**.

## Features

- Candidate and recruiter authentication with secure HTTP-only JWT cookies
- Resume upload API (TXT, 2MB max) with skill extraction
- Job listings and recruiter job posting workflow
- Application tracking for candidates
- Recruiter dashboard analytics
- AI-based job recommendations based on resume skills
- Clean folder structure (`app/`, `components/`, `lib/`)

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS 4
- API validation with Zod
- Auth with bcrypt + JWT
- DB adapters for MongoDB (`MONGODB_URI`) and PostgreSQL (`POSTGRES_URL`)

## Getting Started

```bash
npm install
npm run dev
```

Create `.env.local`:

```env
JWT_SECRET=replace-with-a-strong-secret
DB_PROVIDER=memory
MONGODB_URI=
POSTGRES_URL=
```

Then open `http://localhost:3000`.

## API Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `GET, POST /api/jobs`
- `GET, POST /api/applications`
- `POST /api/resume`
- `GET /api/recruiter/dashboard`
- `GET /api/recommendations`
