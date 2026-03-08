const express = require("express");
const router = express.Router();
const multer = require("multer");

const { uploadWeatherCSV } = require("../controllers/weatherController");

const upload = multer({ dest: "uploads/" });

router.post("/upload-weather-csv", upload.single("file"), uploadWeatherCSV);

module.exports = router;