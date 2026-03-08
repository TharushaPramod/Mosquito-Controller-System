const axios = require("axios");
const Mosquito = require("../models/MosquitoData");
const Weather = require("../models/WeatherData");

exports.predictNextThreeYears = async (req, res, next) => {
  try {
    const location = req.params.location;
    console.log("Requested location:", location);

    const mosquitoData = await Mosquito.find({ location }).sort({ year: 1, month: 1 });
    const weatherData = await Weather.find({ location }).sort({ year: 1, month: 1 });

    console.log("Mosquito data length:", mosquitoData.length);
    console.log("Weather data length:", weatherData.length);

    if (!mosquitoData.length || !weatherData.length) {
      console.error("Missing data for location:", location);
      return res.status(404).json({ message: "Missing data" });
    }

    const weatherMap = {};
    weatherData.forEach(w => weatherMap[`${w.year}-${w.month}`] = w);

    const inputData = mosquitoData.map((item, index) => {
      const weather = weatherMap[`${item.year}-${item.month}`];
      return {
        Year: item.year,
        Month: item.month,
        Rainfall: weather ? weather.rainfall : 0,
        Humidity: weather ? weather.humidity : 0,
        Temperature: weather ? weather.temperature : 0,
        Rainfall_lag1: index > 0 ? weatherMap[`${mosquitoData[index - 1].year}-${mosquitoData[index - 1].month}`]?.rainfall || 0 : 0,
        Density_lag1: item.cumulative
      };
    });

    console.log("Input data for Flask API:", inputData);

    const response = await axios.post("http://127.0.0.1:5001/predict", inputData);
    console.log("Flask response:", response.data);

    res.json(response.data);

  } catch (error) {
    console.error("Error in predictNextThreeYears:", error.message);
    next(error);
  }
};