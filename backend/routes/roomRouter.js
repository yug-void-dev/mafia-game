import { createRoom, getRooms, joinRoom } from "../controllers/roomController.js";
import { Router } from "express";

const router = Router();

router.post('/rooms', createRoom);
router.get('/rooms', getRooms);
router.post('/rooms/:roomId/join', joinRoom);
export default router;
