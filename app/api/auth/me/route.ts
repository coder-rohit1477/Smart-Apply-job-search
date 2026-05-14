import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  const user = getSessionUser(request);

  if (!user) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role, resumes: user.resumes },
  });
}
