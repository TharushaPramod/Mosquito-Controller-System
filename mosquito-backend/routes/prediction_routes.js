// routes/prediction_routes.js
const router = require("express").Router();
const ctl = require("../controllers/prediction.controller");
const { verifyToken } = require("../middleware/auth.middleware");

// POST /api/predictions/forecast  — Colab pushes data here (API key protected)
router.post("/forecast", ctl.saveForecast);

// GET  /api/predictions/all       — all districts latest (heatmap overlay)
router.get("/all", ctl.getAllDistrictForecasts);

// GET  /api/predictions/district/:district  — single district 2-week forecast
router.get("/district/:district", ctl.getDistrictForecast);

// GET  /api/predictions/timeline/:district  — full history + predictions
router.get("/timeline/:district", ctl.getDistrictTimeline);

// GET  /api/predictions/risk-summary  — dashboard stat cards
router.get("/risk-summary", ctl.getRiskSummary);

module.exports = router;
