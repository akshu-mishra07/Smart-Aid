import { pgTable, text, serial, timestamp, integer, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const schemesTable = pgTable("schemes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameHindi: text("name_hindi").notNull(),
  description: text("description").notNull(),
  descriptionHindi: text("description_hindi").notNull(),
  schemeType: text("scheme_type").notNull(),
  category: text("category").notNull(),
  minAge: integer("min_age"),
  maxAge: integer("max_age"),
  maxIncome: real("max_income"),
  ministry: text("ministry").notNull(),
  benefitAmount: text("benefit_amount"),
  applicationUrl: text("application_url"),
  documents: text("documents").array().notNull().default([]),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertSchemeSchema = createInsertSchema(schemesTable).omit({ id: true, createdAt: true });
export type InsertScheme = z.infer<typeof insertSchemeSchema>;
export type Scheme = typeof schemesTable.$inferSelect;
