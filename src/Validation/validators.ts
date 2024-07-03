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
    roleId: Joi.number().required(),
    email: Joi.string().required().email(),
    password: Joi.string()
      .required()
      .max(20)
      .min(8)
      .pattern(new RegExp("(?=.*[!@#$%^&*])"))
      .message(
        "Password must include at least one special character (!@#$%^&*)"
      ),
  });

  createRole = Joi.object({
    type: Joi.string().required(),
  });

  // createUser = Joi.object({
  //   name: Joi.string().required(),
  //   phoneNumber: Joi.string().required().length(10),
  //   pin: Joi.any().when("role", {
  //     is: roles.employee,
  //     then: Joi.string().required(),
  //   }),
  //   secret: Joi.string().empty(),
  //   role: Joi.string()
  //     .empty()
  //     .valid(...Object.values(roles))
  //     .required(),
  // });

  login = Joi.object({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  });
}
const validator = new Validator();
const validate = validator.validate;
export { validate };
export default validator;
