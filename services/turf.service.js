const Turf = require("../models/turf.model");
const TurfOwner = require("../models/turfOwner.model");

const createTurf = async (turfData) => {
  const newTurf = new Turf(turfData);
  return await newTurf.save();
};

const addTurfToOwner = async (turfOwnerId, turfId) => {
  await TurfOwner.findByIdAndUpdate(
    turfOwnerId,
    { $push: { turfIds: turfId } },
    { new: true }
  );
};

// Get all turfs for a specific user
const getUserTurfs = async (userId) => {
  try {
    return await Turf.find({ userId });
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get all turfs (for public view)
const getTurfs = async (filters = {}) => {
  return Turf.find(filters);
  
};

const updateTurfStatus = async (turfId, status) => {
  return Turf.findByIdAndUpdate(turfId, { status }, { new: true });
};
const getTurfById = async (turfId) => {
  return await Turf.findById(turfId);
};

module.exports = {
  createTurf,
  getUserTurfs,
  getTurfs,
  addTurfToOwner,
  updateTurfStatus,
  getTurfById
};
