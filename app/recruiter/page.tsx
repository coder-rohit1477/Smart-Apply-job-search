"use client";

import { FormEvent, useEffect, useState } from "react";

type Stats = {
  totalJobs: number;
  totalApplications: number;
  activeCandidates: number;
};

export default function RecruiterDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState("react,next.js,typescript");
  const [message, setMessage] = useState("");

  async function loadDashboard() {
    const response = await fetch("/api/recruiter/dashboard");
    const data = await response.json();
    setStats(data.stats || null);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadDashboard();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  async function createJob(event: FormEvent) {
    event.preventDefault();
    setMessage("");

    const response = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        company,
        location,
        type: "full-time",
        description,
        skills: skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || "Failed to create job");
      return;
    }

    setMessage("Job posted successfully.");
    setTitle("");
    setDescription("");
    await loadDashboard();
  }

  return (
    <section className="space-y-8">
      <h1 className="text-3xl font-bold">Recruiter Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Jobs</p>
          <p className="mt-2 text-3xl font-bold">{stats?.totalJobs ?? 0}</p>
        </article>
        <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Applications</p>
          <p className="mt-2 text-3xl font-bold">{stats?.totalApplications ?? 0}</p>
        </article>
        <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Active Candidates</p>
          <p className="mt-2 text-3xl font-bold">{stats?.activeCandidates ?? 0}</p>
        </article>
      </div>

      <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Post a New Job</h2>
        <form onSubmit={createJob} className="mt-4 grid gap-3 md:grid-cols-2">
          <input
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2"
            placeholder="Job title"
          />
          <input
            required
            value={company}
            onChange={(event) => setCompany(event.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2"
            placeholder="Company"
          />
          <input
            required
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2"
            placeholder="Location"
          />
          <input
            required
            value={skills}
            onChange={(event) => setSkills(event.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2"
            placeholder="Comma-separated skills"
          />
          <textarea
            required
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="md:col-span-2 rounded-md border border-gray-300 px-3 py-2"
            rows={4}
            placeholder="Role description"
          />
          <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-white">
            Publish Job
          </button>
          {message && <p className="text-sm text-blue-700">{message}</p>}
        </form>
      </article>
    </section>
  );
}
