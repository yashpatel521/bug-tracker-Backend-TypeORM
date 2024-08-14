import * as express from "express";
import schemas, { validate } from "../Validation/validators";
import { Auth } from "../middlewares/Auth";
import subRoleController from "../controllers/subRole.controller";

const router = express.Router();

router.post(
  "/",
  validate.body(schemas.createSubRole),
  subRoleController.create
);
router.get("/", Auth, subRoleController.viewAll);
router.delete("/:id", Auth, subRoleController.delete);

export default router;
