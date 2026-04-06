import { Router, type IRouter } from "express";
import { ilike, eq, and } from "drizzle-orm";
import { db, assistanceCentersTable } from "@workspace/db";
import {
  ListAssistanceCentersQueryParams,
  ListAssistanceCentersResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/assistance-centers", async (req, res): Promise<void> => {
  const query = ListAssistanceCentersQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const { type, city, state } = query.data;
  const conditions = [];
  if (type && type !== "all") {
    conditions.push(eq(assistanceCentersTable.type, type));
  }
  if (city) {
    conditions.push(ilike(assistanceCentersTable.city, `%${city}%`));
  }
  if (state) {
    conditions.push(eq(assistanceCentersTable.state, state));
  }

  const centers = conditions.length > 0
    ? await db.select().from(assistanceCentersTable).where(and(...conditions))
    : await db.select().from(assistanceCentersTable);

  res.json(ListAssistanceCentersResponse.parse(centers));
});

export default router;
