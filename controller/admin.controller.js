const jwt = require('jsonwebtoken');
const { registerAdmin, loginAdmin } = require('../services/admin.service');
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const User = require("../models/userAuth.model");
const Turf = require("../models/turf.model");
const TurfOwner = require("../models/turfOwner.model");
const Booking = require("../models/booking.model"); // if this file exists
// Register a new admin
async function register(req, res) {
  try {
    const { email, password, name } = req.body;
    const admin = await registerAdmin({ email, password, name });
    res.status(201).json({ message: 'Admin registered', admin });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// Login admin
async function login(req, res) {
  try {
    const { email, password } = req.body;
    const admin = await loginAdmin(email, password);
    // Generate JWT token
    const token = jwt.sign({ id: admin._id, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ message: 'Login successful', token, admin: { email: admin.email, name: admin.name } });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
}

const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTurfs = await Turf.countDocuments();
    const totalOwners = await TurfOwner.countDocuments();
    const totalBookings = await Booking.countDocuments();

    // (Optional) Recent Bookings (5 latest)
    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("userId turfId");

    res.status(200).json({
      totalUsers,
      totalTurfs,
      totalOwners,
      totalBookings,
      recentBookings,
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = { register, login,getDashboardStats};