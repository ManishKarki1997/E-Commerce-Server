import Joi from "joi";

const ProductSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string(),
  editorDescription: Joi.string().allow("").optional(),
  price: Joi.number().required(),
  categoryName: Joi.string().required(),
  subCategoryName: Joi.string().allow("").optional(),
});

export default ProductSchema;
