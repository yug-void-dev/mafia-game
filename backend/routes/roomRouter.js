import { createRoom, getRooms } from "../controllers/roomController.js";
import { Router } from "express";

const router = Router();

router.post('/rooms', createRoom);
router.get('/rooms', getRooms);

export default router;
