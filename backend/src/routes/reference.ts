import type { FastifyInstance, FastifyPluginAsync } from "fastify";
import { PERMISSIONS } from "../lib/permissions";

/**
 * Reference / lookup data used to populate dropdowns across the frontends.
 * All endpoints are public (no auth required) — the data is non-sensitive.
 */
const referenceRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  /** GET /api/governorates — Egyptian governorates (id, nameAr, nameEn). */
  app.get("/governorates", async () => {
    const rows = await app.prisma.governorates.findMany({
      orderBy: { id: "asc" },
    });
    return rows.map((g) => ({
      id: g.id,
      nameAr: g.name,
      nameEn: g.name_en,
    }));
  });

  /** GET /api/grades — School grades (id, name, orderIndex). */
  app.get("/grades", async () => {
    const rows = await app.prisma.grades.findMany({
      orderBy: { order_index: "asc" },
    });
    return rows.map((g) => ({
      id: g.id,
      name: g.name,
      orderIndex: g.order_index,
    }));
  });

  /** GET /api/permissions — Catalog of permission keys grantable to secretaries. */
  app.get("/permissions", async () => PERMISSIONS);
};

export default referenceRoutes;
