import { Router } from "express";
import {
  checkDailyStats,
  getAppInfo,
  searchAppInfo,
  suggestAppInfo,
  topApp,
  addApp,
} from "../controllers/googlePlay.Controllers";
import { Auth } from "../middlewares/Auth";

const router = Router();

router.get("/app/:appId", getAppInfo);
router.get("/search", searchAppInfo);
router.get("/suggest", suggestAppInfo);
router.get("/topApp", topApp);
router.get("/checkDailyStats", checkDailyStats);
router.post("/addApp", Auth, addApp);

export default router;
