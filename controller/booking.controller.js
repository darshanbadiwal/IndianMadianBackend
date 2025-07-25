 const Booking = require("../models/booking.model");

// ========== USER SIDE: create booking ==========
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
    if (
      !userId || !turfId || !startTime || !endTime || !sport ||
      !bookingDate || !selectedSlots || !totalPrice
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }


    // Check for conflicting bookings
    const conflictingBookings = await Booking.find({
      turfId,
      bookingDate: new Date(bookingDate),
      status: { $ne: "Cancelled" },
      $or: selectedSlots.map(slot => ({
        "selectedSlots.start": slot.start,
        "selectedSlots.end": slot.end
      }))
    });

    if (conflictingBookings.length > 0) {
      return res.status(400).json({ 
        message: "Some selected slots are already booked",
        conflictingSlots: conflictingBookings.flatMap(b => b.selectedSlots)
      });
    }

    // Create and save booking
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
      status: "Confirmed" // or "Pending" if payment isn't fully made
    });

    return res.status(201).json(booking);
  } catch (err) {
    // Handle duplicate key error (MongoDB unique index)
    if (err.code === 11000) {
      return res.status(400).json({ 
        message: "Some slots were just booked by someone else. Please try different slots."
      });
    }
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
// USER side: Reschedule Booking Controller
exports.rescheduleBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const {
      newStartTime,
      newEndTime,
      selectedSlots,
      bookingDate
    } = req.body;

    // 🔐 Validation
    if (!newStartTime || !newEndTime || !selectedSlots || !bookingDate) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // ❌ Don’t allow rescheduling if already rescheduled
    if (booking.rescheduleInfo?.hasRescheduled) {
      return res.status(400).json({ success: false, message: "You can reschedule only once" });
    }

    // ❌ Don’t allow reschedule for cancelled or past bookings
    if (booking.status === "Cancelled" || new Date(booking.startTime) < new Date()) {
      return res.status(400).json({ success: false, message: "Cannot reschedule this booking" });
    }

    // ✅ Save old data in rescheduleInfo
    booking.rescheduleInfo = {
      hasRescheduled: true,
      rescheduledAt: new Date(),
      oldDate: booking.startTime,
      oldSlots: booking.selectedSlots
    };

    // ✅ Update new details
    booking.startTime = newStartTime;
    booking.endTime = newEndTime;
    booking.bookingDate = bookingDate;
    booking.selectedSlots = selectedSlots;

    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Booking rescheduled successfully",
      booking
    });

  } catch (err) {
    console.error("Reschedule booking error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Add this to your booking.controller.js
exports.checkAvailability = async (req, res) => {
  try {
    const { turfId } = req.params;
    const { date } = req.query; // Expecting date in YYYY-MM-DD format
    
    if (!turfId || !date) {
      return res.status(400).json({ message: "Turf ID and date are required" });
    }

    const bookings = await Booking.find({
      turfId,
      bookingDate: new Date(date),
      status: { $ne: "Cancelled" } // Don't include cancelled bookings
    });

    // Extract all booked slots
    const bookedSlots = bookings.flatMap(booking => 
      booking.selectedSlots.map(slot => ({
        start: slot.start,
        end: slot.end
      }))
    );

    return res.status(200).json({ bookedSlots });
  } catch (err) {
    console.error("Check availability error:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};
