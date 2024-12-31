const express = require("express");
const router = express.Router();
const {
  createCar,
  getCars,
  getCar,
  update,
  deleteCar,
} = require("../controllers/car");
const authenticateToken = require("../middleware/authenticateToken");

// Create a new car
router.post("/add", authenticateToken, createCar);

// Get all cars
router.get("/getcars", getCars);

// Get a single car by ID
router.get("/getcar/:id", getCar);

// Update a car by ID
router.patch("/edit/:id", authenticateToken, update);

// Delete a car by ID
router.delete("/delete/:id", authenticateToken, deleteCar);

module.exports = router;
