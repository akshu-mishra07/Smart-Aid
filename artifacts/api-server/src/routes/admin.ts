import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { ListUsersResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/admin/users", async (_req, res): Promise<void> => {
  const users = await db.select().from(usersTable).orderBy(usersTable.createdAt);
  res.json(ListUsersResponse.parse(users));
});

export default router;
