import { User } from "../models/user.js";

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({
      success: true,
      user,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
    });
  }
};

export const updateProfile = async (
  req,
  res
) => {
  try {
    const { username, avatar } = req.body;

    let finalAvatar = avatar;
    if (req.file) {
      finalAvatar = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        username,
        avatar: finalAvatar,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      user,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
    });
  }
};
