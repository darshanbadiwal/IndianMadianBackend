const turfOwnerService = require('../services/turfOwner.service');

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
  const { email } = req.body;
  const owner = await TurfOwner.findOne({ email });
  if (!owner) return res.status(404).json({ message: "Owner not found" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  owner.resetToken = otp;
  owner.resetTokenExpires = Date.now() + 3600000; // 1 hour validity
  await owner.save();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "darshanbadiwal05@gmail.com",           // 👈 apna Gmail yaha likhna
      pass: "kelh jnyu vtrg ppeo"         // 👈 Gmail App Password (Google settings se banta hai)
    }
  });

  await transporter.sendMail({
    to: email,
    subject: "Indian Maidan - Password Reset OTP",
    html: `<p>Your OTP is <b>${otp}</b>. It is valid for 1 hour.</p>`
  });

  res.status(200).json({ message: "OTP sent to email" });
};

// ✅ 4. Reset Password
const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const owner = await TurfOwner.findOne({ email, resetToken: otp });

  if (!owner || owner.resetTokenExpires < Date.now()) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  owner.password = newPassword;
  owner.resetToken = undefined;
  owner.resetTokenExpires = undefined;
  await owner.save();

  res.status(200).json({ message: "Password reset successful" });
};

module.exports = {
  registerTurfOwner,
  loginTurfOwner,
   forgotPassword,      // 👈 Add this line
  resetPassword     
};