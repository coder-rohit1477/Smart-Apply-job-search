import Link from "next/link";

const highlights = [
  "Secure authentication for candidates and recruiters",
  "AI-based job recommendations from uploaded resumes",
  "Real-time application tracking dashboard",
  "Recruiter analytics and job posting workspace",
];

export default function Home() {
  return (
    <div className="space-y-12 py-4">
      <section className="rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 p-8 text-white md:p-12">
        <p className="text-sm uppercase tracking-widest text-blue-100">Full-Stack AI Job Search Platform</p>
        <h1 className="mt-4 text-4xl font-bold leading-tight md:text-5xl">
          Find your next role faster with SmartApply AI
        </h1>
        <p className="mt-4 max-w-2xl text-blue-50">
          Upload your resume, discover curated opportunities, track every application, and let recruiters
          discover top talent from a single modern workspace.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/register" className="rounded-md bg-white px-5 py-2.5 font-semibold text-blue-700">
            Create account
          </Link>
          <Link
            href="/jobs"
            className="rounded-md border border-blue-200 px-5 py-2.5 font-semibold text-white"
          >
            Browse jobs
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {highlights.map((item) => (
          <article key={item} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">{item}</h2>
            <p className="mt-2 text-sm text-gray-600">
              Built with Next.js + Tailwind and secure API routes, ready for MongoDB or PostgreSQL backends.
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}
