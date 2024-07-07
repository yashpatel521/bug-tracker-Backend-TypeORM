import * as express from "express";
import schemas, { validate } from "../Validation/validators";
import userController from "../controllers/user.controller";
import { Auth } from "../middlewares/Auth";

const router = express.Router();

router.post("/", userController.create);
router.post("/login", validate.body(schemas.login), userController.login);
router.get("/", Auth, userController.viewAll);

export default router;
