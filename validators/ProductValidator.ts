import Joi from "joi";

const ProductSchema = Joi.object({
  name: Joi.string().required(),
  slug: Joi.string().optional(),
  id: Joi.number().optional(),
  uid: Joi.string().optional(),
  description: Joi.string().allow("").optional(),
  editorDescription: Joi.string().allow("").optional(),
  categoryName: Joi.string().allow("").optional(),
  subCategoryName: Joi.string().allow("").optional(),
  createdAt: Joi.date().optional(),
  updatedAt: Joi.date().optional(),
  isDeleted: Joi.bool().default(false).optional(),
});

export default ProductSchema;
