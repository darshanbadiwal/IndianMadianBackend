const express = require('express');
const router = express.Router();
const adminController = require('../controller/admin.controller');
const userAuthController = require('../controller/userAuth.controller');
const bookingCtrl = require("../controller/booking.controller");
const turfController = require("../controller/turf.controller");

// ✅ NEW: ADMIN PANEL — Get all registered users
router.post("/getAllUsers", userAuthController.getAllUsers);
// Admin registration (optional, for initial setup)
router.post('/register', adminController.register);
    
// Admin login
router.post('/login', adminController.login);


// ADMIN fetches all bookings
router.get("/booking/all", bookingCtrl.getAllBookings);

router.get("/allTurf", turfController.getAllTurfs);


router.get("/dashboard", adminController.getDashboardStats);

module.exports = router;