const Renting = require("../models/renting");
const Car = require("../models/car");
const nodemailer = require("nodemailer");
const pdf = require("html-pdf");
const unavailability = require("../models/unavailability");

// Create a new renting
exports.createRenting = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      address,
      phone,
      age,
      city,
      car,
      category,
      startDate,
      endDate,
      totalPrice,
      pickupLocation,
      dropoffLocation,
      whatsapp,
      siegeAuto,
      numVol,
    } = req.body;

    const newRenting = new Renting({
      firstName,
      lastName,
      email,
      address,
      phone,
      age,
      city,
      car,
      category,
      startDate,
      endDate,
      totalPrice,
      pickupLocation,
      dropoffLocation,
      whatsapp,
      siegeAuto,
      numVol,
    });
    console.log(siegeAuto);

    await newRenting.save();
    const chosenCar = await Car.findById(car);

    // Create a Nodemailer transporter
    const transporter = nodemailer.createTransport({
      // Configure your email server details here
      service: "gmail",
      auth: {
        user: process.env.email,
        pass: process.env.pass,
      },
    });

    // Generate the PDF content
    const pdfContent = `
      <html>
        <head>
          <style>
            /* Add your PDF styling here */
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
            }
            h1 {
              text-align: center;
              margin-bottom: 30px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th, td {
              padding: 10px;
              text-align: left;
              border-bottom: 1px solid #ddd;
            }
            th {
              background-color: #f2f2f2;
            }
          </style>
        </head>
        <body>
          <h1>Rental Details</h1>
          <table>
            <tr>
              <th>Name</th>
              <td>${firstName} ${lastName}</td>
            </tr>
            <tr>
              <th>Email</th>
              <td>${email}</td>
            </tr>
            <tr>
              <th>Address</th>
              <td>${address}</td>
            </tr>
            <tr>
              <th>Phone</th>
              <td>${phone}</td>
            </tr>
            <tr>
              <th>Numéro WhatsApp</th>
              <td>${whatsapp}</td>
            </tr>
            <tr>
              <th>Age</th>
              <td>${age}</td>
            </tr>
            <tr>
              <th>City</th>
              <td>${city}</td>
            </tr>
            <tr>
              <th>Car</th>
              <td>${chosenCar.title}</td>
            </tr>
            <tr>
              <th>Category</th>
              <td>${
                category == "longueduree" ? "Longue durée" : "Courte durée"
              }</td>
            </tr>
            <tr>
              <th>Pickup Date</th>
              <td>
              ${new Date(startDate).toLocaleDateString("fr-FR")} 
              ${new Date(startDate).toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              })}</td>
            </tr>
            <tr>
              <th>Dropoff Date</th>
              <td>
              ${new Date(endDate).toLocaleDateString("fr-FR")} 
              ${new Date(endDate).toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              })}</td>
            </tr>
            <tr>
              <th>Pickup Location</th>
              <td>${pickupLocation}</td>
            </tr>
            <tr>
              <th>Dropoff Location</th>
              <td>${dropoffLocation}</td>
            </tr>
            <tr>
              <th>Total Price</th>
              <td>${totalPrice} dt</td>
            </tr>
          </table>
        </body>
      </html>
    `;

    // Create the PDF file
    const pdfBuffer = await new Promise((resolve, reject) => {
      pdf.create(pdfContent).toBuffer((err, buffer) => {
        if (err) {
          reject(err);
        } else {
          resolve(buffer);
        }
      });
    });

    const mailOptions = {
      from: process.env.email,
      to: email,
      subject: "Détails de location",
      text: "Veuillez trouver ci-joint les détails de la location.",
      attachments: [
        {
          filename: "rental-details.pdf",
          content: pdfBuffer,
          encoding: "binary",
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    res.status(201).json(newRenting);
  } catch (error) {
    res.status(500).json({ message: "Error creating renting", error });
  }
};

// Get all rentings
exports.getAllRentings = async (req, res) => {
  const { category } = req.params;
  try {
    const rentings = await Renting.find({ category }).populate("car");
    res.status(200).json(rentings);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving rentings", error });
  }
};

// Get available cars by date
exports.getAvailableCars = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const category = req.params.category;

    // Convert query parameters to Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validate dates
    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    // Find all cars that have overlapping reservations
    const rentedCars = await Renting.find({
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } },
        { startDate: { $gte: start, $lte: end } },
        { endDate: { $gte: start, $lte: end } },
      ],
    }).distinct("car");

    // Find all cars with overlapping unavailability
    const unavailableCars = await unavailability
      .find({
        $or: [
          { startDate: { $lte: end }, endDate: { $gte: start } },
          { startDate: { $gte: start, $lte: end } },
          { endDate: { $gte: start, $lte: end } },
        ],
      })
      .distinct("car");

    // Combine and deduplicate excluded cars
    const excludedCars = [...new Set([...rentedCars, ...unavailableCars])];

    // Find available cars not in excluded list
    const availableCars = await Car.find({
      _id: { $nin: excludedCars },
      category: category,
      available: true,
    });

    res.status(200).json(availableCars);
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving available cars",
      error: error.message,
    });
  }
};

exports.getUnavailableDates = async (req, res) => {
  try {
    const { carid } = req.params;

    const rentings = await Renting.find({ car: carid });

    const unavailableDates = rentings.flatMap((renting) => {
      const dates = [];
      let currentDate = new Date(renting.startDate);
      while (currentDate <= renting.endDate) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      return dates;
    });

    res.status(200).json(unavailableDates);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving unavailable dates", error });
  }
};

exports.getCarsByMonth = async (req, res) => {
  const { month, year } = req.query;

  try {
    // Create start and end dates for the given month
    const startOfMonth = new Date(year, month - 1, 1); // month is 0-indexed in JS
    const endOfMonth = new Date(year, month, 0); // Last day of the month

    // Get all cars
    const cars = await Car.find();

    // Get all rentals for the specified month
    const rentals = await Renting.find({
      startDate: { $lte: endOfMonth },
      endDate: { $gte: startOfMonth },
    }).populate("car"); // Populate car details

    // Group rentals by car
    const groupedRentals = rentals.reduce((acc, rental) => {
      const carId = rental.car._id.toString();
      if (!acc[carId]) {
        acc[carId] = {
          car: rental.car,
          reservations: [],
        };
      }
      acc[carId].reservations.push(rental);
      return acc;
    }, {});

    // Create a response array that will include all cars and their reservations
    const response = cars.map((car) => ({
      car,
      reservations: groupedRentals[car._id.toString()]
        ? groupedRentals[car._id.toString()].reservations
        : [],
    }));

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving cars by month", error });
  }
};
