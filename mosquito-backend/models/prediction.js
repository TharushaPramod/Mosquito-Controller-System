// models/prediction.js
const { denguesafeDB } = require("../config/db");
const mongoose = require("mongoose");

// One document = one district's weekly forecast row
const predictionSchema = new mongoose.Schema({
    district: {
        type: String,
        required: true,
        uppercase: true,
        trim: true,
        index: true,
    },
    date: {
        type: Date,
        required: true,
    },
    iso_week: { type: Number },
    iso_year: { type: Number },

    // Core forecast values
    predicted_cases: { type: Number, required: true, min: 0 },
    lower_bound: { type: Number, default: null },
    upper_bound: { type: Number, default: null },

    // Weather context
    weekly_rainfall: { type: Number, default: null },
    avg_temperature: { type: Number, default: null },

    // Risk level derived from predicted_cases
    // thresholds: low <20, medium 20-100, high >100
    risk_level: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "low",
    },

    // actual | predicted | gap_fill
    data_type: {
        type: String,
        enum: ["actual", "predicted", "gap_fill"],
        default: "predicted",
    },

    model_used: { type: String, default: "XGBOOST" },
    generated_at: { type: Date, default: Date.now },
});

// Unique: one row per district per date
predictionSchema.index({ district: 1, date: 1 }, { unique: true });

// Helper to compute risk level from case count
predictionSchema.statics.getRiskLevel = function (cases) {
    if (cases >= 100) return "high";
    if (cases >= 20) return "medium";
    return "low";
};

module.exports = denguesafeDB.model("Prediction", predictionSchema);
