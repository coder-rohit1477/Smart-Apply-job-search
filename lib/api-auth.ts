import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./auth";
import { getStore } from "./storage";
import { UserRole } from "./types";

export function unauthorizedResponse(message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function getSessionUser(request: NextRequest) {
  const token = request.cookies.get("smart_apply_token")?.value;
  if (!token) {
    return null;
  }

  try {
    const payload = verifyToken(token);
    const store = getStore();
    return store.users.find((user) => user.id === payload.userId) ?? null;
  } catch {
    return null;
  }
}

export function requireAuth(request: NextRequest, role?: UserRole) {
  const user = getSessionUser(request);
  if (!user) {
    return { error: unauthorizedResponse(), user: null };
  }

  if (role && user.role !== role) {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
      user: null,
    };
  }

  return { error: null, user };
}
