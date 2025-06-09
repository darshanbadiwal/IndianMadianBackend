const express = require("express");
const authMiddleware = require("../Middleware/authMiddleware");
const turfController = require("../controller/turf.controller");

const router = express.Router();

router.post("/register", authMiddleware, turfController.registerTurf);
router.get("/my-turfs", authMiddleware, turfController.getMyTurfs);
router.get("/allTurf", turfController.getAllTurfs);
router.get('/pending', turfController.getPendingTurfs);
router.post('/:id/approve', turfController.approveTurf);
router.post('/:id/reject', turfController.rejectTurf);
router.post('/byId', turfController.getTurfById);
module.exports = router;