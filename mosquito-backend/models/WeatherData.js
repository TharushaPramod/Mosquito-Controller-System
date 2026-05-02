const { sharedDB } = require("../config/db");
const mongoose = require("mongoose");

const weatherSchema = new mongoose.Schema({
  location: { type: String, required: true },
  year: Number,
  month: Number,
  rainfall: Number,
  humidity: Number,
  temperature: Number
});

module.exports = sharedDB.model("WeatherData", weatherSchema);