const Booking = require("../models/booking.model");

exports.getTotalSummaryByTurf = async (req, res) => {
  try {
    const turfId = req.params.turfId;

    const bookings = await Booking.find({
      turfId: turfId,
      status: { $ne: "Cancelled" }
    });

    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);

    res.status(200).json({ totalBookings, totalRevenue });
  } catch (err) {
    console.error("Turf Total Summary Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};