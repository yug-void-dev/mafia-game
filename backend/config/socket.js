import { Server } from "socket.io";

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("New client connected to socket:", socket.id);

    socket.on("join-map", (roomId, userData) => {
      socket.join(roomId);
      socket.to(roomId).emit("player-joined", { id: socket.id, ...userData });
      console.log(`User ${socket.id} joined room map: ${roomId}`);
    });

    socket.on("player-move", (roomId, positionData) => {

      socket.to(roomId).emit("player-moved", { id: socket.id, ...positionData });
    });

    socket.on("send-chat", (roomId, messageData) => {
      io.to(roomId).emit("receive-chat", { id: socket.id, ...messageData });
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
      io.emit("player-left", { id: socket.id });
    });
  });

  return io;
};
