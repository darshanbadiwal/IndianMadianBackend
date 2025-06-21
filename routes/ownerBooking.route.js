const express = require("express");
const router  = express.Router();
const ctrl    = require("../controller/ownerBooking.controller");
const authMiddleware    = require("../Middleware/authMiddleware");   // JWT verify

router.post("/bookings", ctrl.createOwnerBooking);
router.get('/turf/:turfId', authMiddleware, ctrl.getBookingsByTurfId);

module.exports = router;
