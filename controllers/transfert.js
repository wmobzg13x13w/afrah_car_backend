const Transfert = require("../models/transfert");

// Create a new transfert
exports.createTransfert = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      address,
      phone,
      whatsAppNum,
      startDate,
      endDate,
      pickupLocation,
      dropoffLocation,
    } = req.body;

    const newTransfert = new Transfert({
      firstName,
      lastName,
      email,
      address,
      phone,
      whatsAppNum,
      startDate,
      endDate,
      pickupLocation,
      dropoffLocation,
    });

    await newTransfert.save();
    res.status(201).json(newTransfert);
  } catch (error) {
    res.status(500).json({ message: "Error creating transfert", error });
  }
};

// Get all transferts
exports.getAllTransferts = async (req, res) => {
  try {
    const transferts = await Transfert.find();
    res.status(200).json(transferts);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving transferts", error });
  }
};

// Get a single transfert by ID
exports.getTransfert = async (req, res) => {
  try {
    const transfert = await Transfert.findById(req.params.id);
    if (!transfert) {
      return res.status(404).json({ message: "Transfert not found" });
    }
    res.status(200).json(transfert);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving transfert", error });
  }
};

// Update a transfert by ID
exports.updateTransfert = async (req, res) => {
  try {
    const updatedTransfert = await Transfert.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedTransfert) {
      return res.status(404).json({ message: "Transfert not found" });
    }

    res.status(200).json(updatedTransfert);
  } catch (error) {
    res.status(500).json({ message: "Error updating transfert", error });
  }
};

// Delete a transfert by ID
exports.deleteTransfert = async (req, res) => {
  try {
    const deletedTransfert = await Transfert.findByIdAndDelete(req.params.id);

    if (!deletedTransfert) {
      return res.status(404).json({ message: "Transfert not found" });
    }

    res.status(200).json({ message: "Transfert deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting transfert", error });
  }
};
