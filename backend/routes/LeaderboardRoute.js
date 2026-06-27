import express from "express";
import { getLeaderboard } from "../controllers/Leaderboard.js";

const router = express.Router();

router.get("/", getLeaderboard);

export default router;