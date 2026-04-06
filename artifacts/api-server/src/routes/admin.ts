import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, usersTable, documentsTable } from "@workspace/db";
import { ListUsersResponse, ListAllDocumentsResponse, UpdateDocumentStatusBody } from "@workspace/api-zod";
import { createClerkClient } from "@clerk/express";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get("/admin/users", requireAuth, async (_req, res): Promise<void> => {
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

  const users = await db.select().from(usersTable).orderBy(usersTable.createdAt);
  res.json(ListUsersResponse.parse(users));
});

router.get("/admin/documents", requireAuth, async (_req, res): Promise<void> => {
  const secretKey = process.env.CLERK_SECRET_KEY;

  const docs = await db
    .select()
    .from(documentsTable)
    .orderBy(documentsTable.uploadedAt);

  let clerkUserMap = new Map<string, { name: string; email: string }>();

  if (secretKey) {
    try {
      const clerk = createClerkClient({ secretKey });
      const clerkUserIds = [...new Set(docs.map((d) => d.clerkUserId).filter(Boolean))] as string[];
      if (clerkUserIds.length > 0) {
        const { data: clerkUsers } = await clerk.users.getUserList({
          userId: clerkUserIds,
          limit: 100,
        });
        for (const u of clerkUsers) {
          clerkUserMap.set(u.id, {
            name:
              [u.firstName, u.lastName].filter(Boolean).join(" ") ||
              u.emailAddresses[0]?.emailAddress?.split("@")[0] ||
              "User",
            email: u.emailAddresses[0]?.emailAddress ?? "",
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch Clerk users for documents:", err);
    }
  }

  const result = docs.map((doc) => {
    const userInfo = doc.clerkUserId ? clerkUserMap.get(doc.clerkUserId) : null;
    return {
      id: doc.id,
      fileName: doc.fileName,
      documentType: doc.documentType,
      objectPath: doc.objectPath,
      status: doc.status,
      uploadedAt: doc.uploadedAt,
      notes: doc.notes,
      userName: userInfo?.name ?? "Unknown User",
      userEmail: userInfo?.email ?? "",
      clerkUserId: doc.clerkUserId,
    };
  });

  res.json(ListAllDocumentsResponse.parse(result));
});

router.patch("/admin/documents/:id/status", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid document ID" });
    return;
  }

  const parsed = UpdateDocumentStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [updated] = await db
    .update(documentsTable)
    .set({
      status: parsed.data.status,
      notes: parsed.data.notes ?? null,
    })
    .where(eq(documentsTable.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Document not found" });
    return;
  }

  const secretKey = process.env.CLERK_SECRET_KEY;
  let userName = "Unknown User";
  let userEmail = "";

  if (secretKey && updated.clerkUserId) {
    try {
      const clerk = createClerkClient({ secretKey });
      const u = await clerk.users.getUser(updated.clerkUserId);
      userName =
        [u.firstName, u.lastName].filter(Boolean).join(" ") ||
        u.emailAddresses[0]?.emailAddress?.split("@")[0] ||
        "User";
      userEmail = u.emailAddresses[0]?.emailAddress ?? "";
    } catch (_) {}
  }

  res.json({
    id: updated.id,
    fileName: updated.fileName,
    documentType: updated.documentType,
    objectPath: updated.objectPath,
    status: updated.status,
    uploadedAt: updated.uploadedAt,
    notes: updated.notes,
    userName,
    userEmail,
    clerkUserId: updated.clerkUserId,
  });
});

export default router;
