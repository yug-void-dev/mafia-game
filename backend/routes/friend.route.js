import express from "express";
import { User } from "../models/user.js";
import { FriendRequest } from "../models/FriendRequest.js";

const router = express.Router();
router.get("/search/:username", async (req, res) => {
  try {
    const users = await User.find({
      username: {
        $regex: req.params.username,
        $options: "i",
      },
    }).select("username");

    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});
router.post("/send", async (req, res) => {
  try {
    const { receiverId } = req.body;

    const existing = await FriendRequest.findOne({
      sender: req.user._id,
      receiver: receiverId,
      status: "pending",
    });

    if (existing) {
      return res.status(400).json({
        message: "Request already sent",
      });
    }

    const request = await FriendRequest.create({
      sender: req.user._id,
      receiver: receiverId,
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});
router.get("/requests", async (req, res) => {
  try {
    const requests = await FriendRequest.find({
      receiver: req.user._id,
      status: "pending",
    }).populate("sender", "username");

    res.json(requests);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});
router.put("/accept/:id", async (req, res) => {
  try {
    const request = await FriendRequest.findById(
      req.params.id
    );

    if (!request) {
      return res.status(404).json({
        message: "Request not found",
      });
    }

    request.status = "accepted";
    await request.save();

    await User.findByIdAndUpdate(
      request.sender,
      {
        $addToSet: {
          friends: request.receiver,
        },
      }
    );

    await User.findByIdAndUpdate(
      request.receiver,
      {
        $addToSet: {
          friends: request.sender,
        },
      }
    );

    res.json({
      message: "Friend request accepted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});
router.put("/reject/:id", async (req, res) => {
  try {
    await FriendRequest.findByIdAndUpdate(
      req.params.id,
      {
        status: "rejected",
      }
    );

    res.json({
      message: "Request rejected",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});
router.get("/list", async (req, res) => {
  try {
    const user = await User.findById(
      req.user._id
    ).populate("friends", "username");

    res.json(user.friends);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});
export default router;