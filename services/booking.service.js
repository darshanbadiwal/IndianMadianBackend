const getBookingsForOwner = async (ownerId) => {
  const turfs = await Turf.find({ userId: ownerId }).select("_id");
  const turfIds = turfs.map(t => t._id);

  const bookings = await Booking.find({ turfId: { $in: turfIds } })
    .populate("userId", "name") // ✅ Only name
    .populate("turfId", "turfName")
    .sort({ createdAt: -1 });

  // ✅ Return cleaned data
  return bookings.map(b => ({
    id: b._id,
    sport: b.sport,
    bookingDate: b.bookingDate,
    startTime: b.startTime,
    endTime: b.endTime,
    selectedSlots: b.selectedSlots,
    totalPrice: b.totalPrice,
    advancePaid: b.advancePaid,
    amountDueAtVenue: b.amountDueAtVenue,
    advancePercentage: b.advancePercentage,
    status: b.status,
    createdAt: b.createdAt,
    user: {
      name: b.userId?.name || 'N/A',
      // ❌ Removed email & phoneNumber
    },
    turfName: b.turfId?.turfName || ''
  }));
};
