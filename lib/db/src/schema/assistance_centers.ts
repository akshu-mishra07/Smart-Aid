import { pgTable, text, serial, timestamp, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const assistanceCentersTable = pgTable("assistance_centers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  phone: text("phone"),
  email: text("email"),
  services: text("services").array().notNull().default([]),
  latitude: real("latitude"),
  longitude: real("longitude"),
  operatingHours: text("operating_hours"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAssistanceCenterSchema = createInsertSchema(assistanceCentersTable).omit({ id: true, createdAt: true });
export type InsertAssistanceCenter = z.infer<typeof insertAssistanceCenterSchema>;
export type AssistanceCenter = typeof assistanceCentersTable.$inferSelect;
