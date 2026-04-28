import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import jwtPlugin from "@fastify/jwt";
import { env } from "../config/env";
import type { AccessTokenClaims } from "../lib/tokens";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: AccessTokenClaims;
    user: AccessTokenClaims;
  }
}

declare module "fastify" {
  interface FastifyInstance {
    /** Verifies the Authorization header. Use as a `preHandler` on protected routes. */
    authenticate: (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
    /** Returns a `preHandler` that ensures the caller is one of the given staff roles. */
    requireRole: (
      ...roles: Array<"admin" | "teacher" | "secretary">
    ) => (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
    /** A `preHandler` that ensures the caller is a student. */
    requireStudent: (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

const authPlugin: FastifyPluginAsync = async (app: FastifyInstance) => {
  await app.register(jwtPlugin, {
    secret: env.jwtSecret,
  });

  /**
   * Verifies the JWT signature AND that the token's version (`v`) matches the current
   * `token_version` on the user/student row. The version is bumped on every successful
   * login → tokens issued on previous devices fail this check on their next request.
   */
  const verifyAndCheckVersion = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      await req.jwtVerify();
    } catch {
      reply.code(401).send({ error: "Unauthorized" });
      return false;
    }
    const claims = req.user;
    const id = BigInt(claims.sub);
    if (claims.type === "user") {
      const row = await app.prisma.users.findFirst({
        where: { id, is_active: true, deleted_at: null },
        select: { token_version: true },
      });
      if (!row || row.token_version !== claims.v) {
        reply.code(401).send({ error: "Session expired" });
        return false;
      }
    } else {
      const row = await app.prisma.students.findFirst({
        where: { id, is_active: true, deleted_at: null },
        select: { token_version: true },
      });
      if (!row || row.token_version !== claims.v) {
        reply.code(401).send({ error: "Session expired" });
        return false;
      }
    }
    return true;
  };

  app.decorate("authenticate", async (req: FastifyRequest, reply: FastifyReply) => {
    await verifyAndCheckVersion(req, reply);
  });

  app.decorate(
    "requireRole",
    (...roles: Array<"admin" | "teacher" | "secretary">) =>
      async (req: FastifyRequest, reply: FastifyReply) => {
        if (!(await verifyAndCheckVersion(req, reply))) return;
        const user = req.user;
        if (user.type !== "user" || !user.role || !roles.includes(user.role)) {
          return reply.code(403).send({ error: "Forbidden" });
        }
      },
  );

  app.decorate("requireStudent", async (req: FastifyRequest, reply: FastifyReply) => {
    if (!(await verifyAndCheckVersion(req, reply))) return;
    if (req.user.type !== "student") {
      return reply.code(403).send({ error: "Forbidden" });
    }
  });
};

export default fp(authPlugin, { name: "auth", dependencies: [] });
