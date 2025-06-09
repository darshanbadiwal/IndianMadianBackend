const Booking = require("../models/booking.model");
const Turf    = require("../models/turf.model");

// सभी टर्फ IDs निकालो जो इस owner के हैं, फिर उनके bookings लाओ
const getBookingsForOwner = async (ownerId) => {
  // 1. owner के सारे टर्फ
  const turfs = await Turf.find({ userId: ownerId }).select("_id");
  const turfIds = turfs.map(t => t._id);

  // 2. उन टर्फ्स पर हुई सभी bookings
  return await Booking.find({ turfId: { $in: turfIds } })
    .populate("userId", "name email")
    .populate("turfId", "turfName")
    .sort({ createdAt: -1 });
};

module.exports = { getBookingsForOwner };
