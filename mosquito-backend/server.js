const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const mosquitoRoutes = require('./routes/mosquitoRoutes');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// test route
app.get("/", (req, res) => {
  res.send("Backend API running...");
});

// Import Mosquito Routes
app.use('/api', mosquitoRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
