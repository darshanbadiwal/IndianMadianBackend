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
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"], // Email validation regex
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
      match: [/^\d{10}$/, "Phone number must be exactly 10 digits"], // Ensures exactly 10 digits
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
      type: [String], // Multi-select checkboxes (Array of Strings)
      default: [],
      enum: ["Football", "Basketball", "Cricket", "Tennis", "Hockey", "Badminton"], // Allowed values
    },
  },
  {
    timestamps: true, // Automatically adds createdAt & updatedAt fields
  }
);

const User = mongoose.model("User", userSchema);
module.exports = User
