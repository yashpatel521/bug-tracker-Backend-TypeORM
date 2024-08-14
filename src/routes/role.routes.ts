import * as express from "express";
import schemas, { validate } from "../Validation/validators";
import roleController from "../controllers/role.controller";
import { Auth } from "../middlewares/Auth";

const router = express.Router();

router.post(
  "/",
  Auth,
  validate.body(schemas.createRole),
  roleController.create
);
router.get("/", Auth, roleController.viewAll);
router.delete("/:id", Auth, roleController.delete);

export default router;
