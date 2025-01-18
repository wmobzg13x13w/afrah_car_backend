const mongoose = require("mongoose");

const rentingSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    age: { type: Number, required: true },
    city: { type: String, required: true },
    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car",
      required: true,
    },
    category: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalPrice: { type: Number, required: true },
    pickupLocation: { type: String, required: true },
    dropoffLocation: { type: String, required: true },
    whatsapp: { type: String, required: true },
    siegeAuto: { type: Boolean, required: true },
    numVol: { type: String, required: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Renting", rentingSchema);
