import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
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

  const { age, category, annualIncome, hasDisability, gender, isStudent, occupation } = parsed.data;

  const allSchemes = await db.select().from(schemesTable).where(eq(schemesTable.isActive, true));

  const eligible = allSchemes.filter((scheme) => {
    // Age check
    if (scheme.minAge !== null && age < scheme.minAge) return false;
    if (scheme.maxAge !== null && age > scheme.maxAge) return false;

    // Income check
    if (scheme.maxIncome !== null && annualIncome > scheme.maxIncome) return false;

    // Category-specific scheme matching
    if (scheme.category !== "all") {
      // Disability schemes: only for people with disability
      if (scheme.category === "disability") {
        if (!hasDisability) return false;
      }
      // Women-specific schemes: only for female
      else if (scheme.category === "women") {
        if (gender !== "female") return false;
      }
      // Other category-specific schemes: must match caste/community category
      else if (scheme.category !== category) {
        return false;
      }
    }

    // Scholarship schemes: prioritize students but also allow others if income qualifies
    if (scheme.schemeType === "scholarship") {
      // Children-specific scholarships (below 18) – always include if age-eligible
      if (scheme.maxAge !== null && scheme.maxAge <= 18) return true;
      // Post-matric / higher education scholarships – prefer students
      if (isStudent === false && scheme.minAge !== null && scheme.minAge >= 14) {
        // Only include if income is very low (below 1L)
        if (annualIncome > 100000) return false;
      }
    }

    // Pension schemes: for elderly or specific categories
    if (scheme.schemeType === "pension") {
      // Only show pension schemes to people 35+ or those with disability
      if (age < 35 && !hasDisability) return false;
    }

    // Farmer-specific schemes
    const farmerSchemes = ["PM Kisan Samman Nidhi (PM-KISAN)", "PM Fasal Bima Yojana (PMFBY)", "Kisan Credit Card (KCC)", "PM Kisan Maan Dhan Yojana"];
    if (farmerSchemes.some(n => scheme.name.includes(n.split("(")[0].trim()))) {
      if (occupation !== "farmer") return false;
    }

    // Vendor/artisan schemes
    if (scheme.name.includes("SVANidhi") && occupation === "unemployed") return false;
    if (scheme.name.includes("Vishwakarma")) {
      // Open to all daily wage / skilled workers
      if (!["daily_wage", "skilled_worker", "other"].includes(occupation || "")) return false;
    }

    // Employment/livelihood schemes: exclude if already formally employed
    if (scheme.name.includes("MNREGA") && occupation !== "daily_wage" && occupation !== "unemployed") return false;

    // Food schemes: only for very low income
    if (scheme.schemeType === "food" && annualIncome > 150000) return false;

    return true;
  });

  res.json(CheckEligibilityResponse.parse({
    schemes: eligible,
    totalMatched: eligible.length,
    userProfile: parsed.data,
  }));
});

export default router;
