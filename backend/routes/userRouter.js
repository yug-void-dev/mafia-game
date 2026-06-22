import express from "express"
import { getUserData, unlockAchievement } from "../controllers/userController.js"

const router = express.Router()

// GET /api/user/:id — fetch user data (also auto-unlocks stat achievements)
router.get("/:id", getUserData)

// POST /api/user/:id/unlock-achievement — called from game logic to unlock an achievement
// Body: { achievementKey: "first_blood" }
router.post("/:id/unlock-achievement", unlockAchievement)

export default router;
