const express = require("express");
const router = express.Router();
const {
  createRenting,
  getAllRentings,
  getAvailableCars,
  getUnavailableDates,
} = require("../controllers/renting");
const authenticateToken = require("../middleware/authenticateToken");

// Create a new renting
router.post("/create", createRenting);

// Get all rentings
router.get("/getall/:category", authenticateToken, getAllRentings);

// Get available cars by date
router.get("/availablecars/:category", getAvailableCars);

router.get("/getunavailabedates/:carid", getUnavailableDates);

module.exports = router;
