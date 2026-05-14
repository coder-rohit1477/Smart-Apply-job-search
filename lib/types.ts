export type UserRole = "candidate" | "recruiter";

export interface Resume {
  id: string;
  filename: string;
  uploadedAt: string;
  skills: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  resumes: Resume[];
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: "full-time" | "part-time" | "contract" | "internship";
  description: string;
  skills: string[];
  postedBy: string;
  createdAt: string;
}

export interface Application {
  id: string;
  jobId: string;
  userId: string;
  status: "applied" | "screening" | "interview" | "offer" | "rejected";
  coverLetter?: string;
  createdAt: string;
}
