import { Room } from "../models/room.js";

//* Creating a Room
const createRoom = async (req, res) => {
  try {
    const { roomName, totalPlayers, roomType, map, contractMode, roomCode } =
      req.body;

    //& check if all info regarding room creation is present or not
    if (!roomName || !totalPlayers || !roomCode) {
      return res.status(400).json({
        success: false,
        error: "Room info not provided",
      });
    }

    let mafiaCount = 1;
    if (totalPlayers >= 8) {
      mafiaCount = 2;
    }

    await Room.create({
      roomName: roomName,
      totalPlayers: totalPlayers,
      roomType: roomType,
      map: map,
      contractMode: contractMode,
      mafiaCount: mafiaCount,
      roomCode: roomCode,
    });
  } catch (error) {}
};
