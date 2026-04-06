import { Router, type IRouter } from "express";
import { db, schemesTable, jobsTable, assistanceCentersTable, usersTable, activityTable } from "@workspace/db";
import { sql, count } from "drizzle-orm";
import {
  GetStatsSummaryResponse,
  GetSchemesByCategoryResponse,
  GetRecentActivityResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/stats/summary", async (_req, res): Promise<void> => {
  const [schemesCount] = await db.select({ count: count() }).from(schemesTable);
  const [jobsCount] = await db.select({ count: count() }).from(jobsTable);
  const [centersCount] = await db.select({ count: count() }).from(assistanceCentersTable);
  const [usersCount] = await db.select({ count: count() }).from(usersTable);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [schemesThisMonth] = await db
    .select({ count: count() })
    .from(schemesTable)
    .where(sql`${schemesTable.createdAt} >= ${startOfMonth}`);

  const [jobsThisMonth] = await db
    .select({ count: count() })
    .from(jobsTable)
    .where(sql`${jobsTable.postedAt} >= ${startOfMonth}`);

  res.json(GetStatsSummaryResponse.parse({
    totalSchemes: schemesCount.count,
    totalJobs: jobsCount.count,
    totalAssistanceCenters: centersCount.count,
    totalUsers: usersCount.count,
    schemesThisMonth: schemesThisMonth.count,
    jobsThisMonth: jobsThisMonth.count,
  }));
});

router.get("/stats/schemes-by-category", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      category: schemesTable.category,
      count: count(),
    })
    .from(schemesTable)
    .groupBy(schemesTable.category);

  res.json(GetSchemesByCategoryResponse.parse(
    rows.map(r => ({ category: r.category, count: r.count }))
  ));
});

router.get("/stats/recent-activity", async (_req, res): Promise<void> => {
  const activities = await db
    .select()
    .from(activityTable)
    .orderBy(sql`${activityTable.timestamp} DESC`)
    .limit(10);

  res.json(GetRecentActivityResponse.parse(activities));
});

export default router;
