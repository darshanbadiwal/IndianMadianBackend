// MONGO DB Configuration
const mongoose = require("mongoose");

const URL_VALUE = process.env.MONGO_URI;

//Connecting to DB.....
mongoose
  .connect(URL_VALUE)
  .then(() => console.log("Mongo DB Connected"))
  .catch((err) => console.log(err.message));