import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import errorHandler from "./middlewares/errorHandler";

import {
  AuthController,
  BrandInfoController,
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
import { HttpStatusCode } from "./constants/HttpStatusCodes";

const app = express();

app.use(
  cors({
    credentials: true,
    origin: [
      "http://localhost:3000",
      "https://localhost:3000",
      "https://varyacommerce.netlify.app",
      "https://testcommercespa.netlify.app/",
    ],
  })
);

app.use(express.json({ limit: "500mb" }));
app.use(cookieParser());

app.get("/", async (req: Request, res: Response) => {
  return res.status(HttpStatusCode.OK).send("Welcome to the API");
});

app.use("/api/users", AuthController);
app.use("/api/categories", CategoryController);
app.use("/api/products", ProductController);
app.use("/api/filters", FilterController);
app.use("/api/questions", QuestionController);
app.use("/api/reviews", ReviewController);
app.use("/api/cart", CartController);
app.use("/api/wishlist", WishlistController);
app.use("/api/orders", OrderController);
app.use("/api/brand", BrandInfoController);

app.use(errorHandler);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
