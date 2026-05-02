const express = require("express");
const cors = require("cors");
const app = express();

// ── CORS ──────────────────────────────────────────────────────
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Hospital-API-Key",
        "ngrok-skip-browser-warning",
    ],
    credentials: true,
}));

// ── Body parser ───────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── Routes ────────────────────────────────────────────────────
const heatmapRoutes = require("./routes/heatmap_routes");
const hospitalRoutes = require("./routes/hospital_routes");
const notificationRoutes = require("./routes/notification_routes");
const predictionRoutes = require("./routes/prediction_routes");
const caseReportRoutes = require("./routes/casereport_routes");
const alertRoutes = require("./routes/alert_routes");
const phiAllocationRoutes = require("./routes/phi_allocation_routes");
const userRoutes = require("./routes/userRoutes");
const weatherRoutes = require("./routes/weatherRoutes");
const trapRoutes = require("./routes/trapRoutes");

// Health Check
app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        message: "Smart Mosquito Control Backend is running",
    });
});

// Register Routes
app.use("/api/heatmap", heatmapRoutes);
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/predictions", predictionRoutes);
app.use("/api/case-reports", caseReportRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/phi-allocations", phiAllocationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/traps", trapRoutes);

module.exports = app;