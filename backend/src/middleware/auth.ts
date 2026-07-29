import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";
import { verifySessionToken } from "../utils/jwt";

function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length).trim();
}

// Required auth: rejects the request if no valid session token is present.
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) return next(ApiError.unauthorized("Missing bearer token"));

  try {
    const payload = verifySessionToken(token);
    req.user = { id: payload.sub, address: payload.address };
    next();
  } catch {
    next(ApiError.unauthorized("Invalid or expired session token"));
  }
}

// Optional auth: attaches req.user when a valid token is present, but never
// rejects the request. Used by endpoints (like the public OTC order book)
// that reveal a little more to a caller who happens to own a resource.
export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) return next();

  try {
    const payload = verifySessionToken(token);
    req.user = { id: payload.sub, address: payload.address };
  } catch {
    // Ignore invalid tokens on optional routes — treat caller as anonymous.
  }
  next();
}

// Gate for the trusted-verifier ("admin") flows that stand in for a real
// death-certificate / legal-document verification integration in production.
export function requireAdminKey(req: Request, _res: Response, next: NextFunction) {
  const key = req.headers["x-admin-key"];
  if (typeof key !== "string" || !key) {
    return next(ApiError.unauthorized("Missing x-admin-key header"));
  }
  if (key !== env.ADMIN_API_KEY) {
    return next(ApiError.unauthorized("Invalid admin key"));
  }
  next();
}
