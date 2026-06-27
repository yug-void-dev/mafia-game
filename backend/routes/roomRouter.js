import { createRoom, getRooms, getRoomDetails, joinRoom, leaveRoom } from "../controllers/roomController.js";
import { Router } from "express";

const router = Router();

router.post("/rooms", createRoom);
router.get("/rooms", getRooms);
router.get("/rooms/:roomId", getRoomDetails);
router.post("/rooms/:roomId/join", joinRoom);
router.post("/rooms/:roomId/leave", leaveRoom);

export default router;
