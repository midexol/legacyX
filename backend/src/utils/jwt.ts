import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env";

export interface SessionTokenPayload {
  sub: string; // user id
  address: string;
}

export function signSessionToken(payload: SessionTokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as SignOptions);
}

export function verifySessionToken(token: string): SessionTokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as SessionTokenPayload;
}
