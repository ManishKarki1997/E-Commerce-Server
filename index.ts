import express from "express";
import cookieParser from "cookie-parser";
import errorHandler from "./middlewares/errorHandler";
import { AuthController, CategoryController } from "./controllers";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:3000"],
  })
);

app.use("/api/users", AuthController);
app.use("/api/categories", CategoryController);

app.use(errorHandler);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
