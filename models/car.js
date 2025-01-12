const mongoose = require("mongoose");

const carSchema = new mongoose.Schema(
  {
    images: { type: [String], required: true },
    title: { type: String, required: true },
    reviews: { type: [String], required: true },
    description: { type: String, required: true },
    carType: { type: String, required: true },
    capacity: { type: Number, required: true, default: 2 },
    steering: { type: String, required: true },
    engineType: { type: String, required: true },
    price: { type: Number, required: true },
    equipments: {
      type: [String],
      enum: [
        "Air Conditioning",
        "Power Steering",
        "ABS",
        "Airbags",
        "Sunroof",
        "Navigation",
        "Bluetooth",
        "Parking Sensors",
        "Leather Seats",
        "Heated Seats",
        "Cruise Control",
      ],
    },
    gear: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ["longueduree", "courteduree"],
    },
    fuel: { type: String, required: true },
    doors: { type: Number, required: true, default: 2 },
    seats: { type: Number, required: true, default: 2 },
    mileage: { type: Number, required: true },
    ratings: [
      {
        fullName: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String },
      },
    ],
    averageRating: { type: Number, default: 0 },
    available: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);

// Calculate average rating
carSchema.methods.calculateAverageRating = function () {
  if (this.ratings.length === 0) {
    this.averageRating = 0;
  } else {
    const sum = this.ratings.reduce(
      (total, rating) => total + rating.rating,
      0
    );
    this.averageRating = sum / this.ratings.length;
  }
  return this.averageRating;
};

// Add rating
carSchema.methods.addRating = function (fullName, rating, comment) {
  this.ratings.push({ fullName, rating, comment });
  this.calculateAverageRating();
  return this.save();
};

module.exports = mongoose.model("Car", carSchema);
