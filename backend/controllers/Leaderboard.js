import { User } from "../models/user.js";

export const getLeaderboard = async (req, res) => {
  try {
    const users = await User.find()
      .select("username trophies totalGamesPlayed totalGamesWon avatar")
      .sort({ trophies: -1 });

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};