import * as express from "express";
import schemas, { validate } from "../Validation/validators";
import userController from "../controllers/user.controller";
import { Auth } from "../middlewares/Auth";

const router = express.Router();

//GET
router.get("/", Auth, userController.viewAll);
router.get("/profile/:id", Auth, userController.profile);
router.get("/bugs", Auth, userController.getUserBugs);

//POST
router.post("/", userController.create);
router.post("/login", validate.body(schemas.login), userController.login);
router.post("/passwordChange", Auth, userController.passwordChange);
router.post("/updateProfile", Auth, userController.updateProfile);
router.post("/providersAuth", userController.providersAuth);

export default router;
