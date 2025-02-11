const Transfert = require("../models/transfert");
const nodemailer = require("nodemailer");
const pdf = require("html-pdf");
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
      carburant,
      carType,
      fuelFeesOn,
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
      carburant,
      carType,
      fuelFeesOn,
    });

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
        <h1>Détails du Transfert</h1>
        <table>
          <tr>
            <th>Nom</th>
            <td>${firstName} ${lastName}</td>
          </tr>
          <tr>
            <th>Email</th>
            <td>${email}</td>
          </tr>
          <tr>
            <th>Adresse</th>
            <td>${address}</td>
          </tr>
          <tr>
            <th>Téléphone</th>
            <td>${phone}</td>
          </tr>
          <tr>
            <th>Numéro WhatsApp</th>
            <td>${whatsAppNum}</td>
          </tr>
          <tr>
            <th>Date de prise en charge</th>
            <td>${new Date(startDate).toLocaleString("fr-FR", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}</td>
          </tr>
          <tr>
            <th>Date de restitution</th>
            <td>${new Date(endDate).toLocaleString("fr-FR", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}</td>
          </tr>
          <tr>
            <th>Lieu de prise en charge</th>
            <td>${pickupLocation}</td>
          </tr>
          <tr>
            <th>Lieu de restitution</th>
            <td>${dropoffLocation}</td>
          </tr>
          <tr>
            <th>Type de voiture</th>
            <td>${carType}</td>
          </tr>
          <tr>
            <th>Type de carburant</th>
            <td>${carburant}</td>
          </tr>
          <tr>
            <th>Frais de carburant</th>
            <td>${
              fuelFeesOn === "client"
                ? "À la charge du client"
                : "À la charge de l'entreprise"
            }</td>
          </tr>
        </table>
      </body>
    </html>
  `;

    const transporter = nodemailer.createTransport({
      // Configure your email server details here
      service: "gmail",
      auth: {
        user: process.env.email,
        pass: process.env.pass,
      },
    });

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
      subject: "Détails du transfert",
      text: "Veuillez trouver ci-joint les détails du transfert",
      attachments: [
        {
          filename: "details-transfert.pdf",
          content: pdfBuffer,
          encoding: "binary",
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    await newTransfert.save();
    res.status(201).json(newTransfert);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la création du transfert", error });
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
