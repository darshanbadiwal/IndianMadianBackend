const TurfOwner = require('../models/turfOwner.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const registerTurfOwner = async (ownerData) => {
  const { email, password } = ownerData;
  
  const existingOwner = await TurfOwner.findOne({ email });
  if (existingOwner) throw new Error('Email already in use');
  
  const hashedPassword = await bcrypt.hash(password, 10);
  const turfOwner = new TurfOwner({ ...ownerData, password: hashedPassword });
  
  return await turfOwner.save();
};

const loginTurfOwner = async (email, password) => {
  const turfOwner = await TurfOwner.findOne({ email });
  if (!turfOwner) throw new Error('Invalid credentials');
  
  const isMatch = await bcrypt.compare(password, turfOwner.password);
  if (!isMatch) throw new Error('Invalid credentials');
  
  const token = jwt.sign(
    { 
      id: turfOwner._id,
      name: turfOwner.name,
      email: turfOwner.email,
      role: 'turfOwner'
    },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
  
  return {
    token,
    user: {
      id: turfOwner._id,
      name: turfOwner.name,
      email: turfOwner.email,
      phone: turfOwner.phone
    }
  };
};

module.exports = {
  registerTurfOwner,
  loginTurfOwner
};