const MosquitoData = require('../models/MosquitoData');
const WeatherData = require('../models/WeatherData');

const fs = require("fs");
const csv = require("csv-parser");


// GET all mosquito data
exports.getAllMosquitoData = async (req, res, next) => {
  try {
    const data = await MosquitoData.find().sort({ year: 1, month: 1 });

    res.status(200).json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllWeatherData = async (req, res, next) => {
  try {
    const data = await WeatherData.find().sort({ year: 1, month: 1 });

    res.status(200).json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    next(error);
  }
};


exports.uploadMosquitoData = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const results = [];

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (row) => {
        if (row.Location && row.Cumulative) {
          results.push({
            location: row.Location,
            year: parseInt(row.Year),
            month: parseInt(row.Month),
            cumulative: parseInt(row.Cumulative),
          });
        }
      })
      .on("end", async () => {
        try {
          await MosquitoData.insertMany(results);

          // Delete uploaded file after processing
          fs.unlinkSync(req.file.path);

          res.status(200).json({
            success: true,
            message: "CSV Uploaded & Data Saved Successfully ✅",
          });
        } catch (err) {
          res.status(500).json({ message: err.message });
        }
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};