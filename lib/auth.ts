import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable must be set.");
  }
  return secret;
}

export interface SessionToken {
  userId: string;
  role: "candidate" | "recruiter";
  email: string;
  name: string;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: SessionToken) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  return jwt.verify(token, getJwtSecret()) as SessionToken;
}
