import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

const createRoom = (token, data) => api.post("/room/rooms", data, {
  headers: { Authorization: `Bearer ${token}` }
});

const getRooms = (token, params = {}) => api.get("/room/rooms", {
  headers: { Authorization: `Bearer ${token}` },
  params,
});

const joinRoom = (token, roomId) => api.post(`/room/rooms/${roomId}/join`, {}, {
  headers: { Authorization: `Bearer ${token}` }
});

export { createRoom, getRooms, joinRoom }
