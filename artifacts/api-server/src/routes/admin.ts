import { Router, type IRouter } from "express";
import { db, usersTable, documentsTable } from "@workspace/db";
import { ListUsersResponse } from "@workspace/api-zod";
import { createClerkClient } from "@clerk/express";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/admin/users", async (_req, res): Promise<void> => {
  const secretKey = process.env.CLERK_SECRET_KEY;

  if (secretKey) {
    try {
      const clerk = createClerkClient({ secretKey });
      const { data: clerkUsers } = await clerk.users.getUserList({ limit: 100, orderBy: "-created_at" });

      if (clerkUsers.length > 0) {
        const docCounts = await db
          .select({
            clerkUserId: documentsTable.clerkUserId,
            count: sql<number>`cast(count(*) as int)`,
          })
          .from(documentsTable)
          .groupBy(documentsTable.clerkUserId);

        const docCountMap = new Map(docCounts.map((r) => [r.clerkUserId, r.count]));

        const users = clerkUsers.map((u, idx) => ({
          id: idx + 1,
          name:
            [u.firstName, u.lastName].filter(Boolean).join(" ") ||
            u.emailAddresses[0]?.emailAddress?.split("@")[0] ||
            "User",
          email: u.emailAddresses[0]?.emailAddress ?? "",
          state: "Registered via Clerk",
          documentsCount: docCountMap.get(u.id) ?? 0,
          createdAt: new Date(u.createdAt),
        }));

        res.json(ListUsersResponse.parse(users));
        return;
      }
    } catch (err) {
      console.error("Failed to fetch Clerk users, falling back to DB:", err);
    }
  }

  // Fallback: use seeded users from DB
  const users = await db.select().from(usersTable).orderBy(usersTable.createdAt);
  res.json(ListUsersResponse.parse(users));
});

export default router;
