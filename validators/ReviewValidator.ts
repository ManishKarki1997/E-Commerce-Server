import Joi from "joi";

const ReviewSchema = Joi.object({
  id: Joi.number(),
  comment: Joi.string().min(2).required().messages({
    "string.empty": `Review cannot be an empty field`,
    "any.required": `Review is a required field`,
  }),
  rating: Joi.number().required().min(1).max(5),
  productId: Joi.number(),
  reviewId: Joi.number(),
});

export default ReviewSchema;
