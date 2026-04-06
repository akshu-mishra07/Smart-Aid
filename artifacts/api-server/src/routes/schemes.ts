import { Router, type IRouter } from "express";
import { ilike, eq, and } from "drizzle-orm";
import { db, schemesTable } from "@workspace/db";
import {
  ListSchemesQueryParams,
  ListSchemesResponse,
  GetSchemeParams,
  GetSchemeResponse,
  CreateSchemeBody,
  UpdateSchemeParams,
  UpdateSchemeBody,
  UpdateSchemeResponse,
  DeleteSchemeParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/schemes", async (req, res): Promise<void> => {
  const query = ListSchemesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const { category, schemeType, search } = query.data;

  const conditions = [];
  if (category && category !== "all") {
    conditions.push(eq(schemesTable.category, category));
  }
  if (schemeType && schemeType !== "all") {
    conditions.push(eq(schemesTable.schemeType, schemeType));
  }
  if (search) {
    conditions.push(ilike(schemesTable.name, `%${search}%`));
  }

  const schemes = conditions.length > 0
    ? await db.select().from(schemesTable).where(and(...conditions))
    : await db.select().from(schemesTable);

  res.json(ListSchemesResponse.parse(schemes));
});

router.get("/schemes/:id", async (req, res): Promise<void> => {
  const params = GetSchemeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [scheme] = await db.select().from(schemesTable).where(eq(schemesTable.id, params.data.id));
  if (!scheme) {
    res.status(404).json({ error: "Scheme not found" });
    return;
  }

  res.json(GetSchemeResponse.parse(scheme));
});

router.post("/admin/schemes", async (req, res): Promise<void> => {
  const parsed = CreateSchemeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [scheme] = await db.insert(schemesTable).values(parsed.data).returning();
  res.status(201).json(GetSchemeResponse.parse(scheme));
});

router.put("/admin/schemes/:id", async (req, res): Promise<void> => {
  const params = UpdateSchemeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateSchemeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [scheme] = await db
    .update(schemesTable)
    .set(parsed.data)
    .where(eq(schemesTable.id, params.data.id))
    .returning();

  if (!scheme) {
    res.status(404).json({ error: "Scheme not found" });
    return;
  }

  res.json(UpdateSchemeResponse.parse(scheme));
});

router.delete("/admin/schemes/:id", async (req, res): Promise<void> => {
  const params = DeleteSchemeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [scheme] = await db
    .delete(schemesTable)
    .where(eq(schemesTable.id, params.data.id))
    .returning();

  if (!scheme) {
    res.status(404).json({ error: "Scheme not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
