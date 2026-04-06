import { Router, type IRouter } from "express";
import healthRouter from "./health";
import schemesRouter from "./schemes";
import eligibilityRouter from "./eligibility";
import assistanceRouter from "./assistance";
import jobsRouter from "./jobs";
import documentsRouter from "./documents";
import adminRouter from "./admin";
import statsRouter from "./stats";
import storageRouter from "./storage";

const router: IRouter = Router();

router.use(healthRouter);
router.use(schemesRouter);
router.use(eligibilityRouter);
router.use(assistanceRouter);
router.use(jobsRouter);
router.use(documentsRouter);
router.use(adminRouter);
router.use(statsRouter);
router.use(storageRouter);

export default router;
