import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    //* this is the name of the room
    roomName: {
      type: String,
      required: true,
    },
    //* these are the users who joins that particular room
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    //* person who actually creates the room
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    //* total number of players in the room
    totalPlayers: {
      type: Number,
      required: true,
    },
    //* tells if game started or not
    gameStarted: {
      type: Boolean,
      default: false,
    },
    //* tells if game ended or not
    gameEnded: {
      type: Boolean,
      default: false,
    },
    //* this tell the game state like (day time, night time, voting time, etc.)
    gameState: {
      type: String,
      enum: ["WAITING", "DAY", "NIGHT", "GAME_OVER", "VOTING"],
      default: "WAITING",
    },
    //* tells if room is public or private
    roomType: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
    //* this tell which day are we actually on
    currentDay: {
      type: Number,
      default: 0,
    },
    //* this tell which night we are actually on
    currentNight: {
      type: Number,
      default: 0,
    },
    //* this tell the number of mafia in the game
    mafiaCount: {
      type: Number,
      default: 1,
    },
    //* this tells which map is selected for the game
    map: {
      type: String,
      enum: ["city", "village", "forest", "harbor", "casino", "mansion"],
      default: "city",
    },
    //* this field tells game contract mode
    contractMode: {
      type: String,
      enum: ["classic", "quick", "custom"],
      default: "classic",
    },
    //* this is the unique code for the room
    roomCode: {
      type: Number,
      unique: true,
      required: true,
    },
    //* tracks in-game state for each player
    playersState: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        role: {
          type: String,
          enum: ["mafia", "doctor", "police", "villager"],
        },
        isAlive: {
          type: Boolean,
          default: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

export const Room = mongoose.model("Room", roomSchema);
