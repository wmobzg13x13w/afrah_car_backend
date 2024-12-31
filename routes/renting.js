const express = require("express");
const router = express.Router();
const {
  createRenting,
  getAllRentings,
  getAvailableCars,
} = require("../controllers/renting");
const authenticateToken = require("../middleware/authenticateToken");

// Create a new renting
router.post("/create", authenticateToken, createRenting);

// Get all rentings
router.get("/", authenticateToken, getAllRentings);

// Get available cars by date
router.get("/availablecars", getAvailableCars);

module.exports = router;
