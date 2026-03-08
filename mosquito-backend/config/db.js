const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/mosquito_db");
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
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

