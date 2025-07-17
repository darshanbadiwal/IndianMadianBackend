const express = require("express");
const router  = express.Router();
const bookingCtrl = require("../controller/booking.controller");


// USER creates booking
router.post("/create", bookingCtrl.createBooking);

// Cancel a booking
router.patch("/:bookingId/cancel", bookingCtrl.cancelBooking);

// Reschedule a booking
router.patch('/:bookingId/reschedule', bookingCtrl.rescheduleBooking);


// ✅ This should always come last
router.get("/:userId", bookingCtrl.getUserBookings);



module.exports = router;
