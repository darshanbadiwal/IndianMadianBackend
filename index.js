  const express = require("express");
  const cors = require("cors");
  const app = express();
  const serverless = require("serverless-http");
  require("dotenv").config();
  require("./configs/mongodb"); // connecting mongodb here

  // 📌 Routes
  const adminRoutes = require('./routes/admin.route');
  const userRoutes = require("./routes/userAuth.route"); // ✅ add this line
  const bookingRoutes = require("./routes/booking.route");
  const ownerBookingRoutes = require("./routes/ownerBooking.route");

  // 📌 Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors({ origin: "*" }));

  // 📌 Routes use
  app.use('/api/admin',  require("./routes/admin.route"));
  app.use("/api/user/auth", require("./routes/userAuth.route")); // login/register
  app.use("/api/turf", require("./routes/turf.route")); 
  app.use("/api/turfOwner", require("./routes/turfOwner.route"));
  app.use("/api/booking", bookingRoutes);
  app.use("/api/owner", ownerBookingRoutes);


  const port = process.env.PORT || 5000;
  app.listen(port, () =>  
    console.log(`Server running at http://localhost:${port}...`)
  );

  // module.exports.handler = serverless(app);
