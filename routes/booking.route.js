const express = require("express");
const router  = express.Router();
const bookingCtrl = require("../controller/booking.controller");


// USER creates booking
router.post("/create", bookingCtrl.createBooking);

// Fetch bookings for a user
router.get("/:userId", bookingCtrl.getUserBookings);

// Cancel a booking
// PATCH /api/bookings/:bookingId/cancel
router.patch("/:bookingId/cancel", bookingCtrl.cancelBooking);

// Reschedule a booking.
// PATCH /api/bookings/:bookingId/reschedule/
router.patch('/:bookingId/reschedule', bookingCtrl.rescheduleBooking);
//this will help user to to alredy book slot 
router.get("/booked-slots", bookingCtrl.getBookedSlots);


module.exports = router;
