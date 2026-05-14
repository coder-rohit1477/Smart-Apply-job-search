import { NextResponse } from "next/server";
import { z } from "zod";
import { comparePassword, signToken } from "@/lib/auth";
import { getStore } from "@/lib/storage";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
  }

  const store = getStore();
  const user = store.users.find((item) => item.email.toLowerCase() === parsed.data.email.toLowerCase());

  if (!user || !(await comparePassword(parsed.data.password, user.passwordHash))) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

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
