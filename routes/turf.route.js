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


//this function will help turf owner to on and off their turf for some times etc..
router.patch("/availability/:turfId", authMiddleware, turfController.updateTurfAvailability);

//it will help to get all turf city list to main booking webiste city page filter dropdown
router.get('/approved-cities', turfController.getApprovedCities);



module.exports = router;