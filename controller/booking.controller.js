const Booking = require("../models/booking.model");
const Turf = require('../models/turf.model');
const TurfOwner = require('../models/turfOwner.model');
const { sendPushNotification } = require('../utils/fcm');

exports.createBooking = async (req, res) => {
  try {
    const {
      userId,
      turfId,
      startTime,
      endTime,
      sport,
      bookingDate,
      selectedSlots,
      advancePercentage,
      advancePaid,
      amountDueAtVenue,
      totalPrice
    } = req.body;

    // Basic validation
    if (!userId || !turfId || !startTime || !endTime || !sport || 
        !bookingDate || !selectedSlots || !totalPrice) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 1. Create booking
    const booking = await Booking.create({
      userId,
      turfId,
      startTime,
      endTime,
      sport,
      bookingDate,
      selectedSlots,
      advancePercentage,
      advancePaid,
      amountDueAtVenue,
      totalPrice,
      status: "Confirmed"
    });

    // 2. Fetch turf owner's details
    const turf = await Turf.findById(turfId).populate('userId');
    if (!turf || !turf.userId) {
      console.log(turf ? "⚠️ Turf has no owner" : "❌ Turf not found");
      return res.status(201).json(booking);
    }

    const owner = turf.userId;
    
    // 3. Send notification if token exists
    if (owner?.fcmToken) {
      console.log("📲 FCM Token Type:", typeof owner.fcmToken);
      
      try {
        await sendPushNotification({
          token: String(owner.fcmToken), // Ensure string conversion
          notification: {
            title: `New ${sport} Booking`,
            body: `${turf.name} booked for ${new Date(startTime).toLocaleString()}`
          },
          data: {
            booking_id: booking._id.toString(),
            turf_id: turfId,
            type: "new_booking"
          }
        });
        console.log("✅ Notification queued successfully");
      } catch (error) {
        console.error("❌ Notification failed:", {
          error: error.message,
          token: owner.fcmToken?.substring(0, 10)
        });
      }
    } else {
      console.log("⚠️ No FCM token for owner:", owner.email || owner._id);
    }

    return res.status(201).json(booking);
    
  } catch (err) {
    console.error("Create booking error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// ========== USER SIDE: fetch bookings for a specific user ==========
exports.getUserBookings = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find all bookings for this user, and populate turf info
    const bookings = await Booking
      .find({ userId })
      .populate("turfId", "turfName fullAddress image surfaceType amenities")     // only need turfName field
      .sort({ startTime: 1 });

    return res.status(200).json(bookings);
  } catch (err) {
    console.error("Fetch user bookings error:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};


// ========== ADMIN SIDE: fetch all bookings ==========
exports.getAllBookings = async (req,res)=>{
  try{
    const bookings = await Booking
      .find()
      .populate("userId",  "name email")   // सिर्फ name, email लेंगे
      .populate("turfId",  "turfName");    // turfName field चाहिए

    res.status(200).json(bookings);
  }catch(err){
    console.error("Fetch bookings error:",err);
    res.status(500).json({ message:"Server Error" });
  }
};

//User side Cancle booking button API 
// ========== USER SIDE: cancel a booking ==========
exports.cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status: 'Cancelled' },
      { new: true }
    );
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    return res.status(200).json({
  success: true,
  message: 'Booking cancelled successfully',
  booking
});
  } catch (err) {
    console.error("Cancel booking error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

//User side Rechudle booking button 
exports.rescheduleBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { newStartTime, newEndTime } = req.body;

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        startTime: newStartTime,
        endTime: newEndTime,
        status: 'Rescheduled'
      },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Booking rescheduled successfully',
      booking
    });
  } catch (err) {
    console.error("Reschedule booking error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};


