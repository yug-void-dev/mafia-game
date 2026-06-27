import { Room } from "../models/room.js";

//* Creating a Room
export const createRoom = async (req, res) => {
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

    //& logic to update the mafia count on basic of totalPlayers present in the room
    let mafiaCount = 1;
    if (totalPlayers >= 8) {
      mafiaCount = 2;
    }

    //& added room info into DB
    await Room.create({
      host: req.user._id,
      roomName: roomName,
      totalPlayers: totalPlayers,
      roomType: roomType,
      map: map,
      users: [req.user._id],
      contractMode: contractMode,
      mafiaCount: mafiaCount,
      roomCode: roomCode,
    });

    return res.status(201).json({
      success: true,
      message: "Room created successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};

export const getRooms = async (req, res) => {
  try {
    const search = req.query.search || "";
    const map = req.query.map;

    const rooms = await Room.find({ roomType: 'public' });

    if (rooms.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No rooms are available",
      });
    }

    const filteredRooms = rooms.filter((room) => {
      const matchesSearch = !search || room.roomName.toLowerCase().includes(search.toLowerCase());
      const matchesMap = !map || room.map === map;
      return matchesSearch && matchesMap;
    });

    return res.status(200).json({
      success: true,
      rooms: filteredRooms,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};

export const joinRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        error: "Room not found",
      });
    }
    if (room.users.length >= room.totalPlayers) {
      return res.status(400).json({
        success: false,
        error: "Room is full",
      });
    }
    if (room.users.some(userId => userId.toString() === req.user._id.toString())) {
      return res.status(400).json({
        success: false,
        error: "You are already in the room",
      });
    }
    room.users.push(req.user._id);
    await room.save();
    return res.status(200).json({
      success: true,
      message: "Joined room successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
}
