const express = require("express");
const router = express.Router();
const multer = require("multer");
const { uploadMosquitoData, getAllMosquitoData, getAllWeatherData } = require("../controllers/mcontroller");

const upload = multer({ dest: "uploads/" });

router.post("/upload-csv", upload.single("file"), uploadMosquitoData);
router.get("/get", getAllMosquitoData);
router.get("/getWeather", getAllWeatherData);

module.exports = router;