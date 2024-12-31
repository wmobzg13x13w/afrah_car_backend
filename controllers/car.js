const Car = require("../models/car");

const upload = require("../middleware/fileUpload");

exports.createCar = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err });
    }
    try {
      const {
        title,
        description,
        carType,
        capacity,
        steering,
        engineType,
        price,
        equipments,
        gear,
        fuel,
        doors,
        seats,
        mileage,
      } = req.body;

      const images = req.files.map((file) => file.originalname);

      const newCar = new Car({
        images,
        title,
        description,
        carType,
        capacity,
        steering,
        engineType,
        price,
        equipments: equipments ? equipments.split(",") : [],
        gear,
        fuel,
        doors,
        seats,
        mileage,
      });

      await newCar.save();
      res.status(201).json(newCar);
    } catch (error) {
      res.status(500).json({ message: "Error creating car", error });
    }
  });
};

exports.getCars = async (req, res) => {
  try {
    const { seats, carType, steering } = req.query;

    const filter = {};
    if (seats) filter.seats = seats;
    if (carType) filter.carType = carType;
    if (steering) filter.steering = steering;

    const cars = await Car.find(filter);
    res.status(200).json(cars);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving cars", error });
  }
};

exports.getCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }
    res.status(200).json(car);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving car", error });
  }
};

exports.update = async (req, res) => {
  try {
    const updatedCar = await Car.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedCar) {
      return res.status(404).json({ message: "Car not found" });
    }

    res.status(200).json(updatedCar);
  } catch (error) {
    console.error("Error updating car:", error);
    res.status(500).json({ message: "Error updating car", error });
  }
};

exports.deleteCar = async (req, res) => {
  try {
    const deletedCar = await Car.findByIdAndDelete(req.params.id);

    if (!deletedCar) {
      return res.status(404).json({ message: "Car not found" });
    }

    res.status(200).json({ message: "Car deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting car", error });
  }
};
