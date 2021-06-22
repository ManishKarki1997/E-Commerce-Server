import Joi from "joi";

const SubCategorySchema = Joi.object({
  name: Joi.string().required(),
  iconName: Joi.string(),
  description: Joi.string().allow("").optional(),
});

export default SubCategorySchema;
