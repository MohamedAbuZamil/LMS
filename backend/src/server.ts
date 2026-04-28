import Fastify from "fastify";
import cors from "@fastify/cors";
import prismaPlugin from "./plugins/prisma";
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

  // Health check
  app.get("/health", async () => ({ status: "ok", uptime: process.uptime() }));

  app.get("/", async () => ({
    service: "lmszamil-api",
    version: "0.1.0",
    docs: "/health",
  }));

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
