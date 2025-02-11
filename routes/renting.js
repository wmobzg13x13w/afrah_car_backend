const express = require("express");
const router = express.Router();
const {
  createRenting,
  getAllRentings,
  getAvailableCars,
  getUnavailableDates,
  getCarsByMonth,
} = require("../controllers/renting");
const authenticateToken = require("../middleware/authenticateToken");

// Create a new renting
router.post("/create", createRenting);

// Get all rentings
router.get("/getall/:category", authenticateToken, getAllRentings);

// Get available cars by date
router.get("/availablecars/:category", getAvailableCars);

router.get("/getunavailabedates/:carid", getUnavailableDates);

router.get("/month", getCarsByMonth); // Admin endpoint to fetch cars by month

module.exports = router;
