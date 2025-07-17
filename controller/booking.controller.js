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

        // Conflict check: is any selected slot already booked?
    const existingBookings = await Booking.find({
      turfId,
      bookingDate,
      selectedSlots: { $in: selectedSlots },
      status: { $ne: "Cancelled" } // ignore cancelled bookings
    });

    if (existingBookings.length > 0) {
      return res.status(400).json({
        message: "One or more of your selected time slots are already booked. Please choose different time."
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
    const { newSlots } = req.body; // This should be an array of slots like the original

    // 1. Find the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // 2. Check if reschedule is allowed
    if (!booking.canReschedule) {
      return res.status(400).json({ 
        success: false, 
        message: "This booking cannot be rescheduled again" 
      });
    }

    // 3. Validate the new slots
    if (!newSlots || !Array.isArray(newSlots)) {  // FIXED: Added missing parenthesis
      return res.status(400).json({
        success: false,
        message: "Invalid slot data provided"
      });
    }

    // 4. Must keep same number of slots
    if (newSlots.length !== booking.selectedSlots.length) {
      return res.status(400).json({
        success: false,
        message: `You must select exactly ${booking.selectedSlots.length} slot(s)`
      });
    }

    // 5. Validate all new slots are for the same original date
    const originalDate = new Date(booking.bookingDate).toDateString();
    const newDate = new Date(newSlots[0].rawStart).toDateString();
    
    if (originalDate !== newDate) {
      return res.status(400).json({
        success: false,
        message: "You can only reschedule to different time slots on the same date"
      });
    }

    // 6. Prepare the update
    const updateData = {
      startTime: new Date(newSlots[0].rawStart),
      endTime: new Date(newSlots[newSlots.length - 1].rawEnd),
      selectedSlots: newSlots,
      canReschedule: false, // Disable future reschedules
      rescheduleInfo: {
        hasRescheduled: true,
        rescheduledAt: new Date(),
        oldDate: booking.bookingDate,
        oldSlots: booking.selectedSlots
      }
    };

    // 7. Update the booking
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      updateData,
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Booking rescheduled successfully",
      booking: updatedBooking
    });

  } catch (err) {
    console.error("Reschedule booking error:", err);
    return res.status(500).json({ 
      success: false, 
      message: "Server error during rescheduling" 
    });
  }
};


// ========== API: Get already booked slots for a turf on a given date ==========
exports.getBookedSlots = async (req, res) => {
  try {
    const { turfId, bookingDate } = req.query;

    if (!turfId || !bookingDate) {
      return res.status(400).json({ message: "Missing turfId or bookingDate" });
    }

    const bookings = await Booking.find({
      turfId,
      bookingDate,
      status: { $ne: "Cancelled" }
    });

    // Flatten all booked slots
    const bookedSlots = bookings.map(b => b.selectedSlots).flat();

    return res.status(200).json({ bookedSlots });
  } catch (err) {
    console.error("Error fetching booked slots:", err);
    res.status(500).json({ message: "Server Error" });
  }
};
