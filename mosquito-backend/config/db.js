const mongoose = require("mongoose");

// Connection 1 — DengueSafe (your part)
const denguesafeDB = mongoose.createConnection(process.env.MONGODB_URI);
denguesafeDB.on("connected", () => console.log("DengueSafe DB Connected ✅"));
denguesafeDB.on("error", (e) => console.error("DengueSafe DB Error ❌", e.message));

// Connection 2 — Other member's backend
const sharedDB = mongoose.createConnection(process.env.MONGO);
sharedDB.on("connected", () => console.log("Shared DB Connected ✅"));
sharedDB.on("error", (e) => console.error("Shared DB Error ❌", e.message));

module.exports = { denguesafeDB, sharedDB };