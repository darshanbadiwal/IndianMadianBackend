const express = require("express");
const authMiddleware = require("../Middleware/authMiddleware");
const turfController = require("../controller/turf.controller");
const { getTotalSummaryByTurf } = require("../controller/dashboard.controller");

const router = express.Router();

router.post("/register", authMiddleware, turfController.registerTurf);
router.get("/my-turfs", authMiddleware, turfController.getMyTurfs);
router.get('/pending', turfController.getPendingTurfs);
router.post('/:id/approve', turfController.approveTurf);
router.post('/:id/reject', turfController.rejectTurf);
router.post('/byId', turfController.getTurfById);

router.post("/turfByCity", turfController.getTurfsByCity);

router.put('/:id/edit', authMiddleware, turfController.editTurf);

router.get("/total-summary/:turfId", getTotalSummaryByTurf);




module.exports = router;