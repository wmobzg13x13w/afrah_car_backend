const Unavailability = require("../models/unavailability");

exports.createUnavailability = async (req, res) => {
  try {
    const { car, startDate, endDate } = req.body;

    // Check for existing conflicts
    const conflict = await Unavailability.findOne({
      car,
      $or: [
        { startDate: { $lte: endDate }, endDate: { $gte: startDate } },
        { startDate: { $gte: startDate, $lte: endDate } },
      ],
    });

    if (conflict) {
      return res
        .status(400)
        .json({ error: "Date range conflicts with existing unavailability" });
    }

    const unavailability = await Unavailability.create({
      car,
      startDate,
      endDate,
    });
    res.status(201).json(unavailability);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteUnavailability = async (req, res) => {
  try {
    const { id } = req.params;
    const unavailability = await Unavailability.findByIdAndDelete(id);

    if (!unavailability) {
      return res.status(404).json({ error: "Unavailability not found" });
    }

    res.status(200).json({ message: "Unavailability removed" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add this to your existing controller
exports.getMonthlyUnavailability = async (req, res) => {
  try {
    const { month, year } = req.query;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const unavailabilities = await Unavailability.find({
      $or: [
        {
          startDate: { $lte: endDate },
          endDate: { $gte: startDate },
        },
        {
          startDate: { $gte: startDate, $lte: endDate },
        },
      ],
    }).populate("car", "matricule category");

    res.status(200).json(unavailabilities);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
