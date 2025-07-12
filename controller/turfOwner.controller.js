const turfOwnerService = require('../services/turfOwner.service');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const TurfOwner = require('../models/turfOwner.model'); // ✅ Needed for DB lookups
const registerTurfOwner = async (req, res) => {
  try {
    const turfOwner = await turfOwnerService.registerTurfOwner(req.body);
    res.status(201).json(turfOwner);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const loginTurfOwner = async (req, res) => {
  try {
    const { email, password } = req.body;
    const token = await turfOwnerService.loginTurfOwner(email, password);
    res.status(200).json({ token });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

// ✅ 3. Forgot Password
const forgotPassword = async (req, res) => {
  console.log("📥 Forgot Password Request Received:", req.body);

  const { email } = req.body;
  const owner = await TurfOwner.findOne({ email });
  if (!owner) return res.status(404).json({ message: "Owner not found" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  owner.resetToken = otp;
  owner.resetTokenExpires = Date.now() + 3600000; // 1 hour validity
  await owner.save();

  const transporter = nodemailer.createTransport({
    host: "smtp.zoho.in",
    port: 465,
    secure: true,
    auth: {
      user: "info@indianmaidan.com",
      pass: "g5UpeTQ8N5mi"
    }
  });

  try {
    await transporter.sendMail({
      from: "info@indianmaidan.com", // ✅ required for Zoho
      to: email,
      subject: "Indian Maidan - Password Reset OTP",
      html: `<p>Your OTP is <b>${otp}</b>. It is valid for 1 hour.</p>`
    });

    console.log("✅ OTP sent to:", email);
    return res.status(200).json({ message: "OTP sent to email" });

  } catch (error) {
    console.error("❌ Failed to send OTP email:", error);
    return res.status(500).json({ message: "Failed to send OTP", error: error.message });
  }
};

// ✅ 4. Reset Password
const resetPassword = async (req, res) => {
  console.log("🔁 Reset Password Request:", req.body);

  const { email, otp, newPassword } = req.body;

  const owner = await TurfOwner.findOne({ email, resetToken: otp });

  if (!owner || owner.resetTokenExpires < Date.now()) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  // ✅ Hash the new password before saving
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  owner.password = hashedPassword;

  // ✅ Clear OTP
  owner.resetToken = undefined;
  owner.resetTokenExpires = undefined;

  await owner.save();

  res.status(200).json({ message: "Password reset successful" });
};
//this code is help for in to get the turf owner signup details on thier profile setting option
const getProfile = async (req, res) => {
  try {
    // req.user.id middleware se aayega (JWT verify ke baad)
    const owner = await TurfOwner.findById(req.user.id).select('-password -resetToken -resetTokenExpires');
    if (!owner) return res.status(404).json({ message: "Owner not found" });
    res.json(owner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//this APi is help to turf owner to update thier profile details like name and phone number
const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const owner = await TurfOwner.findByIdAndUpdate(
      req.user.id,
      { name, phone },
      { new: true, select: '-password -resetToken -resetTokenExpires' }
    );
    res.json(owner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const updateFcmToken = async (req, res) => {
  try {
    const ownerId = req.params.id;
    const { fcmToken } = req.body;

    if (!fcmToken) {
      return res.status(400).json({ message: 'Missing FCM token' });
    }

    await TurfOwner.findByIdAndUpdate(ownerId, { fcmToken });
    res.status(200).json({ message: '✅ FCM Token saved successfully' });
  } catch (error) {
    console.error('❌ Error saving FCM token:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};


module.exports = {
  registerTurfOwner,
  loginTurfOwner,
   forgotPassword,      // 👈 Add this line
  resetPassword,
  getProfile,
  updateProfile,
  updateFcmToken
};