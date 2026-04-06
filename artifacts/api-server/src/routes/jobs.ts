import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, jobsTable } from "@workspace/db";
import {
  ListJobsQueryParams,
  ListJobsResponse,
  GetJobParams,
  GetJobResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/jobs", async (req, res): Promise<void> => {
  const query = ListJobsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const { category, city, state } = query.data;
  const conditions = [];
  if (category && category !== "all") {
    conditions.push(eq(jobsTable.category, category));
  }
  if (city) {
    conditions.push(eq(jobsTable.city, city));
  }
  if (state) {
    conditions.push(eq(jobsTable.state, state));
  }

  const jobs = conditions.length > 0
    ? await db.select().from(jobsTable).where(and(...conditions))
    : await db.select().from(jobsTable);

  res.json(ListJobsResponse.parse(jobs));
});

router.get("/jobs/:id", async (req, res): Promise<void> => {
  const params = GetJobParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, params.data.id));
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  res.json(GetJobResponse.parse(job));
});

export default router;
