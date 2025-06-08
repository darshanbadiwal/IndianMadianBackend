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

module.exports = {
  register,
  login,
  getAllUsers, // ✅ Export the new function
};