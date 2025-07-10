const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      match: [/^\d{10}$/, "Phone number must be exactly 10 digits"],
    },
    location: {
      city: {
        type: String,
        required: true,
        trim: true,
      },
      state: {
        type: String,
        required: true,
        trim: true,
      },
    },
    sportsPreferences: {
      type: [String],
      default: [],
      enum: [
    "Football",
    "Basketball",
    "Cricket",
    "Tennis",
    "Hockey",
    "Badminton",
    "Volleyball",
    "Table Tennis",
    "Kabaddi",
    "Kho Kho",
    "Baseball",
    "Rugby",
    "Handball",
    "Golf",
    "Boxing",
    "Athletics",
    "Swimming",
    "Skating",
    "Archery",
    "Shooting",
    "Chess",    
  ]
    },

   // ✅ Add these here inside the same object
    resetToken: {
      type: String,
    },
    resetTokenExpires: {
      type: Date,
    }
  },
  {
    timestamps: true, // ✅ This stays here
  }
);
const User = mongoose.model("User", userSchema);
module.exports = User;
