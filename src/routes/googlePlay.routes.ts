import { Router } from "express";
import { getAppInfo } from "../controllers/googlePlay.Controllers";

const router = Router();

router.get("/app/:appId", getAppInfo);

export default router;
