const Renting = require("../models/renting");
const Car = require("../models/car");
const nodemailer = require("nodemailer");
const unavailability = require("../models/unavailability");

// Create a new renting
const PDFDocument = require("pdfkit");

async function createRentalPDF(rentalData) {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ margin: 30, size: "A4", bufferPages: true });
    const buffers = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));

    doc.image("public/logo1.jpg", 450, 30, { width: 100 });

    // Header
    doc
      .font("Helvetica-Bold")
      .fontSize(18)
      .text("CONTRAT DE LOCATION", { align: "center" })
      .moveDown(0.3);

    // Horizontal line
    doc.moveTo(30, 90).lineTo(570, 90).strokeColor("#cccccc").stroke();

    let yPosition = 110;

    // Client Information Section
    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .text("INFORMATIONS CLIENT:", 30, yPosition);
    yPosition += 20;

    const clientInfo = [
      `Nom Complet: ${rentalData.firstName} ${rentalData.lastName}`,
      `Email: ${rentalData.email}`,
      `Téléphone: ${rentalData.phone}`,
      `WhatsApp: ${rentalData.whatsapp}`,
      `Adresse: ${rentalData.address}`,
      `Ville: ${rentalData.city}`,
      `Âge: ${rentalData.age}`,
    ];

    clientInfo.forEach((info) => {
      doc.font("Helvetica").fontSize(10).text(`• ${info}`, 40, yPosition);
      yPosition += 15;
    });

    // Vehicle Information Section
    yPosition += 10; // Add spacing between sections
    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .text("DÉTAILS DU VÉHICULE:", 30, yPosition);
    yPosition += 20;
    const vehicleInfo = [
      ["Véhicule:", rentalData.title],
      [
        "Catégorie:",
        rentalData.category === "longueduree" ? "Longue Durée" : "Courte Durée",
      ],
      ["Lieu de Départ:", rentalData.pickupLocation],
      ["Lieu de Retour:", rentalData.dropoffLocation],
      ["Date de Départ:", formatFrenchDate(rentalData.startDate)],
      ["Date de Retour:", formatFrenchDate(rentalData.endDate)],
      ["Siège Auto:", rentalData.siegeAuto ? "Oui" : "Non"],
      ["Nombre Vol:", rentalData.numVol],
    ];

    vehicleInfo.forEach(([label, value]) => {
      doc.font("Helvetica-Bold").text(label, 50, yPosition);
      doc.font("Helvetica").text(value, 150, yPosition);
      yPosition += 20;
    });

    // Pricing Section
    yPosition += 10;
    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .text("DÉTAILS FINANCIERS:", 30, yPosition)
      .moveDown(0.5);

    doc
      .font("Helvetica")
      .fontSize(12)
      .text(`Prix Total: ${rentalData.totalPrice} DT`, 30, yPosition + 20);
    doc
      .font("Helvetica")
      .fontSize(12)
      .text(`Dépôt de garantie: ${rentalData.garantie} DT`, 30, yPosition + 40);

    // Footer

    const footerY = 700;

    // Add a line above the agencies section
    doc
      .moveTo(30, footerY - 10)
      .lineTo(570, footerY - 10)
      .strokeColor("#cccccc")
      .stroke();

    // Title with some styling
    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .fillColor("#333333")
      .text("NOS AGENCES", 30, footerY, { align: "center" })
      .moveDown(0.5);

    // Contact information in two columns
    const leftColumn = 50;
    const rightColumn = 300;
    const lineHeight = 15;

    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor("#666666")
      .text("Agence Ennozha:", leftColumn, footerY + 25);

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#333333")
      .text("+216 26 107 537, +216 54 546 653", leftColumn + 90, footerY + 25);

    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor("#666666")
      .text("Agence Mégrine:", rightColumn, footerY + 25);

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#333333")
      .text("+216 29 717 071", rightColumn + 90, footerY + 25);

    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor("#666666")
      .text("Agence Ariana:", leftColumn, footerY + 45);

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#333333")
      .text("+216 26 207 537", leftColumn + 90, footerY + 45);

    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor("#666666")
      .text("Atelier:", rightColumn, footerY + 45);

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#333333")
      .text("+216 26 107 537", rightColumn + 90, footerY + 45);

    doc.end();
  });
}

function formatFrenchDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

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
      carModel,
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

    const vehicleType = await Car.findById(carModel);
    if (!vehicleType) {
      return res.status(404).json({ message: "Car model not found" });
    }
    const newRenting = new Renting({ ...req.body, carModel: vehicleType._id });
    await newRenting.save();
    const title = carModel.title;
    // Generate PDF
    const pdfBuffer = await createRentalPDF({
      firstName,
      lastName,
      email,
      address,
      phone,
      age,
      city,
      title,
      category,
      startDate,
      endDate,
      totalPrice,
      pickupLocation,
      dropoffLocation,
      whatsapp,
      siegeAuto,
      numVol,
      garantie: vehicleType.garantie,
    });

    // Send Email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.email,
        pass: process.env.pass,
      },
    });

    await transporter.sendMail({
      from: process.env.email,
      to: email,
      subject: "Votre Contrat de Location",
      text: `Bonjour ${firstName},\n\nVeuillez trouver ci-joint votre contrat de location.\n\nCordialement,\nL'équipe de location`,
      attachments: [
        {
          filename: `Contrat_Location_${firstName}_${lastName}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    res.status(201).json({
      success: true,
      data: newRenting,
      message: "Location créée et contrat envoyé avec succès",
    });
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la création de la location",
    });
  }
};

exports.assignMatricule = async (req, res) => {
  try {
    const { rentingId } = req.params;
    const { matricule } = req.body;

    const renting = await Renting.findById(rentingId);
    const vehicleType = await Car.findById(renting.carModel);

    // Validation checks
    if (!renting || !vehicleType) {
      return res
        .status(404)
        .json({ message: "Renting or vehicle type not found" });
    }

    // Check if matricule exists and is available
    const isAvailable = vehicleType.isMatriculeAvailable(
      matricule,
      renting.startDate,
      renting.endDate
    );

    if (!isAvailable) {
      return res.status(404).json({ message: "Matricule not available" });
    }

    // Update renting and mark matricule as booked
    renting.assignedMatricule = matricule;
    renting.assignmentDate = new Date();

    await Promise.all([
      renting.save(),
      Car.updateOne(
        { _id: vehicleType._id, "matricules.value": matricule },
        {
          $push: {
            "matricules.$.unavailablePeriods": {
              startDate: renting.startDate,
              endDate: renting.endDate,
            },
          },
        }
      ),
    ]);

    // Send updated contract

    res.json({
      success: true,
      message: "Vehicle assigned successfully",
      matricule,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Assignment failed",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

exports.getAvailableMatricules = async (req, res) => {
  try {
    const { carModel, startDate, endDate } = req.query;

    const vehicleType = await Car.findById(carModel);
    if (!vehicleType) {
      return res.status(404).json({ message: "Car model not found" });
    }

    const availableMatricules = vehicleType.matricules
      .filter((m) => m.available)
      .filter(
        (m) =>
          !m.unavailablePeriods?.some(
            (period) =>
              period.startDate <= endDate && period.endDate >= startDate
          )
      )
      .map((m) => m.value);

    res.json({ availableMatricules });
  } catch (error) {
    res.status(500).json({ message: "Error fetching matricules", error });
  }
};

// Get all rentings
exports.getAllRentings = async (req, res) => {
  try {
    const { category } = req.query;

    // Validate category parameter
    const validCategories = ["longueduree", "courteduree"];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: "Catégorie non valide" });
    }

    const rentings = await Renting.find({ category })
      .populate("carModel")
      .sort({ createdAt: -1 });

    res.status(200).json(rentings);
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving rentings",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get available cars by date
exports.getAvailableCars = async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    // Get all cars in the category
    const allCars = await Car.find({
      category: category,
      available: true,
    }).lean();

    // Find available cars with available matricules
    const availableCars = await Promise.all(
      allCars.map(async (car) => {
        const availableMatricules = await Promise.all(
          car.matricules.map(async (matricule) => {
            // Check for overlapping reservations
            const reservationConflict = await Renting.exists({
              assignedMatricule: matricule.value,
              $or: [
                { startDate: { $lte: end }, endDate: { $gte: start } },
                { startDate: { $gte: start, $lte: end } },
                { endDate: { $gte: start, $lte: end } },
              ],
            });

            // Check for overlapping unavailabilities
            const unavailabilityConflict = await unavailability.exists({
              matricule: matricule.value,
              $or: [
                { startDate: { $lte: end }, endDate: { $gte: start } },
                { startDate: { $gte: start, $lte: end } },
                { endDate: { $gte: start, $lte: end } },
              ],
            });

            // Matricule is available if no conflicts
            return !reservationConflict && !unavailabilityConflict
              ? matricule.value
              : null;
          })
        );

        // Filter out null values and get only available matricules
        const validMatricules = availableMatricules.filter((m) => m !== null);

        return validMatricules.length > 0
          ? {
              ...car,
              matricules: validMatricules,
              availableMatriculeCount: validMatricules.length,
            }
          : null;
      })
    );

    // Filter out cars with no available matricules
    const filteredCars = availableCars.filter((car) => car !== null);

    res.status(200).json(filteredCars);
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
    const startOfMonth = new Date(Date.UTC(year, month - 1, 1));
    const endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59));

    // Get all cars with matricules
    const cars = await Car.find().lean();

    // Get all relevant rentals and unavailabilities
    const [rentals, unavailabilities] = await Promise.all([
      Renting.find({
        startDate: { $lte: endOfMonth },
        endDate: { $gte: startOfMonth },
      }).lean(),
      unavailability
        .find({
          startDate: { $lte: endOfMonth },
          endDate: { $gte: startOfMonth },
        })
        .lean(),
    ]);

    // Process each car's matricules
    const response = cars.map((car) => {
      const matriculesData = car.matricules.map((matricule) => {
        // Find rentals for this matricule
        const matriculeRentals = rentals.filter(
          (rental) =>
            rental.assignedMatricule === matricule.value &&
            rental.carModel.toString() === car._id.toString()
        );

        // Find unavailabilities for this matricule
        const matriculeUnavailabilities = unavailabilities.filter(
          (u) =>
            u.car.toString() === car._id.toString() &&
            u.matricule === matricule.value
        );

        // Combine with car's built-in unavailable periods
        const allUnavailablePeriods = [
          ...(matricule.unavailablePeriods || []),
          ...matriculeUnavailabilities.map((u) => ({
            startDate: u.startDate,
            endDate: u.endDate,
          })),
        ];

        // Generate a map of statuses for each day of the month
        const statuses = Array.from(
          { length: endOfMonth.getUTCDate() },
          (_, dayIndex) => {
            const dayStart = new Date(Date.UTC(year, month - 1, dayIndex + 1));
            const dayEnd = new Date(dayStart);
            dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);
            dayEnd.setUTCMilliseconds(-1);

            // Check if the day is reserved
            const isReserved = matriculeRentals.some((rental) => {
              const rentalStart = new Date(rental.startDate);
              const rentalEnd = new Date(rental.endDate);
              return rentalStart <= dayEnd && rentalEnd >= dayStart;
            });

            // Check if the day is unavailable
            const isUnavailable = allUnavailablePeriods.some((period) => {
              const unavailableStart = new Date(period.startDate);
              const unavailableEnd = new Date(period.endDate);
              return unavailableStart <= dayEnd && unavailableEnd >= dayStart;
            });

            // Determine the status
            return isReserved
              ? "reserved"
              : isUnavailable
              ? "unavailable"
              : "available";
          }
        );

        return {
          value: matricule.value,
          statuses,
          rentals: matriculeRentals,
          unavailablePeriods: allUnavailablePeriods,
        };
      });

      return {
        ...car,
        matricules: matriculesData,
        reservations: rentals.filter(
          (rental) => rental.carModel.toString() === car._id.toString()
        ),
      };
    });

    res.status(200).json(response);
  } catch (error) {
    console.error("Error in getCarsByMonth:", error);
    res.status(500).json({
      message: "Error retrieving cars by month",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
