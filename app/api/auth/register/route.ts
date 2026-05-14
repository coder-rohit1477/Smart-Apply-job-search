import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword, signToken } from "@/lib/auth";
import { getStore } from "@/lib/storage";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["candidate", "recruiter"]),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid registration data" }, { status: 400 });
  }

  const { name, email, password, role } = parsed.data;
  const store = getStore();

  const emailExists = store.users.some((user) => user.email.toLowerCase() === email.toLowerCase());
  if (emailExists) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const user = {
    id: randomUUID(),
    name,
    email,
    passwordHash: await hashPassword(password),
    role,
    resumes: [],
  };

  store.users.push(user);

  const token = signToken({ userId: user.id, role: user.role, email: user.email, name: user.name });
  const response = NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });

  response.cookies.set({
    name: "smart_apply_token",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
