// controllers/prediction.controller.js
const svc = require("../services/prediction.service");

// POST /api/predictions/forecast
// Called by Colab to push batch forecast data
const saveForecast = async (req, res) => {
    try {
        const { rows, api_key } = req.body;

        // Simple API key check (set PREDICTION_API_KEY in your .env)
        if (api_key !== process.env.PREDICTION_API_KEY) {
            return res.status(401).json({ success: false, message: "Invalid API key" });
        }
        if (!Array.isArray(rows) || rows.length === 0) {
            return res.status(400).json({ success: false, message: "rows array is required" });
        }

        const result = await svc.saveForecastBatch(rows);
        res.json({ success: true, message: "Forecast saved", ...result });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};

// GET /api/predictions/district/:district
const getDistrictForecast = async (req, res) => {
    try {
        const data = await svc.getDistrictForecast(req.params.district);
        if (!data) return res.status(404).json({ success: false, message: "No forecast found" });
        res.json({ success: true, data });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};

// GET /api/predictions/all
// Returns latest forecast for all districts (used by heatmap)
const getAllDistrictForecasts = async (req, res) => {
    try {
        const data = await svc.getAllDistrictForecasts();
        res.json({ success: true, count: data.length, data });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};

// GET /api/predictions/timeline/:district?weeks=24
const getDistrictTimeline = async (req, res) => {
    try {
        const weeks = parseInt(req.query.weeks) || 24;
        const data = await svc.getDistrictTimeline(req.params.district, weeks);
        res.json({ success: true, district: req.params.district.toUpperCase(), data });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};

// GET /api/predictions/risk-summary
// For dashboard stat cards: how many districts are high/medium/low
const getRiskSummary = async (req, res) => {
    try {
        const data = await svc.getRiskSummary();
        res.json({ success: true, data });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};

module.exports = {
    saveForecast,
    getDistrictForecast,
    getAllDistrictForecasts,
    getDistrictTimeline,
    getRiskSummary,
};
