const mongoose = require('mongoose');

const turfOwnerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  turfIds: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Turf',
    required: true
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TurfOwner', turfOwnerSchema);