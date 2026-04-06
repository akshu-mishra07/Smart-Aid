import { Router, type IRouter } from "express";
import { and, lte, gte, or, eq, isNull } from "drizzle-orm";
import { db, schemesTable } from "@workspace/db";
import {
  CheckEligibilityBody,
  CheckEligibilityResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/eligibility/check", async (req, res): Promise<void> => {
  const parsed = CheckEligibilityBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { age, category, annualIncome, hasDisability } = parsed.data;

  const allSchemes = await db.select().from(schemesTable).where(eq(schemesTable.isActive, true));

  const eligible = allSchemes.filter((scheme) => {
    if (scheme.minAge !== null && age < scheme.minAge) return false;
    if (scheme.maxAge !== null && age > scheme.maxAge) return false;
    if (scheme.maxIncome !== null && annualIncome > scheme.maxIncome) return false;

    if (scheme.category !== "all") {
      if (scheme.category === "disability" && !hasDisability) return false;
      if (
        scheme.category !== category &&
        scheme.category !== "disability"
      ) return false;
    }

    return true;
  });

  res.json(CheckEligibilityResponse.parse({
    schemes: eligible,
    totalMatched: eligible.length,
    userProfile: parsed.data,
  }));
});

export default router;
