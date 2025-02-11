const Car = require("../models/car");
const Renting = require("../models/renting");

const upload = require("../middleware/fileUpload");

exports.createCar = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err });
    }
    try {
      const {
        title,
        matricule,
        description,
        category,
        carType,
        price,
        gear,
        fuel,
        doors,
        seats,
        garantie,
        isNewCar,
        airConditionner,
      } = req.body;

      const images = req.files.map((file) => file.originalname);

      const newCar = new Car({
        title,
        matricule,
        description,
        category,
        carType,
        price,
        gear,
        fuel,
        doors,
        seats,
        garantie,
        isNewCar,
        airConditionner,
        images,
      });

      await newCar.save();
      res.status(201).json(newCar);
    } catch (error) {
      res.status(500).json({ message: "Error creating car", error });
    }
  });
};

exports.getCarsByCategory = async (req, res) => {
  const { category } = req.params;
  try {
    const cars = await Car.find({ category });
    if (!cars) {
      return res.status(404).json({ message: "No cars not found" });
    }
    res.status(200).json(cars);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving car", error });
  }
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
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err });
    }
    try {
      const {
        title,
        matricule,
        description,
        category,
        carType,
        price,
        gear,
        fuel,
        doors,
        seats,
        garantie,
        isNewCar,
        airConditionner,
      } = req.body;

      const updatedFields = {
        title,
        matricule,
        description,
        category,
        carType,
        price,
        gear,
        fuel,
        doors,
        seats,
        garantie,
        isNewCar,
        airConditionner,
      };

      if (req.files && req.files.length > 0) {
        updatedFields.images = req.files.map((file) => file.originalname);
      }

      const updatedCar = await Car.findByIdAndUpdate(
        req.params.id,
        updatedFields,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!updatedCar) {
        return res.status(404).json({ message: "Car not found" });
      }

      res.status(200).json(updatedCar);
    } catch (error) {
      console.error("Error updating car:", error);
      res.status(500).json({ message: "Error updating car", error });
    }
  });
};

exports.deleteCar = async (req, res) => {
  try {
    const deletedCar = await Car.findByIdAndDelete(req.params.id);

    if (!deletedCar) {
      return res.status(404).json({ message: "Car not found" });
    }

    await Renting.deleteMany({ car: req.params.id });

    res
      .status(200)
      .json({ message: "Car and related rentings deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting car", error });
  }
};
exports.updateCarStatus = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    car.available = !car.available;
    await car.save();
    res.status(200).json(car);
  } catch (error) {
    res.status(500).json({ message: "Error updating car status", error });
  }
};

exports.getCarsCollection = async (req, res) => {
  try {
    const suvCars = await Car.find({ carType: "SUV" }).limit(2);
    const berlineCars = await Car.find({ carType: "Berline" }).limit(2);
    const pickupCars = await Car.find({ carType: "Pickup" }).limit(2);

    const cars = [...suvCars, ...berlineCars, ...pickupCars];

    res.status(200).json(cars);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving cars by type", error });
  }
};

exports.addRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, rating, comment } = req.body;

    const car = await Car.findById(id);
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    await car.addRating(fullName, rating, comment);

    res.status(200).json(car);
  } catch (error) {
    res.status(500).json({ message: "Error adding rating", error });
  }
};
