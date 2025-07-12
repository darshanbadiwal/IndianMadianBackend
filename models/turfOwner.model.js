const mongoose = require('mongoose');

const turfOwnerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  turfIds: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Turf',
    required: true
  }],
  
  // ✅ FCM token for push notification
  fcmToken: {
    type: String,
    default: null
  },
  
  createdAt: { type: Date, default: Date.now },
  // 👇 Add these two linesv for forgot password for turf owner
  resetToken: { type: String },
  resetTokenExpires: { type: Date },
});


module.exports = mongoose.model('TurfOwner', turfOwnerSchema);