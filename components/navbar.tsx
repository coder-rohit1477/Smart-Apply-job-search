"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: "candidate" | "recruiter";
};

export default function Navbar() {
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUser(data.user ?? null))
      .catch(() => setUser(null));
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-bold text-gray-900">
          SmartApply AI
        </Link>
        <div className="flex items-center gap-4 text-sm font-medium text-gray-700">
          <Link href="/jobs">Jobs</Link>
          {user?.role === "candidate" && <Link href="/dashboard">Dashboard</Link>}
          {user?.role === "recruiter" && <Link href="/recruiter">Recruiter</Link>}
          {!user && (
            <>
              <Link href="/login">Login</Link>
              <Link className="rounded-md bg-blue-600 px-3 py-1.5 text-white" href="/register">
                Get Started
              </Link>
            </>
          )}
          {user && (
            <button
              type="button"
              onClick={logout}
              className="rounded-md border border-gray-300 px-3 py-1.5"
            >
              Logout
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}
