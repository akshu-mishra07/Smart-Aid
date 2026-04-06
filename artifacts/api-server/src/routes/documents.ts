import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, documentsTable } from "@workspace/db";
import {
  ListDocumentsResponse,
  UploadDocumentBody,
  GetDocumentParams,
  GetDocumentResponse,
  DeleteDocumentParams,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get("/documents", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).clerkUserId;
  const docs = await db
    .select()
    .from(documentsTable)
    .where(eq(documentsTable.clerkUserId, userId))
    .orderBy(documentsTable.uploadedAt);
  res.json(ListDocumentsResponse.parse(docs));
});

router.post("/documents", requireAuth, async (req, res): Promise<void> => {
  const parsed = UploadDocumentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const userId = (req as any).clerkUserId;
  const [doc] = await db.insert(documentsTable).values({
    clerkUserId: userId,
    fileName: parsed.data.fileName,
    documentType: parsed.data.documentType,
    objectPath: parsed.data.objectPath ?? null,
    status: "pending",
  }).returning();

  res.status(201).json(GetDocumentResponse.parse(doc));
});

router.get("/documents/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetDocumentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const userId = (req as any).clerkUserId;
  const [doc] = await db
    .select()
    .from(documentsTable)
    .where(and(eq(documentsTable.id, params.data.id), eq(documentsTable.clerkUserId, userId)));
  if (!doc) {
    res.status(404).json({ error: "Document not found" });
    return;
  }

  res.json(GetDocumentResponse.parse(doc));
});

router.delete("/documents/:id", requireAuth, async (req, res): Promise<void> => {
  const params = DeleteDocumentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const userId = (req as any).clerkUserId;
  const [doc] = await db
    .delete(documentsTable)
    .where(and(eq(documentsTable.id, params.data.id), eq(documentsTable.clerkUserId, userId)))
    .returning();

  if (!doc) {
    res.status(404).json({ error: "Document not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
