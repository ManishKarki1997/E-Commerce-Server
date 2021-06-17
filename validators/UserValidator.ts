import Joi from "joi";

const UserSchema = Joi.object({
  id: Joi.number(),
  name: Joi.string().min(2).required().messages({
    "string.empty": `Name cannot be an empty field`,
    "any.required": `Name is a required field`,
    "string.min": `Name should have a minimum length of {#limit}`,
  }),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(32).required().messages({
    "string.empty": `Password cannot be an empty field`,
    "any.required": `Password is a required field`,
    "string.min": `Password should have a minimum length of {#limit}`,
    "string.max": `Password should have a maximum length of {#limit}`,
  }),
  avatar: Joi.string(),
  role: Joi.string(),
  uid: Joi.string(),
  isActivated: Joi.boolean(),
  createdAt: Joi.date(),
  updatedAt: Joi.date(),
  isDeleted: Joi.boolean(),
  accountActivationToken: Joi.boolean(),
  activationExpiryDate: Joi.date(),
});

export default UserSchema;
