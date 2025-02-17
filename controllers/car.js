const Car = require("../models/car");
const Renting = require("../models/renting");

const upload = require("../middleware/fileUpload");

exports.createCar = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err });
    }
    try {
      let matricules;
      try {
        matricules = JSON.parse(req.body.matricules);
      } catch (parseError) {
        return res.status(400).json({ message: "Invalid matricules format" });
      }

      const {
        title,
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

      // Validate matricules array structure
      if (!Array.isArray(matricules)) {
        return res.status(400).json({ message: "Invalid matricules format" });
      }

      const isValidMatricules = matricules.every(
        (m) => m.value && typeof m.available !== "undefined"
      );

      if (!isValidMatricules) {
        return res.status(400).json({
          message:
            "Invalid matricule structure. Each must have value and available status",
        });
      }

      const images = req.files.map((file) => file.originalname);

      const newCar = new Car({
        title,
        matricules, // Store array of matricules
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
      console.error("Error creating car:", error);
      res.status(500).json({
        message: "Error creating car",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
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
        matricules, // Changed from matricule to matricules
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

      // Handle matricules update if provided
      if (matricules) {
        try {
          const parsedMatricules = JSON.parse(matricules);

          // Validate matricules structure
          const isValid =
            Array.isArray(parsedMatricules) &&
            parsedMatricules.every(
              (m) => m.value && typeof m.available !== "undefined"
            );

          if (!isValid) {
            return res.status(400).json({
              message:
                "Invalid matricules format. Expected array of { value: string, available: boolean }",
            });
          }

          updatedFields.matricules = parsedMatricules;
        } catch (e) {
          return res.status(400).json({
            message: "Invalid matricules format. Must be a valid JSON array",
          });
        }
      }

      // Handle images update
      if (req.files?.length > 0) {
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
      res.status(500).json({
        message: "Error updating car",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
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
