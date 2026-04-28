import net from "node:net";
import type { FastifyInstance, FastifyPluginAsync, FastifyRequest } from "fastify";
import { z } from "zod";
import { verifyPassword } from "../lib/password";
import {
  signAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  computeRefreshExpiry,
} from "../lib/tokens";

/* ----------------------------- Validation ----------------------------- */

const staffLoginSchema = z.object({
  username: z.string().trim().min(1).max(60),
  password: z.string().min(1).max(200),
});

const studentLoginSchema = z.object({
  code: z.string().trim().min(1).max(20),
  password: z.string().min(1).max(200),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(10).max(200),
});

/* ----------------------------- Constants ----------------------------- */

const MAX_FAILED_ATTEMPTS = 10;
const LOCKOUT_MINUTES = 30;

/* ----------------------------- Helpers ----------------------------- */

const clientMeta = (req: FastifyRequest) => {
  // req.ip behind a proxy can be a comma-separated list, an IPv4-in-IPv6 form,
  // or include a port. Postgres `inet` rejects anything but a clean IP literal.
  const raw = (req.ip ?? "").split(",")[0]?.trim() ?? "";
  const stripped = raw.startsWith("::ffff:") ? raw.slice(7) : raw;
  const ip = net.isIP(stripped) ? stripped : null;
  return {
    user_agent: req.headers["user-agent"]?.slice(0, 500) ?? null,
    ip_address: ip,
  };
};

const isLocked = (lockedUntil: Date | null): boolean =>
  Boolean(lockedUntil && lockedUntil.getTime() > Date.now());

const computeLockoutExpiry = (): Date => new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);

/* ----------------------------- Routes ----------------------------- */

const authRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  /**
   * POST /api/auth/login/staff
   * Body: { username, password }
   * Authenticates an admin / teacher / secretary against the `users` table.
   */
  app.post(
    "/login/staff",
    {
      config: {
        rateLimit: { max: 5, timeWindow: "1 minute" },
      },
    },
    async (req, reply) => {
    const parsed = staffLoginSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "Invalid input", issues: parsed.error.flatten() });
    }
    const { username, password } = parsed.data;

    const user = await app.prisma.users.findFirst({
      where: { username, is_active: true, deleted_at: null },
    });

    // Generic message — never leak whether the username exists
    if (!user) {
      return reply.code(401).send({ error: "Invalid credentials" });
    }

    // Account lockout pre-check
    if (isLocked(user.locked_until)) {
      return reply.code(423).send({
        error: "Account temporarily locked",
        lockedUntil: user.locked_until,
      });
    }

    if (!(await verifyPassword(password, user.password_hash))) {
      const newCount = user.failed_login_count + 1;
      const reachedLimit = newCount >= MAX_FAILED_ATTEMPTS;
      await app.prisma.users.update({
        where: { id: user.id },
        data: reachedLimit
          ? { failed_login_count: 0, locked_until: computeLockoutExpiry() }
          : { failed_login_count: newCount },
      });
      if (reachedLimit) {
        return reply.code(423).send({
          error: "Account temporarily locked",
          lockedUntil: computeLockoutExpiry(),
        });
      }
      return reply.code(401).send({ error: "Invalid credentials" });
    }

    // Load secretary permissions if applicable
    let permissions: string[] = [];
    if (user.role === "secretary") {
      const rows = await app.prisma.user_permissions.findMany({
        where: { user_id: user.id },
        select: { permission_key: true },
      });
      permissions = rows.map((r) => r.permission_key);
    }

    // Single-session enforcement: bump token_version + revoke any active refresh tokens
    const newVersion = user.token_version + 1;
    const { token: refreshToken, tokenHash } = generateRefreshToken();
    const expiresAt = computeRefreshExpiry();
    const meta = clientMeta(req);

    await app.prisma.$transaction([
      app.prisma.refresh_tokens.updateMany({
        where: { user_id: user.id, revoked_at: null },
        data: { revoked_at: new Date() },
      }),
      app.prisma.refresh_tokens.create({
        data: {
          user_id: user.id,
          token_hash: tokenHash,
          expires_at: expiresAt,
          user_agent: meta.user_agent,
          ip_address: meta.ip_address,
        },
      }),
      app.prisma.users.update({
        where: { id: user.id },
        data: {
          last_login_at: new Date(),
          failed_login_count: 0,
          locked_until: null,
          token_version: newVersion,
        },
      }),
    ]);

    const accessToken = signAccessToken(app, {
      type: "user",
      userId: user.id,
      role: user.role as "admin" | "teacher" | "secretary",
      tokenVersion: newVersion,
    });

    return reply.send({
      accessToken,
      refreshToken,
      user: {
        id: user.id.toString(),
        role: user.role,
        username: user.username,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatarUrl: user.avatar_url,
        managerTeacherId: user.manager_teacher_id?.toString() ?? null,
        permissions,
      },
    });
  },
  );

  /**
   * POST /api/auth/login/student
   * Body: { code, password }
   * Authenticates a student against the `students` table.
   */
  app.post(
    "/login/student",
    {
      config: {
        rateLimit: { max: 5, timeWindow: "1 minute" },
      },
    },
    async (req, reply) => {
    const parsed = studentLoginSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "Invalid input", issues: parsed.error.flatten() });
    }
    const { code, password } = parsed.data;

    const student = await app.prisma.students.findFirst({
      where: { code, is_active: true, deleted_at: null },
    });

    if (!student) {
      return reply.code(401).send({ error: "Invalid credentials" });
    }

    if (isLocked(student.locked_until)) {
      return reply.code(423).send({
        error: "Account temporarily locked",
        lockedUntil: student.locked_until,
      });
    }

    if (!(await verifyPassword(password, student.password_hash))) {
      const newCount = student.failed_login_count + 1;
      const reachedLimit = newCount >= MAX_FAILED_ATTEMPTS;
      await app.prisma.students.update({
        where: { id: student.id },
        data: reachedLimit
          ? { failed_login_count: 0, locked_until: computeLockoutExpiry() }
          : { failed_login_count: newCount },
      });
      if (reachedLimit) {
        return reply.code(423).send({
          error: "Account temporarily locked",
          lockedUntil: computeLockoutExpiry(),
        });
      }
      return reply.code(401).send({ error: "Invalid credentials" });
    }

    const newVersion = student.token_version + 1;
    const { token: refreshToken, tokenHash } = generateRefreshToken();
    const expiresAt = computeRefreshExpiry();
    const meta = clientMeta(req);

    await app.prisma.$transaction([
      app.prisma.refresh_tokens.updateMany({
        where: { student_id: student.id, revoked_at: null },
        data: { revoked_at: new Date() },
      }),
      app.prisma.refresh_tokens.create({
        data: {
          student_id: student.id,
          token_hash: tokenHash,
          expires_at: expiresAt,
          user_agent: meta.user_agent,
          ip_address: meta.ip_address,
        },
      }),
      app.prisma.students.update({
        where: { id: student.id },
        data: {
          last_login_at: new Date(),
          failed_login_count: 0,
          locked_until: null,
          token_version: newVersion,
        },
      }),
    ]);

    const accessToken = signAccessToken(app, {
      type: "student",
      studentId: student.id,
      tokenVersion: newVersion,
    });

    return reply.send({
      accessToken,
      refreshToken,
      student: {
        id: student.id.toString(),
        code: student.code,
        name: student.name,
        phone: student.phone,
        parentPhone: student.parent_phone,
        gradeId: student.grade_id,
        governorateId: student.governorate_id,
        birthDate: student.birth_date,
        avatarUrl: student.avatar_url,
        balance: student.balance.toString(),
      },
    });
  },
  );

  /**
   * POST /api/auth/refresh
   * Body: { refreshToken }
   * Rotates the refresh token: revokes the old one, issues a fresh access + refresh pair.
   */
  app.post(
    "/refresh",
    {
      config: {
        rateLimit: { max: 20, timeWindow: "1 minute" },
      },
    },
    async (req, reply) => {
    const parsed = refreshSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "Invalid input" });
    }
    const tokenHash = hashRefreshToken(parsed.data.refreshToken);

    const stored = await app.prisma.refresh_tokens.findUnique({ where: { token_hash: tokenHash } });
    if (!stored || stored.revoked_at || stored.expires_at < new Date()) {
      return reply.code(401).send({ error: "Invalid refresh token" });
    }

    let accessToken: string;
    if (stored.user_id) {
      const user = await app.prisma.users.findFirst({
        where: { id: stored.user_id, is_active: true, deleted_at: null },
      });
      // If a newer login bumped token_version, this refresh token belongs to a stale session
      if (!user) return reply.code(401).send({ error: "Invalid refresh token" });
      accessToken = signAccessToken(app, {
        type: "user",
        userId: user.id,
        role: user.role as "admin" | "teacher" | "secretary",
        tokenVersion: user.token_version,
      });
    } else if (stored.student_id) {
      const student = await app.prisma.students.findFirst({
        where: { id: stored.student_id, is_active: true, deleted_at: null },
      });
      if (!student) return reply.code(401).send({ error: "Invalid refresh token" });
      accessToken = signAccessToken(app, {
        type: "student",
        studentId: student.id,
        tokenVersion: student.token_version,
      });
    } else {
      return reply.code(401).send({ error: "Invalid refresh token" });
    }

    // Rotate: issue new refresh, revoke old
    const { token: newRefresh, tokenHash: newHash } = generateRefreshToken();
    const meta = clientMeta(req);

    await app.prisma.$transaction([
      app.prisma.refresh_tokens.update({
        where: { id: stored.id },
        data: { revoked_at: new Date() },
      }),
      app.prisma.refresh_tokens.create({
        data: {
          user_id: stored.user_id,
          student_id: stored.student_id,
          token_hash: newHash,
          expires_at: computeRefreshExpiry(),
          user_agent: meta.user_agent,
          ip_address: meta.ip_address,
        },
      }),
    ]);

    return reply.send({ accessToken, refreshToken: newRefresh });
  },
  );

  /**
   * POST /api/auth/logout
   * Body: { refreshToken }
   * Revokes the given refresh token. The access token will simply expire on its own.
   */
  app.post(
    "/logout",
    {
      config: {
        rateLimit: { max: 30, timeWindow: "1 minute" },
      },
    },
    async (req, reply) => {
    const parsed = refreshSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "Invalid input" });
    }
    const tokenHash = hashRefreshToken(parsed.data.refreshToken);
    await app.prisma.refresh_tokens.updateMany({
      where: { token_hash: tokenHash, revoked_at: null },
      data: { revoked_at: new Date() },
    });
    return reply.send({ ok: true });
  },
  );

  /**
   * GET /api/auth/me
   * Returns the profile of the currently authenticated subject (user or student).
   */
  app.get(
    "/me",
    {
      preHandler: app.authenticate,
      config: {
        rateLimit: { max: 60, timeWindow: "1 minute" },
      },
    },
    async (req, reply) => {
    const claims = req.user;

    if (claims.type === "user") {
      const user = await app.prisma.users.findFirst({
        where: { id: BigInt(claims.sub), is_active: true, deleted_at: null },
      });
      if (!user) return reply.code(401).send({ error: "Unauthorized" });

      let permissions: string[] = [];
      if (user.role === "secretary") {
        const rows = await app.prisma.user_permissions.findMany({
          where: { user_id: user.id },
          select: { permission_key: true },
        });
        permissions = rows.map((r) => r.permission_key);
      }

      return reply.send({
        type: "user" as const,
        id: user.id.toString(),
        role: user.role,
        username: user.username,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatarUrl: user.avatar_url,
        managerTeacherId: user.manager_teacher_id?.toString() ?? null,
        permissions,
      });
    }

    const student = await app.prisma.students.findFirst({
      where: { id: BigInt(claims.sub), is_active: true, deleted_at: null },
    });
    if (!student) return reply.code(401).send({ error: "Unauthorized" });

    return reply.send({
      type: "student" as const,
      id: student.id.toString(),
      code: student.code,
      name: student.name,
      phone: student.phone,
      parentPhone: student.parent_phone,
      gradeId: student.grade_id,
      governorateId: student.governorate_id,
      birthDate: student.birth_date,
      avatarUrl: student.avatar_url,
      balance: student.balance.toString(),
    });
  },
  );
};

export default authRoutes;
