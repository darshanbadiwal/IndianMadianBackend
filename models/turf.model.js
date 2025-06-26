const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const TurfSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TurfOwner", // Changed from "Owner" to "TurfOwner"
      required: true,
    },
    email:{type: String, required: true, trim: true},
    pincode: { type: String, required: true, trim: true },
    turfName: { type: String, required: true, trim: true },
    fullAddress: { type: String, required: true, trim: true },
    locationPin: { type: String },
    location: {
      state: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
    },
    contactNumber: {
      type: String,
      required: true,
      match: [/^\d{10}$/, "Phone number must be exactly 10 digits"],
    },
    turfSize: { type: String, required: true, trim: true },
    surfaceType: { type: String, required: true, trim: true },
    availableSports: {
      type: [String],
      enum: ["Football", "Cricket", "Tennis", "Basketball", "Volleyball", "Badminton", "Hockey"],
      required: true,
    },
    // indoorFacility: { type: Boolean, required: true },
    amenities: {
      type: [String],
      enum: ["Changing Rooms", "Parking", "Refreshments", "Equipment Rental", "Washrooms", "Seating Area", "WiFi"],
      required: true,
    },
    weekdayHours: {
      openingTime: { type: String, required: true },
      closingTime: { type: String, required: true },
    },
    weekendHours: {
      openingTime: { type: String, required: true },
      closingTime: { type: String, required: true },
    },
    payementMode: { type: String,},
    advancePayment: {
  type: Number,
  min: 10,
  max: 90,
  default: 30, // You can adjust this default as needed
},
    hourlyRate: { type: Number, required: true, min: 0 },
    //cancellationPolicy: { type: String, required: true },
    facilityImages: {
      type: [String], // Array of image URLs
      validate: {
        validator: function (arr) {
          return arr.length <= 10; // Max 10 images
        },
        message: "You can upload a maximum of 10 images",
      },
    },
   // isApproved: { type: Boolean, default: false }, // New field added//
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Turf", TurfSchema);