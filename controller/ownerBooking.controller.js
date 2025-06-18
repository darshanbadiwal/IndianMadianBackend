const bookingService = require("../services/booking.service");
const Booking = require('../models/booking.model');
const User = require('../models/userAuth.model');
const Turf = require('../models/turf.model');
// GET /api/owner/bookings
const ownerBookings = async (req, res) => {
  try {
    const ownerId = req.ownerId;             // auth-middleware से आयेगा
    const bookings = await bookingService.getBookingsForOwner(ownerId);
    res.status(200).json({ success: true, data: bookings });
  } catch (err) {
    console.error("Owner bookings error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};



const getBookingsByTurfId = async (req, res) => {
  try {
    const { turfId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(turfId)) {
      return res.status(400).json({ message: 'Invalid turf ID format' });
    }

    const bookings = await Booking.find({ turfId })
      .populate({
        path: 'userId',
        select: 'name email phone profileImage',
        model: User
      })
      .populate({
        path: 'turfId',
        select: 'name location images hourlyRate facilities',
        model: Turf
      })
      .sort({ startTime: 1 });

    const structuredResponse = bookings.map(booking => ({
      bookingInfo: {
        id: booking._id,
        startTime: booking.startTime,
        endTime: booking.endTime,
        totalPrice: booking.totalPrice,
        status: booking.status,
        createdAt: booking.createdAt
      },
      userInfo: {
        id: booking.userId._id,
        name: booking.userId.name,
        email: booking.userId.email,
        phone: booking.userId.phone,
        // profileImage: booking.userId.profileImage
      },
      turfInfo: {
        id: booking.turfId._id,
        name: booking.turfId.name,
        location: booking.turfId.location,
        images: booking.turfId.images,
        hourlyRate: booking.turfId.hourlyRate,
        facilities: booking.turfId.facilities
      }
    }));

    res.json({
      success: true,
      count: bookings.length,
      data: structuredResponse
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
};

module.exports = { getBookingsByTurfId,ownerBookings };
