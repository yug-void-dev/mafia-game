import { User } from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

//* signIn handler
export const signIn = async (req, res) => {
  try {

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Credentials not provided",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { _id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    return res.status(200).json({
      success: true,
      message: "user signed-in successfully",
      token: token,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};

//* signUp handler
export const signUp = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        error: "Credentials not provided",
      });
    }

    if (password != confirmPassword) {
      return res.status(400).json({
        success: false,
        error: "password not match",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username: username,
      email: email,
      password: hashPassword,
    });

    return res.status(201).json({
      success: true,
      message: "User signed-up successfully",
      user: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};
