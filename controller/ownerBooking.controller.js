const bookingService = require("../services/booking.service");

// GET /api/owner/bookings
exports.ownerBookings = async (req, res) => {
  try {
    const ownerId = req.ownerId;             // auth-middleware से आयेगा
    const bookings = await bookingService.getBookingsForOwner(ownerId);
    res.status(200).json({ success: true, data: bookings });
  } catch (err) {
    console.error("Owner bookings error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};
