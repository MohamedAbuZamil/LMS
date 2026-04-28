import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import prismaPlugin from "./plugins/prisma";
import authPlugin from "./plugins/auth";
import authRoutes from "./routes/auth";
import { env, isProd } from "./config/env";

async function buildServer() {
  const app = Fastify({
    logger: {
      level: isProd ? "info" : "debug",
      transport: isProd
        ? undefined
        : { target: "pino-pretty", options: { colorize: true, translateTime: "HH:MM:ss" } },
    },
    trustProxy: true,
  });

  await app.register(cors, {
    origin: env.corsOrigins.length ? env.corsOrigins : true,
    credentials: true,
  });

  await app.register(prismaPlugin);
  await app.register(authPlugin);

  // Global baseline rate limit. Per-route stricter limits are applied below.
  await app.register(rateLimit, {
    global: false, // disabled globally; opt in per route
    max: 100,
    timeWindow: "1 minute",
  });

  // Health check
  app.get("/health", async () => ({ status: "ok", uptime: process.uptime() }));

  app.get("/", async () => ({
    service: "lmszamil-api",
    version: "0.1.0",
    docs: "/health",
  }));

  // Auth routes (login/staff, login/student, refresh, logout, me)
  await app.register(authRoutes, { prefix: "/api/auth" });

  return app;
}

async function start() {
  const app = await buildServer();
  try {
    await app.listen({ port: env.port, host: env.host });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
