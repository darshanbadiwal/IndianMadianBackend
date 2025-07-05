const turfService = require("../services/turf.service");
const Turf = require('../models/turf.model');


// Helper function for error responses
const errorResponse = (res, status, message, error = null) => {
  console.error(message, error);
  return res.status(status).json({
    success: false,
    message,
    error: error?.message || null
  });
};

// ✅ TURF REGISTER/UPDATE CONTROLLER
const registerTurf = async (req, res) => {
  try {
  

    const turfOwnerId = req.user.id;
    const existingTurf = await turfService.findTurfByOwnerAndName(turfOwnerId, req.body.turfName);

    // Prepare base payload
    const payload = {
      ...req.body,
      userId: turfOwnerId,
      status: 'pending' // Default status for new turfs
    };

    let turf;
    if (existingTurf) {
      // Verify ownership
      if (existingTurf.userId.toString() !== turfOwnerId) {
        return errorResponse(res, 403, 'Not authorized to update this turf');
      }

      // Update existing turf
      turf = await turfService.updateTurf(existingTurf._id, payload);
      return res.status(200).json({
        success: true,
        message: "Turf updated successfully",
        data: turf
      });
    } else {
      // Create new turf
      turf = await turfService.createTurf(payload);
      await turfService.addTurfToOwner(turfOwnerId, turf._id);
      
      return res.status(201).json({
        success: true,
        message: "Turf registered successfully",
        data: turf
      });
    }
  } catch (error) {
    return errorResponse(res, 500, 'Turf registration failed', error);
  }
};

// ✅ TURF EDIT CONTROLLER
const editTurf = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const turfId = req.params.id;
    const updates = { ...req.body };

    // Verify turf exists and belongs to user
    const turf = await turfService.getTurfById(turfId);
    if (!turf) {
      return errorResponse(res, 404, 'Turf not found');
    }

    if (turf.userId.toString() !== req.user.id) {
      return errorResponse(res, 403, 'Not authorized to edit this turf');
    }

    // Handle nested location update
    if (req.body.location) {
      updates['location.state'] = req.body.location.state;
      updates['location.city'] = req.body.location.city;
      updates['location.lat'] = req.body.location.lat;
      updates['location.lng'] = req.body.location.lng;
      delete updates.location;
    }

    const updatedTurf = await turfService.updateTurf(turfId, updates);
    return res.status(200).json({
      success: true,
      message: "Turf updated successfully",
      data: updatedTurf
    });
  } catch (error) {
    return errorResponse(res, 500, 'Turf update failed', error);
  }
};

// GET USER'S TURFS
const getMyTurfs = async (req, res) => {
  try {
    const turfs = await turfService.getUserTurfs(req.user.id);
    return res.status(200).json({
      success: true,
      count: turfs.length,
      data: turfs
    });
  } catch (error) {
    return errorResponse(res, 500, 'Failed to fetch user turfs', error);
  }
};

// GET ALL TURFS (FILTERABLE)
const getAllTurfs = async (req, res) => {
  try {
    const { state, city, status, isAvailable } = req.query; // Changed from body to query params
    
    const filters = {};
    if (state) filters['location.state'] = new RegExp(state, 'i');
    if (city) filters['location.city'] = new RegExp(city, 'i');
    if (status) filters.status = status;
    if (isAvailable !== undefined) filters.isAvailable = isAvailable;

    const turfs = await turfService.getTurfs(filters);
    return res.status(200).json({
      success: true,
      count: turfs.length,
      data: turfs
    });
  } catch (error) {
    return errorResponse(res, 500, 'Failed to fetch turfs', error);
  }
};

// GET PENDING TURFS (ADMIN)
const getPendingTurfs = async (req, res) => {
  try {
    const turfs = await turfService.getTurfs({ status: "pending" });
    return res.status(200).json({
      success: true,
      count: turfs.length,
      data: turfs
    });
  } catch (error) {
    return errorResponse(res, 500, 'Failed to fetch pending turfs', error);
  }
};

// APPROVE TURF (ADMIN)
const approveTurf = async (req, res) => {
  try {
    const turfId = req.params.id;
    const updatedTurf = await turfService.updateTurfStatus(turfId, "approved");
    
    if (!updatedTurf) {
      return errorResponse(res, 404, 'Turf not found');
    }
    
    return res.status(200).json({
      success: true,
      message: "Turf approved successfully",
      data: updatedTurf
    });
  } catch (error) {
    return errorResponse(res, 500, 'Failed to approve turf', error);
  }
};

// REJECT TURF (ADMIN)
const rejectTurf = async (req, res) => {
  try {
    const turfId = req.params.id;
    const updatedTurf = await turfService.updateTurfStatus(turfId, "rejected");
    
    if (!updatedTurf) {
      return errorResponse(res, 404, 'Turf not found');
    }
    
    return res.status(200).json({
      success: true,
      message: "Turf rejected successfully",
      data: updatedTurf
    });
  } catch (error) {
    return errorResponse(res, 500, 'Failed to reject turf', error);
  }
};

// GET TURF BY ID
const getTurfById = async (req, res) => {
  try {
    const turfId = req.params.id; // Changed from body to params
    const turf = await turfService.getTurfById(turfId);
    
    if (!turf) {
      return errorResponse(res, 404, 'Turf not found');
    }
    
    return res.status(200).json({
      success: true,
      data: turf
    });
  } catch (error) {
    return errorResponse(res, 500, 'Failed to fetch turf', error);
  }
};

// DELETE TURF
const deleteTurfById = async (req, res) => {
  try {
    const turfId = req.params.id;
    const turf = await turfService.getTurfById(turfId);
    
    if (!turf) {
      return errorResponse(res, 404, 'Turf not found');
    }
    
    // Verify ownership
    if (turf.userId.toString() !== req.user.id) {
      return errorResponse(res, 403, 'Not authorized to delete this turf');
    }

    const deletedTurf = await Turf.findByIdAndDelete(turfId);
    return res.status(200).json({
      success: true,
      message: 'Turf deleted successfully',
      data: deletedTurf
    });
  } catch (error) {
    return errorResponse(res, 500, 'Failed to delete turf', error);
  }
};

// GET TURFS BY CITY
const getTurfsByCity = async (req, res) => {
  try {
    const { city } = req.query; // Changed from body to query params

    if (!city) {
      return errorResponse(res, 400, "City parameter is required");
    }

    const turfs = await Turf.find({
      "location.city": { $regex: new RegExp(city, 'i') },
      status: 'approved',
      isAvailable: true
    }).populate('userId', 'name email phone');

    return res.status(200).json({
      success: true,
      count: turfs.length,
      data: turfs
    });
  } catch (error) {
    return errorResponse(res, 500, "Failed to fetch turfs by city", error);
  }
};

// UPDATE TURF AVAILABILITY
const updateTurfAvailability = async (req, res) => {
  try {
    const { turfId } = req.params;
    const { isAvailable } = req.body;

    const turf = await Turf.findById(turfId);
    if (!turf) {
      return errorResponse(res, 404, "Turf not found");
    }

    // Verify ownership
    if (turf.userId.toString() !== req.user.id) {
      return errorResponse(res, 403, "Not authorized to update this turf");
    }

    turf.isAvailable = isAvailable;
    await turf.save();

    return res.status(200).json({
      success: true,
      message: "Turf availability updated",
      data: turf
    });
  } catch (error) {
    return errorResponse(res, 500, "Failed to update turf availability", error);
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
  updateTurfAvailability
};