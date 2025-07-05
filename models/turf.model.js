const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TurfSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TurfOwner",
      required: true,
    },
    email: { 
      type: String, 
      required: true, 
      trim: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"]
    },
    pincode: { 
      type: String, 
      required: true, 
      trim: true,
      match: [/^\d{6}$/, "Pincode must be 6 digits"]
    },
    turfName: { 
      type: String, 
      required: true, 
      trim: true,
      minlength: [3, "Turf name must be at least 3 characters"]
    },
    fullAddress: { 
      type: String, 
      required: true, 
      trim: true,
      minlength: [10, "Address must be at least 10 characters"]
    },
    location: {
      state: { 
        type: String, 
        required: true, 
        trim: true 
      },
      city: { 
        type: String, 
        required: true, 
        trim: true 
      },
      lat: { 
        type: Number, 
        required: true,
        min: -90,
        max: 90
      },
      lng: { 
        type: Number, 
        required: true,
        min: -180,
        max: 180
      }
    },
    contactNumber: {
      type: String,
      required: true,
      match: [/^\d{10}$/, "Phone number must be exactly 10 digits"],
    },
    turfSize: { 
      type: String, 
      required: true, 
      trim: true 
    },
    surfaceType: { 
      type: String, 
      required: true, 
      trim: true,
      enum: {
        values: ["Grass", "Artificial Turf", "Clay", "Concrete", "Matting", "Wooden", "Other"],
        message: "{VALUE} is not a valid surface type"
      }
    },
    availableSports: {
      type: [String],
      required: true,
      validate: {
        validator: function(arr) {
          return arr.length > 0;
        },
        message: "At least one sport must be selected"
      },
      enum: {
        values: ["Football", "Cricket", "Tennis", "Basketball", "Volleyball", "Badminton", "Hockey", "Other"],
        message: "{VALUE} is not a valid sport"
      }
    },
    amenities: {
      type: [String],
      required: true,
      enum: {
        values: ["Changing Rooms", "Parking", "Refreshments", "Equipment Rental", "Washrooms", "Seating Area", "WiFi"],
        message: "{VALUE} is not a valid amenity"
      }
    },
    weekdayHours: {
      openingTime: { 
        type: String, 
        required: true,
        match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Time must be in HH:mm format (00:00 to 23:59)"],
        validate: {
          validator: function(value) {
            if (!this.weekdayHours.closingTime) return true;
            return value < this.weekdayHours.closingTime;
          },
          message: "Opening time must be before closing time"
        }
      },
      closingTime: { 
        type: String, 
        required: true,
        match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Time must be in HH:mm format (00:00 to 23:59)"]
      }
    },
    weekendHours: {
      openingTime: { 
        type: String, 
        required: true,
        match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Time must be in HH:mm format (00:00 to 23:59)"],
        validate: {
          validator: function(value) {
            if (!this.weekendHours.closingTime) return true;
            return value < this.weekendHours.closingTime;
          },
          message: "Opening time must be before closing time"
        }
      },
      closingTime: { 
        type: String, 
        required: true,
        match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Time must be in HH:mm format (00:00 to 23:59)"]
      }
    },
    advancePayment: {
      type: Number,
      required: true,
      min: [10, "Advance payment must be at least 10%"],
      max: [90, "Advance payment cannot exceed 90%"],
      default: 30
    },
    weekdayRate: { 
      type: Number, 
      required: true, 
      min: [0, "Price cannot be negative"] 
    },
    weekendRate: { 
      type: Number, 
      required: true, 
      min: [0, "Price cannot be negative"] 
    },
    facilityImages: {
      type: [String],
      required: true,
      validate: {
        validator: function(arr) {
          return arr.length >= 3 && arr.length <= 10;
        },
        message: "You must upload between 3 to 10 images"
      }
    },
    ownerNote: {
      type: String,
      trim: true,
      maxlength: [250, "Note cannot exceed 250 characters"]
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    status: { 
      type: String, 
      enum: {
        values: ['pending', 'approved', 'rejected'],
        message: "{VALUE} is not a valid status"
      }, 
      default: 'pending' 
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Add index for better query performance
TurfSchema.index({ 
  'location.state': 1,
  'location.city': 1,
  isAvailable: 1,
  status: 1
});

module.exports = mongoose.model("Turf", TurfSchema);