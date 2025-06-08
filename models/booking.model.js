const mongoose = require("mongoose");
const Schema   = mongoose.Schema;

const bookingSchema = new Schema(
  {
    userId:  { type: Schema.Types.ObjectId, ref: "User",  required: true },
    turfId:  { type: Schema.Types.ObjectId, ref: "Turf",  required: true },
    // slot timing
    startTime: { type: Date, required: true },
    endTime:   { type: Date, required: true },
    // price & status
    totalPrice: { type: Number, required: true },
    status:     { type: String, enum: ["Pending","Confirmed","Cancelled"], default: "Pending" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
