const express = require("express");
const router  = express.Router();
const ctrl    = require("../controller/ownerBooking.controller");
const authMiddleware    = require("../middleware/authMiddleware");   // JWT verify

router.get("/bookings", authMiddleware, ctrl.ownerBookings);

module.exports = router;
