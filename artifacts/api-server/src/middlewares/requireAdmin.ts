import { createHmac } from "crypto";
import type { Request, Response, NextFunction } from "express";

const SESSION_SECRET = process.env.SESSION_SECRET;
if (!SESSION_SECRET) {
  throw new Error("SESSION_SECRET environment variable is required for admin authentication");
}

export function signAdminToken(username: string): string {
  const payload = JSON.stringify({ sub: username, iat: Date.now(), type: "admin" });
  const signature = createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
  return Buffer.from(payload).toString("base64url") + "." + signature;
}

export function verifyAdminToken(token: string): boolean {
  try {
    const [payloadB64, signature] = token.split(".");
    if (!payloadB64 || !signature) return false;
    const payload = Buffer.from(payloadB64, "base64url").toString();
    const expected = createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
    if (signature !== expected) return false;
    const parsed = JSON.parse(payload);
    if (parsed.type !== "admin") return false;
    const age = Date.now() - parsed.iat;
    if (age > 24 * 60 * 60 * 1000) return false;
    return true;
  } catch {
    return false;
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Admin authentication required" });
    return;
  }
  const token = authHeader.slice(7);
  if (!verifyAdminToken(token)) {
    res.status(403).json({ error: "Invalid or expired admin session" });
    return;
  }
  next();
}
