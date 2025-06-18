// MONGO DB Configuration
const mongoose = require("mongoose");

const URL_VALUE = process.env.MONGO_URI;

//Connecting to DB.....
mongoose
  .connect(URL_VALUE) // Now using a defined string variable
  .then(() => console.log("Mongo DB Connected"))
  .catch((err) => console.log("MongoDB Connection Error:", err.message));