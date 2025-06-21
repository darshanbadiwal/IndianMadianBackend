const turfService = require("../services/turf.service");
const Turf = require('../models/turf.model');

const registerTurf = async (req, res) => {
 const turfOwnerId = req.user.id; // Get from authenticated user

try {
  // Check if turf already exists for this owner (you might want to check by some unique field)
  const existingTurf = await turfService.findTurfByOwnerAndName(turfOwnerId, req.body.name);
  
  let turf;
  if (existingTurf) {
    // Update existing turf
    turf = await turfService.updateTurf(existingTurf._id, {
      ...req.body,
      turfOwnerId
    });
    res.status(200).json({ message: "Turf updated successfully", turf });
  } else {
    // Create new turf
    turf = await turfService.createTurf({
      ...req.body,
      turfOwnerId
    });
    
    // Update turfOwner's turfIds array
    await turfService.addTurfToOwner(turfOwnerId, turf._id);
    
    res.status(201).json({ message: "Turf registered successfully", turf });
  }
} catch (error) {
  res.status(500).json({ error: error.message });
}
};

const getMyTurfs = async (req, res) => {
  try {
    const turfs = await turfService.getUserTurfs(req.user.id);
    res.json(turfs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllTurfs = async (req, res) => {
  try {
    const { state, city, status } = req.body;
    
    // Create filters object only with provided values
    const filters = {};
    
    if (state) filters.state = state;
    if (city) filters.city = city;
    if (status !== undefined) filters.status = status;
    
    const turfs = await turfService.getTurfs(filters);
    console.log("Turf service loaded", turfs);
    
    res.json(turfs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPendingTurfs = async (req, res) => {
  try {
    const turfs = await turfService.getTurfs({ status: "pending" });
    res.json(turfs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const approveTurf = async (req, res) => {
  try {
    const turfId = req.params.id;
    await turfService.updateTurfStatus(turfId, "approved");
    res.json({ message: "Turf approved" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const rejectTurf = async (req, res) => {
  try {
    const turfId = req.params.id;
    await turfService.updateTurfStatus(turfId, "rejected");
    res.json({ message: "Turf rejected" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const getTurfById = async (req, res) => {
  try {
    const {turfId} = req.body;
    const turf = await turfService.getTurfById(turfId);
    if (!turf) {
      return res.status(404).json({ error: 'Turf not found' });
    }
    res.json(turf)
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete turf by ID
const deleteTurfById = async (req, res) => {
  try {
    const turfId = req.params.id;

    const deletedTurf = await Turf.findByIdAndDelete(turfId);

    if (!deletedTurf) {
      return res.status(404).json({ message: 'Turf not found' });
    }

    return res.status(200).json({ message: 'Turf deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};


module.exports = {
  registerTurf,
  getMyTurfs,
  getAllTurfs,
  getPendingTurfs,
  approveTurf,
  rejectTurf,
  getTurfById,
   deleteTurfById,
};