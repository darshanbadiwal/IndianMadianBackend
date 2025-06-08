const User = require("../models/userAuth.model");
// const Owner = require("../models/ownerAuth")

// Save a new user
async function saveUser(userData) {
  try {
    const newUser = new User(userData);
    return await newUser.save();
  } catch (error) {
    throw new Error(error.message);
  }
}

// Find a user by email
async function findUserByEmail(email) {
  try {
    return await User.findOne({ email }).maxTimeMS(30000) // Increase timeout to 30 seconds
    .exec();
  } catch (error) {
    throw new Error(error.message);
  }
}

// async function saveOwner(userData) {
//   try {
//     const newUser = new Owner(userData);
//     return await newUser.save();
//   } catch (error) {
//     throw new Error(error.message);
//   }
// }

// // Find a user by email
// async function findOwnerByEmail(email) {
//   try {
//     return await Owner.findOne({ email });
//   } catch (error) {
//     throw new Error(error.message);
//   }
// }

module.exports = {
  saveUser,
  findUserByEmail,
//   saveOwner,
//   findOwnerByEmail
};