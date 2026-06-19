import express from "express";
import dotenv from "dotenv";
dotenv.config();
import { dbConnect } from "./config/db.js";
import authRouter from "./routes/auth.route.js";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRouter);

app.get("/", (req, res) => {
  return res.status(200).json({
    message: "OK",
  });
});

const port = process.env.PORT || 5000;
dbConnect()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is listening on port http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.log(`Error in connecting to Database: [ERROR] ${error}`);
  });
