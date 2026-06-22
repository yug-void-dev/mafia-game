import { User } from "../models/user.js";

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(
      req.params.id
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

export const updateProfile = async (
  req,
  res
) => {
  try {
    const { username, avatar } =
      req.body;

    const user =
      await User.findByIdAndUpdate(
        req.params.id,
        {
          username,
          avatar,
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