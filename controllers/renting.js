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
      city,
      car,
      category,
      startDate,
      endDate,
      totalPrice,
      pickupLocation,
      dropoffLocation,
    } = req.body;

    const newRenting = new Renting({
      firstName,
      lastName,
      email,
      address,
      phone,
      age,
      city,
      car,
      category,
      startDate,
      endDate,
      totalPrice,
      pickupLocation,
      dropoffLocation,
    });

    await newRenting.save();
    res.status(201).json(newRenting);
  } catch (error) {
    res.status(500).json({ message: "Error creating renting", error });
  }
};

// Get all rentings
exports.getAllRentings = async (req, res) => {
  const { category } = req.params;
  try {
    const rentings = await Renting.find({ category }).populate("car");
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
      available: true,
      category: req.params.category,
    });

    res.status(200).json(availableCars);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving available cars", error });
  }
};

exports.getUnavailableDates = async (req, res) => {
  try {
    const { carid } = req.params;

    const rentings = await Renting.find({ car: carid });

    const unavailableDates = rentings.flatMap((renting) => {
      const dates = [];
      let currentDate = new Date(renting.startDate);
      while (currentDate <= renting.endDate) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      return dates;
    });

    res.status(200).json(unavailableDates);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving unavailable dates", error });
  }
};
