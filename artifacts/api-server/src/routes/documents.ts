import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, documentsTable } from "@workspace/db";
import {
  ListDocumentsResponse,
  UploadDocumentBody,
  GetDocumentParams,
  GetDocumentResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/documents", async (_req, res): Promise<void> => {
  const docs = await db.select().from(documentsTable).orderBy(documentsTable.uploadedAt);
  res.json(ListDocumentsResponse.parse(docs));
});

router.post("/documents", async (req, res): Promise<void> => {
  const parsed = UploadDocumentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [doc] = await db.insert(documentsTable).values({
    fileName: parsed.data.fileName,
    documentType: parsed.data.documentType,
    status: "pending",
  }).returning();

  res.status(201).json(GetDocumentResponse.parse(doc));
});

router.get("/documents/:id", async (req, res): Promise<void> => {
  const params = GetDocumentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [doc] = await db.select().from(documentsTable).where(eq(documentsTable.id, params.data.id));
  if (!doc) {
    res.status(404).json({ error: "Document not found" });
    return;
  }

  res.json(GetDocumentResponse.parse(doc));
});

export default router;
