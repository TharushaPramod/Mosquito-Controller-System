const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema({
    type: { type: String, enum: ["outbreak", "predictive", "facility", "general"], required: true },
    district: { type: String },
    province: { type: String },
    riskLevel: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    titleEn: { type: String, required: true },
    titleSi: { type: String },
    titleTa: { type: String },
    messageEn: { type: String, required: true },
    messageSi: { type: String },
    messageTa: { type: String },
    diseaseType: { type: String },
    caseCount: { type: Number },
    createdAt: { type: Date, default: Date.now },
    active: { type: Boolean, default: true },
    sentToFCM: { type: Boolean, default: false }
});

module.exports = mongoose.model("Alert", alertSchema);
