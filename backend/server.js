import express from "express";
import { dbConnect } from "./config/db.js";
const app = express();

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
