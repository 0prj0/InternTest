import { Elysia } from "elysia";
import cors from "@elysiajs/cors";
import openapi from "@elysiajs/swagger"; // Note: OpenAPI in Elysia is powered by @elysiajs/swagger
import { auth } from "./lib/auth";
import { logger } from "../../packages/domains/utils";
import { authRoute } from "./routers/auth-route"; // fixed import path
import { userRoute } from "./routers/user-route";
import { config } from "../../packages/infra";

const app = new Elysia()
  // ── Request logging ───────────────────────────────────────────────────────
  .onRequest(({ request }) => {
    logger.info(
      { method: request.method, url: request.url },
      "Incoming request"
    );
  })

  // ── CORS ──────────────────────────────────────────────────────────────────
  .use(
    cors({
      origin: config.AUTH_TRUSTED_ORIGINS,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      credentials: true,
    })
  )

  // ── OpenAPI docs ──────────────────────────────────────────────────────────
  .use(
    openapi({
      documentation: {
        info: {
          title: config.PROJECT_NAME,
          version: "1.0.0",
          description: "Elysia + Bun + Better Auth + Drizzle ORM",
        },
        tags: [
          { name: "Auth", description: "Authentication endpoints" },
          { name: "Roles", description: "Role management endpoints" },
          { name: "Users", description: "User management endpoints" },
        ],
      },
    })
  )

  // ── Better Auth handler ───────────────────────────────────────────────────
  .mount(auth.handler)

  // ── API routes ────────────────────────────────────────────────────────────
  .group("/api/v1", (app) => app.use([authRoute, userRoute]))

  // ── Health check ──────────────────────────────────────────────────────────
  .get("/health", () => ({ status: "ok", timestamp: new Date().toISOString() }))
  .listen(config.PORT);

logger.info(
  `${config.PROJECT_NAME} is running at http://${app.server?.hostname}:${app.server?.port}`
);
logger.info(`OpenAPI docs: http://localhost:${config.PORT}/swagger`);

export type App = typeof app;