"use client";

import { useEffect, useState } from "react";

type Application = {
  id: string;
  jobId: string;
  status: string;
  createdAt: string;
};

type Recommendation = {
  id: string;
  title: string;
  company: string;
  location: string;
  matchScore: number;
};

export default function CandidateDashboardPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [uploadMessage, setUploadMessage] = useState("");

  async function fetchDashboardData() {
    const [applicationRes, recommendationRes] = await Promise.all([
      fetch("/api/applications"),
      fetch("/api/recommendations"),
    ]);
    return {
      applications: (await applicationRes.json()).applications || [],
      recommendations: (await recommendationRes.json()).recommendations || [],
    };
  }

  useEffect(() => {
    let isMounted = true;
    fetchDashboardData()
      .then((data) => {
        if (isMounted) {
          setApplications(data.applications);
          setRecommendations(data.recommendations);
        }
      })
      .catch(() => undefined);
    return () => {
      isMounted = false;
    };
  }, []);

  async function uploadResume(file: File) {
    setUploadMessage("");
    const formData = new FormData();
    formData.set("resume", file);

    const response = await fetch("/api/resume", { method: "POST", body: formData });
    const data = await response.json();

    if (!response.ok) {
      setUploadMessage(data.error || "Upload failed");
      return;
    }

    setUploadMessage("Resume uploaded. Recommendations refreshed.");
    const dashboardData = await fetchDashboardData();
    setApplications(dashboardData.applications);
    setRecommendations(dashboardData.recommendations);
  }

  return (
    <section className="space-y-8">
      <h1 className="text-3xl font-bold">Candidate Dashboard</h1>

      <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Upload Resume</h2>
        <p className="mt-1 text-sm text-gray-600">PDF/TXT supported via API parser (2MB max).</p>
        <input
          className="mt-3"
          type="file"
          accept=".txt,.pdf,.doc,.docx"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              uploadResume(file);
            }
          }}
        />
        {uploadMessage && <p className="mt-2 text-sm text-blue-700">{uploadMessage}</p>}
      </article>

      <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">AI Job Recommendations</h2>
        <div className="mt-3 grid gap-3">
          {recommendations.length === 0 && <p className="text-sm text-gray-500">Upload a resume to get matches.</p>}
          {recommendations.map((job) => (
            <div key={job.id} className="rounded-md border border-gray-100 p-3">
              <p className="font-medium">{job.title}</p>
              <p className="text-sm text-gray-600">
                {job.company} • {job.location}
              </p>
              <p className="mt-1 text-xs text-emerald-700">Match score: {job.matchScore}%</p>
            </div>
          ))}
        </div>
      </article>

      <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Application Tracking</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {applications.length === 0 && <li className="text-gray-500">No applications yet.</li>}
          {applications.map((application) => (
            <li key={application.id} className="rounded-md border border-gray-100 p-3">
              Job: {application.jobId} • Status: <strong>{application.status}</strong> • Applied on{" "}
              {new Date(application.createdAt).toLocaleDateString()}
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
}
