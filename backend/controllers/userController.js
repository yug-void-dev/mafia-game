import { User } from "../models/user.js"

// ─────────────────────────────────────────────────────────────────────────────
// Achievement definitions (single source of truth shared with frontend)
// Each entry:  key (stored in DB) | condition fn (receives user doc)
// ─────────────────────────────────────────────────────────────────────────────
const STAT_ACHIEVEMENTS = [
  {
    key: "veteran_spirit",
    check: (u) => u.totalGamesPlayed >= 50,
  },
  {
    key: "serial_winner",
    check: (u) => u.totalGamesWon >= 10,
  },
  {
    key: "killing_spree",
    check: (u) => u.mafiaKills >= 20,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/user/:id
// Returns user data and auto-unlocks any newly earned stat-based achievements
// ─────────────────────────────────────────────────────────────────────────────
export const getUserData = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Auto-unlock stat-based achievements if newly earned
    const newlyUnlocked = [];
    for (const ach of STAT_ACHIEVEMENTS) {
      if (!user.achievements.includes(ach.key) && ach.check(user)) {
        user.achievements.push(ach.key);
        newlyUnlocked.push(ach.key);
      }
    }
    // Persist only if something changed
    if (newlyUnlocked.length > 0) {
      await user.save();
    }

    // Never send password to frontend
    const { password: _pw, ...safeUser } = user.toObject();

    return res.status(200).json({
      success: true,
      user: safeUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/user/:id/unlock-achievement
// Called from game logic to unlock a game-event achievement
// Body: { achievementKey: "first_blood" }
// ─────────────────────────────────────────────────────────────────────────────
export const unlockAchievement = async (req, res) => {
  try {
    const { id } = req.params;
    const { achievementKey } = req.body;

    if (!achievementKey) {
      return res.status(400).json({ success: false, message: "achievementKey is required" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Idempotent: don't add duplicate
    if (!user.achievements.includes(achievementKey)) {
      user.achievements.push(achievementKey);
      await user.save();
    }

    return res.status(200).json({
      success: true,
      message: `Achievement '${achievementKey}' unlocked`,
      achievements: user.achievements,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};
