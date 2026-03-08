const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const userRoutes = require("./routes/Csvroute");
const predictionRoutes = require("./routes/predictionRoutes");
const weatherRoutes = require("./routes/weatherRoutes");

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());



// Health check / root route
app.get('/', (req, res) => {
  res.send('Server is up and MongoDB connected successfully ✅');
});

// Connect to MongoDB only once
if (!mongoose.connection.readyState) {
  mongoose.connect(process.env.MONGO)
    .then(() => console.log('MongoDB connected ✅'))
    .catch((err) => console.error('MongoDB connection error ❌', err));
}

app.use("/api/users", userRoutes);
app.use("/api", predictionRoutes);
app.use("/api/weather", weatherRoutes);
console.log("userRoutes:", typeof userRoutes);
console.log("predictionRoutes:", typeof predictionRoutes);
console.log("weatherRoutes:", typeof weatherRoutes);



// Error middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;
