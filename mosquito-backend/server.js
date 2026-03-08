require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5002;

connectDB();

app.listen(PORT, () => {
  console.log("Smart Mosquito Control Backend");
  console.log("Running on http://localhost:" + PORT);
  console.log("Health: http://localhost:" + PORT + "/api/health");
});
