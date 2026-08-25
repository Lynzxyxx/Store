import "server-only";
import crypto from "crypto";
import { cookies } from "next/headers";

const SESSION_SECRET = process.env.SESSION_SECRET || "ryuu-store-dev-secret-change-me";
const USER_COOKIE = "ryuu_session";
const ADMIN_COOKIE = "ryuu_admin_session";

type SessionPayload = { uid: string; username: string; iat: number };

function sign(data: string) {
  return crypto.createHmac("sha256", SESSION_SECRET).update(data).digest("hex");
}

function encode(payload: SessionPayload) {
  const json = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = sign(json);
  return `${json}.${sig}`;
}

function decode(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  const [json, sig] = token.split(".");
  if (!json || !sig) return null;
  const expected = sign(json);
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    return JSON.parse(Buffer.from(json, "base64url").toString());
  } catch {
    return null;
  }
}

export function createUserSession(uid: string, username: string) {
  const token = encode({ uid, username, iat: Date.now() });
  cookies().set(USER_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });
}

export function getUserSession(): SessionPayload | null {
  const token = cookies().get(USER_COOKIE)?.value;
  return decode(token);
}

export function clearUserSession() {
  cookies().delete(USER_COOKIE);
}

export function createAdminSession(username: string) {
  const token = encode({ uid: "admin", username, iat: Date.now() });
  cookies().set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12
  });
}

export function getAdminSession(): SessionPayload | null {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  return decode(token);
}

export function clearAdminSession() {
  cookies().delete(ADMIN_COOKIE);
}

export function requireAdmin(): boolean {
  return getAdminSession() !== null;
}

/** ID Transaksi 8 digit acak unik (angka), prefix RY untuk keterbacaan di UI */
export function generateTrxId(): string {
  const n = Math.floor(10000000 + Math.random() * 90000000); // 8 digit
  return String(n);
}
