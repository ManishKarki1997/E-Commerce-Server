import Joi from "joi";

const CategorySchema = Joi.object({
  name: Joi.string().required(),
  id:Joi.number().optional(),
  uid:Joi.string().optional(),
  parentName:Joi.string().optional(),
  parentId:Joi.number().optional(),
  description: Joi.string().allow("").optional(),
  imageUrl: Joi.string().optional(),
  createdAt: Joi.date().optional(),
  updatedAt: Joi.date().optional(),
  isDeleted: Joi.bool().default(false).optional(),
});

export default CategorySchema;
