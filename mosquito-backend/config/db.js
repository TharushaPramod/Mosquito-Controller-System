const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.warn('MONGO_URI not set; skipping MongoDB connection.');
      return;
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error('MongoDB connection failed:', error.message || error);
    // Do not exit process; allow server to run in degraded mode without DB
    return;
  }
};

module.exports = connectDB;
