const Renting = require("../models/renting");
const Car = require("../models/car");

// Create a new renting
exports.createRenting = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      address,
      phone,
      age,
      car,
      startDate,
      endDate,
      totalPrice,
    } = req.body;

    const newRenting = new Renting({
      firstName,
      lastName,
      email,
      address,
      phone,
      age,
      car,
      startDate,
      endDate,
      totalPrice,
    });

    await newRenting.save();
    res.status(201).json(newRenting);
  } catch (error) {
    res.status(500).json({ message: "Error creating renting", error });
  }
};

// Get all rentings
exports.getAllRentings = async (req, res) => {
  try {
    const rentings = await Renting.find().populate("car");
    res.status(200).json(rentings);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving rentings", error });
  }
};

// Get available cars by date
exports.getAvailableCars = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const rentings = await Renting.find({
      $or: [{ startDate: { $lte: endDate }, endDate: { $gte: startDate } }],
    }).populate("car");

    const rentedCarIds = rentings.map((renting) => renting.car._id);

    const availableCars = await Car.find({
      _id: { $nin: rentedCarIds },
    });

    res.status(200).json(availableCars);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving available cars", error });
  }
};
