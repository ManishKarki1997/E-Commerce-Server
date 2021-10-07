import express from "express";
import cookieParser from "cookie-parser";
import errorHandler from "./middlewares/errorHandler";

import {
  AuthController,
  CartController,
  CategoryController,
  FilterController,
  OrderController,
  ProductController,
  QuestionController,
  ReviewController,
  WishlistController,
} from "./controllers";
import cors from "cors";

const app = express();

app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:3000", "https://localhost:3000"],
  })
);

app.use(express.json({ limit: "500mb" }));
app.use(cookieParser());

app.use("/api/users", AuthController);
app.use("/api/categories", CategoryController);
app.use("/api/products", ProductController);
app.use("/api/filters", FilterController);
app.use("/api/questions", QuestionController);
app.use("/api/reviews", ReviewController);
app.use("/api/cart", CartController);
app.use("/api/wishlist", WishlistController);
app.use("/api/orders", OrderController);

app.use(errorHandler);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
