const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema(
  {
    userId:  { type: Schema.Types.ObjectId, ref: "User", required: true },
    turfId:  { type: Schema.Types.ObjectId, ref: "Turf", required: true },

    // Slot timing
    startTime: { type: Date, required: true },
    endTime:   { type: Date, required: true },

    // Sport selected
    sport: { type: String, required: true },

    // Booking date (for filtering/grouping)
    bookingDate: { type: Date, required: true },

    // Time slots selected (e.g., 4–5 PM, 5–6 PM)
    selectedSlots: [
      {
        start: String,
        end: String,
        rawStart: Date,
        rawEnd: Date
      }
    ],

    // Advance payment tracking
    advancePercentage: { type: Number },
    advancePaid: { type: Number },
    amountDueAtVenue: { type: Number },

    // Total amount for the booking
    totalPrice: { type: Number, required: true },

    

    // Booking status
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Cancelled"],
      default: "Pending"
    }
  },
  { timestamps: true }
);
bookingSchema.index(
  { turfId: 1, bookingDate: 1, "selectedSlots.start": 1, "selectedSlots.end": 1 },
  { unique: true, partialFilterExpression: { status: { $ne: "Cancelled" } } }
);

module.exports = mongoose.model("Booking", bookingSchema);