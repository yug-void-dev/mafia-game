import express from "express";
import {
  getProfile,
  updateProfile,
} from "../controllers/profileController.js";

import authMiddleware from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getProfile);
router.put("/", authMiddleware, upload.single("avatar"), updateProfile);

export default router;