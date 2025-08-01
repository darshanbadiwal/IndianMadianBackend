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

const updateUserTurf = async (userId, updateData) => {
  try {
    // Find and update the user's turf
    const turf = await Turf.findOneAndUpdate(
      { userId: userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!turf) {
      throw new Error("No turf found for this user");
    }

    return turf;
  } catch (error) {
    throw new Error(error.message);
  }
};
// Create the missing function
async function findTurfByOwnerAndName(ownerId, turfName) {
  try {
    return await Turf.findOne({ userId: ownerId, turfName: turfName });
  } catch (error) {
    throw new Error("Error finding turf by owner and name: " + error.message);
  }
}
const updateTurf = async (turfId, updateData) => {
  try {
    return await Turf.findByIdAndUpdate(
      turfId,
      updateData,
      { new: true, runValidators: true }
    );
  } catch (error) {
    throw new Error(error.message);
  }
};
module.exports = {
  createTurf,
  getUserTurfs,
  getTurfs,
  addTurfToOwner,
  updateTurfStatus,
  getTurfById,
 updateUserTurf,
  updateTurf,
  findTurfByOwnerAndName
  
};
