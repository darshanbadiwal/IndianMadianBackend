const turfOwnerService = require('../services/turfOwner.service');

const registerTurfOwner = async (req, res) => {
  try {
    const turfOwner = await turfOwnerService.registerTurfOwner(req.body);
    res.status(201).json(turfOwner);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const loginTurfOwner = async (req, res) => {
  try {
    const { email, password } = req.body;
    const token = await turfOwnerService.loginTurfOwner(email, password);
    res.status(200).json({ token });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

module.exports = {
  registerTurfOwner,
  loginTurfOwner
};