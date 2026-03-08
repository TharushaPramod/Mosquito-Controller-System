const mongoose = require("mongoose");
const fs = require("fs");
const csv = require("csv-parser");
require("dotenv").config();

const WeatherData = require("./models/WeatherData");

mongoose.connect("mongodb+srv://lukysam95_db_user:Yx91Ozr06CFKhbBC@mosqutio.5v0rge0.mongodb.net/?appName=mosqutio")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

const results = [];

fs.createReadStream("Negambo_weather_clean.csv")
  .pipe(csv())
  .on("data", (data) => {
    results.push({
      location: "Negombo", // change if needed
      year: Number(data.Year),
      month: Number(data.Month),
      rainfall: Number(data.Rainfall),
      humidity: Number(data.Humidity),
      temperature: Number(data.Temperature)
    });
  })
  .on("end", async () => {
    await WeatherData.insertMany(results);
    console.log("Weather data imported ✅");
    process.exit();
  });