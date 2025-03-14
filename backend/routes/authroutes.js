import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import { generateToken, verifyToken } from "../utils/jwtutils.js";
import { sendEmail } from "../utils/emailutils.js";
import dotenv from "dotenv";
dotenv.config();
const router = express.Router();

// Signup
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const user = await User.create({ name, email, password });
    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error: error.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user._id);
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
});

// Logout
router.post("/logout", (req, res) => {
  // Invalidate the JWT (on the client-side, token can be removed from local storage)
  res.status(200).json({ message: "Logout successful" });
});

// Password Reset Request
router.post("/password-reset", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });
    user.resetToken = resetToken;
    user.resetTokenExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    await sendEmail(email, "Password Reset", `Use this token to reset your password: ${resetToken}`);
    res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    res.status(500).json({ message: "Error sending password reset email", error: error.message });
  }
});

// Confirm Password Reset
router.post("/password-reset/confirm", async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id);

    if (!user || user.resetToken !== token || user.resetTokenExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    user.password = newPassword;
    user.resetToken = null;
    user.resetTokenExpires = null;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: "Error resetting password", error: error.message });
  }
});

export default router;
