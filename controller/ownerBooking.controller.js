const bookingService = require("../services/booking.service");
const Booking = require('../models/booking.model');
const User = require('../models/userAuth.model');
const Turf = require('../models/turf.model');
const TurfOwner = require('../models/turfOwner.model');
const { default: mongoose } = require("mongoose");



// GET /api/owner/bookings
const ownerBookings = async (req, res) => {
  try {
    const ownerId = req.ownerId;
    const bookings = await bookingService.getBookingsForOwner(ownerId);
    res.status(200).json({ success: true, data: bookings });
  } catch (err) {
    console.error("Owner bookings error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// ✅ Booking list turfId se (SAFE - no phone/email)
const getBookingsByTurfId = async (req, res) => {
  try {
    const { turfId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(turfId)) {
      return res.status(400).json({ message: 'Invalid turf ID format' });
    }

    const bookings = await Booking.find({ turfId })
      .populate({
        path: 'userId',
        select: 'name', // ✅ Only show name
        model: User
      })
      .populate({
        path: 'turfId',
        select: 'name location images hourlyRate facilities',
        model: Turf
      })
      .sort({ startTime: 1 });

    const structuredResponse = bookings.map(booking => {
      const userInfo = booking.userId ? {
        id: booking.userId._id,
        name: booking.userId.name
      } : null;

      const turfInfo = booking.turfId ? {
        id: booking.turfId._id,
        name: booking.turfId.name,
        location: booking.turfId.location,
        images: booking.turfId.images,
        hourlyRate: booking.turfId.hourlyRate,
        facilities: booking.turfId.facilities
      } : null;

  return {
  bookingInfo: {
    id: booking._id,
    startTime: booking.startTime,
    endTime: booking.endTime,
    totalPrice: booking.totalPrice,
    status: booking.status,
    createdAt: booking.createdAt,
    advancePaid: booking.advancePaid,                // <-- Add this
    amountDueAtVenue: booking.amountDueAtVenue,      // <-- Add this
    advancePercentage: booking.advancePercentage,    // <-- Add this
    selectedSlots: booking.selectedSlots,            // <-- Add this
    sport: booking.sport,                            // (optional)
    bookingDate: booking.bookingDate                 // (optional)
  },
  userInfo,
  turfInfo
};
    });

    res.json({
      success: true,
      count: bookings.length,
      data: structuredResponse.filter(item => item.userInfo && item.turfInfo)
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ✅ Booking creation and WhatsApp simulation (SAFE)
const createOwnerBooking = async (req, res) => {
  try {
    const { turfId, userId, startTime, endTime, totalPrice } = req.body;

    const booking = await Booking.create({
      turfId,
      userId,
      startTime,
      endTime,
      totalPrice
    });

    const turf = await Turf.findById(turfId);
    const owner = await TurfOwner.findById(turf.userId);
    const user = await User.findById(userId).select("name"); // ✅ Only get name

    

    res.status(200).json({ message: 'Booking saved and WhatsApp simulated!', booking });
  } catch (error) {
    console.error('❌ Booking Error:', error.message);
    res.status(500).json({ error: 'Failed to create booking' });
  }
};

module.exports = {
  getBookingsByTurfId,
  ownerBookings,
  createOwnerBooking
};



