const express = require("express");
const router = express.Router();
const userAuthController = require("../controller/userAuth.controller");
const { forgotPassword, resetPassword } = require("../controller/userAuth.controller");

// 📌 USER ROUTES (for booking website users)
router.post("/register", userAuthController.register);
router.post("/login", userAuthController.login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);


// 🔒 (Optional) Future security: add token middleware here

module.exports = router;
