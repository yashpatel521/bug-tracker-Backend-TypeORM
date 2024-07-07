import Joi from "joi";
import expressJoiValidator from "express-joi-validation";

class Validator {
  validate = expressJoiValidator.createValidator({});

  user = Joi.object({
    firstName: Joi.string(),
    lastName: Joi.string(),
    email: Joi.string().email(),
  });

  createUser = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    roleId: Joi.string().required(),
    subRoleId: Joi.string().required(),
    email: Joi.string().required().email(),
    password: Joi.string()
      .required()
      .max(20)
      .min(8)
      .pattern(new RegExp("(?=.*[!@#$%^&*])"))
      .message(
        "Password must include at least one special character (!@#$%^&*)"
      ),
    status: Joi.string().required(),
    file: Joi.any(),
  });

  createRole = Joi.object({
    name: Joi.string().required(),
  });

  createSubRole = Joi.object({
    name: Joi.string().required(),
    roleId: Joi.number().required(),
  });

  login = Joi.object({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  });
}
const validator = new Validator();
const validate = validator.validate;
export { validate };
export default validator;
