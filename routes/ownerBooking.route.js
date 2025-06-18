const express = require("express");
const router  = express.Router();
const ctrl    = require("../controller/ownerBooking.controller");
const auth    = require("../middleware/authMiddleware");   // JWT verify

router.get("/bookings", auth, ctrl.ownerBookings);
router.get('/turf/:turfId', auth, ctrl.getBookingsByTurfId);

module.exports = router;
