const fs = require("fs");
const csv = require("csv-parser");
const path = require("path");
const WeatherData = require("../models/WeatherData");

const uploadWeatherCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const results = [];

    // ✅ Get original file name
    const originalName = req.file.originalname;

    // Example: Kelaniya_weather_clean.csv
    const locationName = originalName.split("_")[0]; 
    // This takes first word before "_"

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (data) => {
        results.push({
          location: locationName,  // ✅ dynamic location
          year: Number(data.Year),
          month: Number(data.Month),
          rainfall: Number(data.Rainfall),
          humidity: Number(data.Humidity),
          temperature: Number(data.Temperature),
        });
      })
      .on("end", async () => {
        try {
          await WeatherData.insertMany(results);

          fs.unlinkSync(req.file.path);

          res.status(200).json({
            success: true,
            message: `Weather CSV for ${locationName} uploaded successfully ✅`,
          });
        } catch (err) {
          res.status(500).json({ message: err.message });
        }
      });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { uploadWeatherCSV };