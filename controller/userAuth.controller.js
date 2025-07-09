const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { saveUser, findUserByEmail } = require("../services/userAuth.service");
const User = require("../models/userAuth.model"); // ✅ Add this line

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret"; // Use environment variable

// Helper function to format user data
const formatUserData = (user) => {
  const { password, __v, ...userData } = user.toObject();
  return userData;
};


  // ✅ NEW: Fetch all users for admin panel
const getAllUsers=async(req, res)=> {
    console.log("Fetching all users...");
    try {
      const users = await User.find(); // पूरे users database से ले आओ
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: "Server Error" });
    }
  }

  // Register Function
  const register =async(req, res)=>{
    try {
      const { email, password, name, phoneNumber, location, sportsPreferences } = req.body;

      if (!email || !password || !name || !phoneNumber || !location || !sportsPreferences) {
        return res.status(400).json({
          success: false,
          message: "All fields are required",
          requiredFields: ["email", "password", "name", "phoneNumber", "location", "sportsPreferences"]
        });
      }

      const existingUser = await findUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already registered"
        });
      }

      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      const userData = {
        email,
        password: hashedPassword,
        name,
        phoneNumber,
        location,
        sportsPreferences,
      };

      const newUser = await saveUser(userData);
      const formattedUser = formatUserData(newUser);

      const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: "7d" });

      return res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          user: formattedUser,
          token
        }
      });
    } catch (err) {
      console.error("Registration error:", err);
      return res.status(500).json({
        success: false,
        message: "Error in user registration",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }

  // Login Function
  const login=async (req, res)=> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email and password are required"
        });
      }

      const user = await findUserByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials"
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials"
        });
      }

      const formattedUser = formatUserData(user);
      const token = jwt.sign({ id: user._id, formattedUser }, JWT_SECRET, { expiresIn: "7d" });

      return res.status(200).json({
        success: true,
        message: "Login successful",
        token
      });
    } catch (err) {
      console.error("Login error:", err);
      return res.status(500).json({
        success: false,
        message: "Error in user login",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }
//forgot password functions for user in main booking website 
const nodemailer = require("nodemailer");

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  console.log("📥 Forgot Password Request:", email);

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetToken = otp;
    user.resetTokenExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const transporter = nodemailer.createTransport({
      host: "smtp.zoho.in",
      port: 465,
      secure: true,
      auth: {
        user: "info@indianmaidan.com",
        pass: "g5UpeTQ8N5mi"
      }
    });

    await transporter.sendMail({
      from: "info@indianmaidan.com",
      to: email,
      subject: "Indian Maidan - Password Reset OTP",
      html: `<p>Your OTP is <b>${otp}</b>. It is valid for 1 hour.</p>`
    });

    res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("❌ Forgot Password Error:", error);
    res.status(500).json({ message: "Failed to send OTP", error: error.message });
  }
};
//Reset password function for user in main booking website
const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await User.findOne({ email, resetToken: otp });
    if (!user || user.resetTokenExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("❌ Reset Password Error:", error);
    res.status(500).json({ message: "Reset failed", error: error.message });
  }
};

module.exports = {
  register,
  login,
  getAllUsers,
  forgotPassword,
  resetPassword  
};