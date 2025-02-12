const express = require("express");
const router = express.Router();
const {
  createUnavailability,
  deleteUnavailability,
  getMonthlyUnavailability,
} = require("../controllers/unavailability");

router.post("/", createUnavailability);
router.delete("/:id", deleteUnavailability);
router.get("/month", getMonthlyUnavailability);

module.exports = router;
