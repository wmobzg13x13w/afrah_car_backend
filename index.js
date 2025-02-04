const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();
const port = process.env.PORT || 3000;
const app = express();
const path = require("path");
const adminRouter = require("./routes/admin");
const carRouter = require("./routes/car");
const rentingRouter = require("./routes/renting");
const transfertRouter = require("./routes/transfert");

app.use(express.json());
app.use(cors());

app.use("/admin", adminRouter);
app.use("/cars", carRouter);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/rentings", rentingRouter);
app.use("/transfert", transfertRouter);

mongoose
  .connect(process.env.DB_CONNECTION)
  .then(() =>
    app.listen(port, () => console.log("app working on port " + port + "..."))
  )
  .then(() => console.log("connected to db"))
  .catch((e) => console.log("check ur database server :" + e));
