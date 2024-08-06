import { Router } from "express";
import {
  checkDailyStats,
  getAppInfo,
  searchAppInfo,
  suggestAppInfo,
} from "../controllers/googlePlay.Controllers";

const router = Router();

router.get("/app/:appId", getAppInfo);
router.get("/search", searchAppInfo);
router.get("/suggest", suggestAppInfo);
router.get("/checkDailyStats", checkDailyStats);

export default router;
