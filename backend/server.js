import cors from "cors";
import express from "express";
import dotenv from "dotenv";
dotenv.config();

import { dbConnect } from "./config/db.js";
import authMiddleware from "./middlewares/authMiddleware.js";
import authRouter from "./routes/auth.route.js";
import friendRouter from "./routes/friend.route.js";

const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Public routes
app.use("/api/auth", authRouter);

app.get("/", (req, res) => {
  return res.status(200).json({
    message: "OK",
  });
});

// Protected routes
app.use("/api/friends", authMiddleware, friendRouter);

const port = process.env.PORT || 5000;

dbConnect()
  .then(() => {
    app.listen(port, () => {
      console.log(
        `Server is listening on port http://localhost:${port}`
      );
    });
  })
  .catch((error) => {
    console.log(
      `Error in connecting to Database: [ERROR] ${error}`
    );
  });