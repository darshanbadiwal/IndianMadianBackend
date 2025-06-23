const Booking = require("../models/booking.model");

// ========== USER SIDE: create booking ==========
exports.createBooking = async (req,res)=>{
  try{
    const { userId, turfId, startTime, endTime, totalPrice } = req.body;

    // basic validation
    if(!userId || !turfId || !startTime || !endTime || !totalPrice){
      return res.status(400).json({ message:"Missing fields" });
    }

    const booking = await Booking.create({
      userId,
      turfId,
      startTime,
      endTime,
      totalPrice,
      status: "Confirmed"        // अभी सीधे Confirm कर रहे हैं
    });

    return res.status(201).json(booking);
  }catch(err){
    console.error("Create booking error:",err);
    res.status(500).json({ message:"Server Error" });
  }
};

// ========== USER SIDE: fetch bookings for a specific user ==========
exports.getUserBookings = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find all bookings for this user, and populate turf info
    const bookings = await Booking
      .find({ userId })
      .populate("turfId", "turfName")      // only need turfName field
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


