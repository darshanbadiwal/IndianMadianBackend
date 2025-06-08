const Booking = require("../models/booking.model");

// ========== USER SIDE: create booking ==========
exports.createBooking = async (req,res)=>{
  try{
    const { userId, turfId, startTime, endTime, totalPrice } = req.body;

    // basic validation
    if(!userId || !turfId || !startTime || !endTime || !totalPrice){
      return res.status(400).json({ message:"Missing fields" });
    }

    const booking = await Booking.create({
      userId,
      turfId,
      startTime,
      endTime,
      totalPrice,
      status: "Confirmed"        // अभी सीधे Confirm कर रहे हैं
    });

    return res.status(201).json(booking);
  }catch(err){
    console.error("Create booking error:",err);
    res.status(500).json({ message:"Server Error" });
  }
};

// ========== ADMIN SIDE: fetch all bookings ==========
exports.getAllBookings = async (req,res)=>{
  try{
    const bookings = await Booking
      .find()
      .populate("userId",  "name email")   // सिर्फ name, email लेंगे
      .populate("turfId",  "turfName");    // turfName field चाहिए

    res.status(200).json(bookings);
  }catch(err){
    console.error("Fetch bookings error:",err);
    res.status(500).json({ message:"Server Error" });
  }
};
