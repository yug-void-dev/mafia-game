import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    totalGamesPlayed: {
      type: Number,
      default: 0,
    },
    totalGamesWon: {
      type: Number,
      default: 0,
    },
    roleGetMaximumTime: {
      type: String,
      enum: ["police", "villager", "doctor", "mafia"],
    },
  },
  {
    timestamps: true,
  },
);

export const User = mongoose.model("User", userSchema);
