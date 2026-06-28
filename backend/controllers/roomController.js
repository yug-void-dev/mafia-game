import { Room } from "../models/room.js";

//* Creating a Room
export const createRoom = async (req, res) => {
  try {
    const { roomName, totalPlayers, roomType, map, contractMode, roomCode } =
      req.body;

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

    const room = await Room.create({
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
      room,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};

//* Get all public rooms (with optional search/map filter)
export const getRooms = async (req, res) => {
  try {
    const search = req.query.search || "";
    const map = req.query.map;

    const rooms = await Room.find({ roomType: "public" });

    if (rooms.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No rooms are available",
      });
    }

    const filteredRooms = rooms.filter((room) => {
      const matchesSearch =
        !search || room.roomName.toLowerCase().includes(search.toLowerCase());
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

//* Get a single room's details with populated players list
export const getRoomDetails = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findById(roomId)
      .populate("users", "username avatar")
      .populate("host", "username avatar");

    if (!room) {
      return res.status(404).json({
        success: false,
        error: "Room not found",
      });
    }

    if (room.gameStarted && room.playersState && room.playersState.length > 0) {
      const roomObj = room.toObject();
      const currentUserId = req.user._id.toString();

      const myState = roomObj.playersState.find(p => p.user.toString() === currentUserId);
      const amIMafia = myState && myState.role === "mafia";

      roomObj.playersState = roomObj.playersState.map(player => {
        if (player.user.toString() === currentUserId) return player;

        if (amIMafia && player.role === "mafia") return player;

        return { ...player, role: null };
      });

      return res.status(200).json({
        success: true,
        room: roomObj,
      });
    }

    return res.status(200).json({
      success: true,
      room,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};

//* Join a Room
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

    if (room.gameStarted) {
      return res.status(400).json({
        success: false,
        error: "Game has already started",
      });
    }

    if (room.users.length >= room.totalPlayers) {
      return res.status(400).json({
        success: false,
        error: "Room is full",
      });
    }

    if (room.users.some((userId) => userId.toString() === req.user._id.toString())) {
      // Already in room — just return room details so they can navigate to lobby
      const populatedRoom = await Room.findById(roomId)
        .populate("users", "username avatar")
        .populate("host", "username avatar");

      return res.status(200).json({
        success: true,
        message: "You are already in this room",
        room: populatedRoom,
      });
    }

    room.users.push(req.user._id);
    await room.save();

    //& Return the populated room so frontend can navigate directly
    const populatedRoom = await Room.findById(roomId)
      .populate("users", "username avatar")
      .populate("host", "username avatar");

    return res.status(200).json({
      success: true,
      message: "Joined room successfully",
      room: populatedRoom,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};

//* Leave a Room
export const leaveRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        error: "Room not found",
      });
    }

    const userId = req.user._id.toString();

    // Remove user from the room
    room.users = room.users.filter((id) => id.toString() !== userId);

    // If the host leaves and there are still players, transfer host to next player
    if (room.host.toString() === userId && room.users.length > 0) {
      room.host = room.users[0];
    }

    // If no players remain, delete the room
    if (room.users.length === 0) {
      await Room.findByIdAndDelete(roomId);
      return res.status(200).json({
        success: true,
        message: "Room deleted as no players remain",
      });
    }

    await room.save();

    return res.status(200).json({
      success: true,
      message: "Left room successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};

//* Start the game and assign roles
export const startGame = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({ success: false, error: "Room not found" });
    }

    // Only host can start
    if (room.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: "Only the host can start the game" });
    }

    if (room.gameStarted) {
      return res.status(400).json({ success: false, error: "Game already started" });
    }

    const totalPlayers = room.users.length;
    const numMafia = room.mafiaCount;
    const numDoctor = 1;
    const numPolice = 1;

    // Ensure we don't end up with negative villagers if we test with very few players
    const numVillagers = Math.max(0, totalPlayers - numMafia - numDoctor - numPolice);

    let roles = [];
    for (let i = 0; i < numMafia; i++) roles.push("mafia");
    for (let i = 0; i < numDoctor; i++) roles.push("doctor");
    for (let i = 0; i < numPolice; i++) roles.push("police");
    for (let i = 0; i < numVillagers; i++) roles.push("villager");

    // If we have fewer players than required roles (e.g. testing with 2 players),
    // slice the roles array to match the number of players
    roles = roles.slice(0, totalPlayers);

    // Shuffle roles array
    for (let i = roles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [roles[i], roles[j]] = [roles[j], roles[i]];
    }

    const playersState = room.users.map((userId, index) => ({
      user: userId,
      role: roles[index] || "villager",
      isAlive: true
    }));

    room.playersState = playersState;
    room.gameStarted = true;
    room.gameState = "NIGHT"; // Mafia games typically start at night
    await room.save();

    return res.status(200).json({
      success: true,
      message: "Game started successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};
