// controllers/gameController.js

import { User } from "../models/user.js";

export const finishGame = async (req, res) => {
  try {
    const { userId, won, mafiaKills } = req.body;

    const updateData = {
      $inc: {
        totalGamesPlayed: 1,
        mafiaKills: mafiaKills || 0,
      },
    };

    if (won) {
      updateData.$inc.totalGamesWon = 1;
      updateData.$inc.coins = 50;
      updateData.$inc.cash = 100;
      updateData.$inc.trophies = 25;
    } else {
      updateData.$inc.coins = 10;
      updateData.$inc.trophies = -10;
    }

    await User.findByIdAndUpdate(userId, updateData);

    res.json({
      success: true,
      message: "Stats updated",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
await axios.post(
  "http://localhost:5000/api/game/finish",
  {
    userId,
    won: true,
    mafiaKills: 2,
  }
);
await axios.put(
  "http://localhost:5000/api/profile",
  {
    username,
    avatar,
  }
);