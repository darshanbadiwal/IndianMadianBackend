const express = require("express");
const router  = express.Router();
const bookingCtrl = require("../controller/booking.controller");

// USER creates booking
router.post("/create", bookingCtrl.createBooking);


module.exports = router;
