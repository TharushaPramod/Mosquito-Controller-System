require("dotenv").config();
const app = require("./app");


const PORT = process.env.PORT || 5002;

require("./config/db");

const cors = require("cors");
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.listen(PORT, () => {
  console.log("Smart Mosquito Control Backend");
  console.log("Running on http://localhost:" + PORT);
  console.log("Health: http://localhost:" + PORT + "/api/health");
});