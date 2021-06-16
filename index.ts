import express from "express";
import { PrismaClient } from "@prisma/client";

const app = express();

app.use(express.json());

const prisma = new PrismaClient();

const PORT = process.env.PORT || 4000;

app.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    return res.send({
      error: false,
      payload: {
        users,
      },
    });
  } catch (error) {
    return res.send({
      error: true,
    });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
