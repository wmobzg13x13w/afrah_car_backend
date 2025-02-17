const express = require("express");
const router = express.Router();
const {
  createRenting,
  getAllRentings,
  getAvailableCars,
  getUnavailableDates,
  getCarsByMonth,
  assignMatricule,
  getAvailableMatricules,
} = require("../controllers/renting");
const authenticateToken = require("../middleware/authenticateToken");

// Create a new renting
router.post("/create", authenticateToken, createRenting);

// Get all rentings
router.get("/", authenticateToken, getAllRentings);

// Get available cars by date
router.get("/availablecars", getAvailableCars);

// Get unavailable dates for a specific car
router.get("/getunavailabedates/:carid", getUnavailableDates);

// Get cars by month
router.get("/month", authenticateToken, getCarsByMonth);

// Assign matricule to a renting
router.post("/assignmatricule/:rentingId", authenticateToken, assignMatricule);

// Get available matricules for a car model
router.get("/availablematricules", authenticateToken, getAvailableMatricules);

module.exports = router;
