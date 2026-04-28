import crypto from "node:crypto";
import type { FastifyInstance } from "fastify";
import { env } from "../config/env";

export type Subject =
  | { type: "user"; userId: bigint; role: "admin" | "teacher" | "secretary"; tokenVersion: number }
  | { type: "student"; studentId: bigint; tokenVersion: number };

export interface AccessTokenClaims {
  sub: string;
  type: "user" | "student";
  role?: "admin" | "teacher" | "secretary";
  /** Bumped on every login → invalidates tokens on previous devices. */
  v: number;
}

/** Sign a short-lived access JWT for the given subject. */
export const signAccessToken = (app: FastifyInstance, subject: Subject): string => {
  const claims: AccessTokenClaims =
    subject.type === "user"
      ? {
          sub: subject.userId.toString(),
          type: "user",
          role: subject.role,
          v: subject.tokenVersion,
        }
      : { sub: subject.studentId.toString(), type: "student", v: subject.tokenVersion };

  return app.jwt.sign(claims, { expiresIn: env.accessTokenTtl });
};

/** Generate a random opaque refresh token (returned to client) and its SHA-256 hash (stored in DB). */
export const generateRefreshToken = (): { token: string; tokenHash: string } => {
  const token = crypto.randomBytes(48).toString("base64url");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  return { token, tokenHash };
};

/** Hash a refresh token the same way (used during refresh / logout to look it up). */
export const hashRefreshToken = (token: string): string =>
  crypto.createHash("sha256").update(token).digest("hex");

/** Compute the absolute expiry timestamp for a new refresh token. */
export const computeRefreshExpiry = (): Date => {
  const ms = env.refreshTokenTtlDays * 24 * 60 * 60 * 1000;
  return new Date(Date.now() + ms);
};
