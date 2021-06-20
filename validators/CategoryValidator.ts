import Joi from "joi";

const CategorySchema = Joi.object({
  name: Joi.string().required(),
  iconName: Joi.string(),
  description: Joi.string(),
});

export default CategorySchema;
