const Admin = require('../models/admin.model');
const bcrypt = require('bcrypt');

async function registerAdmin({ email, password, name }) {
  const existing = await Admin.findOne({ email });
  if (existing) throw new Error('Admin already exists');
  const hashedPassword = await bcrypt.hash(password, 10);
  const admin = new Admin({ email, password: hashedPassword, name });
  await admin.save();
  return admin;
}

async function loginAdmin(email, password) {
  const admin = await Admin.findOne({ email });
  if (!admin) throw new Error('Admin not found');
  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) throw new Error('Invalid password');
  return admin;
}

module.exports = { registerAdmin, loginAdmin };