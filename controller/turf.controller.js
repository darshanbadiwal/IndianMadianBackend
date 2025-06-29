const turfService = require("../services/turf.service");
const Turf = require('../models/turf.model');

// ✅ TURF REGISTER CONTROLLER
const registerTurf = async (req, res) => {
  const turfOwnerId = req.user.id;

  try {
    const existingTurf = await turfService.findTurfByOwnerAndName(turfOwnerId, req.body.name);

    let turf;
    if (existingTurf) {
      // ✅ UPDATE existing turf
      const updates = {
        ...req.body,
        turfOwnerId,
      };

      // ✅ Ensure price fields are updated only if present
      if (req.body.weekdayRate !== undefined) updates.weekdayRate = req.body.weekdayRate;
      if (req.body.weekendRate !== undefined) updates.weekendRate = req.body.weekendRate;

      turf = await turfService.updateTurf(existingTurf._id, updates);
      res.status(200).json({ message: "Turf updated successfully", turf });
    } else {
      // ✅ CREATE new turf
      turf = await turfService.createTurf({
        ...req.body,
        turfOwnerId,
        weekdayRate: req.body.weekdayRate,
        weekendRate: req.body.weekendRate,
      });

      await turfService.addTurfToOwner(turfOwnerId, turf._id);
      res.status(201).json({ message: "Turf registered successfully", turf });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ TURF EDIT CONTROLLER
const editTurf = async (req, res) => {
  try {
    const turfId = req.params.id;
    const updates = { ...req.body };

    // ✅ Add pricing safely if present
    if (req.body.weekdayRate !== undefined) updates.weekdayRate = req.body.weekdayRate;
    if (req.body.weekendRate !== undefined) updates.weekendRate = req.body.weekendRate;

    const turf = await turfService.getTurfById(turfId);
    if (!turf) {
      return res.status(404).json({ error: 'Turf not found' });
    }

    if (turf.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to edit this turf' });
    }

    const updatedTurf = await turfService.updateTurf(turfId, updates);
    res.status(200).json({ message: "Turf updated successfully", turf: updatedTurf });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ NO CHANGES NEEDED BELOW THIS LINE

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
    const { turfId } = req.body;
    const turf = await turfService.getTurfById(turfId);
    if (!turf) {
      return res.status(404).json({ error: 'Turf not found' });
    }
    res.json(turf);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

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

const getTurfsByCity = async (req, res) => {
  try {
    const { city } = req.body;

    if (!city) {
      return res.status(400).json({
        success: false,
        message: "City parameter is required in the request body"
      });
    }

    const turfs = await Turf.find({
      "location.city": { $regex: new RegExp(city, 'i') },
      status: 'approved'
    }).populate('userId', 'name email');

    if (turfs.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No approved turfs found in ${city}`
      });
    }

    res.status(200).json({
      success: true,
      count: turfs.length,
      data: turfs
    });

  } catch (error) {
    console.error("Error fetching turfs by city:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching turfs",
      error: error.message
    });
  }
};
const updateTurfAvailability = async (req, res) => { // This function helps turf owners to turn on and off their turf availability
  try {
    const { turfId } = req.params;
    const { isAvailable } = req.body;

    const turf = await Turf.findById(turfId);
    if (!turf) {
      return res.status(404).json({ message: "Turf not found" });
    }

    // Optional: restrict toggle to the owner only
    if (turf.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this turf" });
    }

    turf.isAvailable = isAvailable;
    await turf.save();

    res.status(200).json({ message: "Turf availability updated", turf });
  } catch (error) {
    console.error("Error updating turf availability:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};




module.exports = {
  registerTurf,
  editTurf,
  getMyTurfs,
  getAllTurfs,
  getPendingTurfs,
  approveTurf,
  rejectTurf,
  getTurfById,
  deleteTurfById,
  getTurfsByCity,
  updateTurfAvailability  //this function help turf owner to turn on and off their turf for some times etc..
  
};
