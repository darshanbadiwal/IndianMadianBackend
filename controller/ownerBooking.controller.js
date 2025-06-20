const bookingService = require("../services/booking.service");
const Booking = require('../models/booking.model');
const User = require('../models/userAuth.model');
const Turf = require('../models/turf.model');
const TurfOwner = require('../models/turfOwner.model');
const { default: mongoose } = require("mongoose");

const { sendWhatsAppMessage } = require('../utils/gupshup');


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
        select: 'name email phoneNumber profileImage',
        model: User
      })
      .populate({
        path: 'turfId',
        select: 'name location images hourlyRate facilities',
        model: Turf
      })
      .sort({ startTime: 1 });

    const structuredResponse = bookings.map(booking => {
      // Add null checks for populated fields
     
      const userInfo = booking.userId ? {
        id: booking.userId._id,
        name: booking.userId.name,
        email: booking.userId.email,
        phoneNumber: booking.userId.phoneNumber,
        // profileImage: booking.userId.profileImage
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
          createdAt: booking.createdAt
        },
        userInfo,
        turfInfo
      };
    });

    res.json({
      success: true,
      count: bookings.length,
      data: structuredResponse.filter(item => item.userInfo && item.turfInfo) // Filter out invalid entries
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

//whats app message alert gupshup code

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
    const user = await User.findById(userId); // optional: for user name

    if (!owner || !owner.phone) {
      return res.status(404).json({ message: 'Owner phone number not found' });
    }

    // ✅ Simulate WhatsApp
    await sendWhatsAppMessage(
      owner.phone,               // 📱 Must include country code like +91xxxxxxxxxx
      owner.name,
      user?.name || "Customer",
      `${startTime}–${endTime}`,
      booking.date || new Date().toDateString()
    );

    res.status(200).json({ message: 'Booking saved and WhatsApp simulated!', booking });

  } catch (error) {
    console.error('❌ Booking Error:', error.message);
    res.status(500).json({ error: 'Failed to create booking' });
  }
};

module.exports = { getBookingsByTurfId,ownerBookings,createOwnerBooking };
