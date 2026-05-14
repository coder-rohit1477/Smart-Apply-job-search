"use client";

import { useEffect, useState } from "react";

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  skills: string[];
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isMounted = true;
    fetch("/api/jobs")
      .then((response) => response.json())
      .then((data) => {
        if (isMounted) {
          setJobs(data.jobs || []);
        }
      })
      .catch(() => undefined);
    return () => {
      isMounted = false;
    };
  }, []);

  async function apply(jobId: string) {
    setMessage("");
    const response = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId }),
    });

    if (!response.ok) {
      const data = await response.json();
      setMessage(data.error || "Application failed");
      return;
    }

    setMessage("Application submitted successfully.");
  }

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold">Job Listings</h1>
      {message && <p className="rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-700">{message}</p>}
      <div className="grid gap-4">
        {jobs.map((job) => (
          <article key={job.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold">{job.title}</h2>
            <p className="mt-1 text-sm text-gray-600">
              {job.company} • {job.location} • {job.type}
            </p>
            <p className="mt-3 text-sm text-gray-700">{job.description}</p>
            <p className="mt-3 text-xs text-gray-500">Skills: {job.skills.join(", ")}</p>
            <button
              type="button"
              onClick={() => apply(job.id)}
              className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm text-white"
            >
              Quick Apply
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
