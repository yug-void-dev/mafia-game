import express from "express";
import { User } from "../models/User.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
   const users = await User.find()
  .select(
    "username trophies totalGamesPlayed totalGamesWon avatar"
  )
  .sort({ trophies: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

export default router;