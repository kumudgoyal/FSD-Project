import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";
import User from "../models/user.model.js";
import dotenv from "dotenv";
dotenv.config();

// 🧠 Helper to create JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// 📝 Register user
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "Email already registered" });

    const user = new User({ name, email, password, role });

    // Create verification token
    const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1d" });
    user.verificationToken = verificationToken;
    await user.save();

    // Send verification email
    const verifyLink = `http://localhost:5000/api/auth/verify-email/${verificationToken}`;

    await sendEmail(
      email,
      "Verify Your Email",
      `<p>Hi ${name},</p>
       <p>Click below to verify your email:</p>
       <a href="${verifyLink}">${verifyLink}</a>`
    );

    res.status(201).json({ message: "User registered. Please verify your email." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Verify email
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({ email: decoded.email });
    if (!user) return res.status(400).json({ message: "Invalid token" });

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(400).json({ message: "Invalid or expired token" });
  }
};
//forgot password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "No user with this email" });

    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendEmail(
      email,
      "Password Reset Request",
      `<p>Click below to reset your password:</p>
       <a href="${resetLink}">${resetLink}</a>`
    );

    res.json({ message: "Password reset email sent" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) return res.status(400).json({ message: "Invalid token" });

    user.password = password; // make sure hashing middleware runs
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(400).json({ message: "Invalid or expired token" });
  }
};

// 🔑 Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user);
    /*if (!user.isVerified) {
  return res.status(403).json({ message: "Please verify your email first." });
    }
*/
    res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
    
