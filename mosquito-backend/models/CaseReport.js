const mongoose = require("mongoose");

const caseReportSchema = new mongoose.Schema({
    hospitalId: { type: String, required: true },
    hospitalName: { type: String, required: true },
    district: { type: String, required: true },
    province: { type: String, required: true },
    location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    diseaseType: { type: String, enum: ["dengue", "chikungunya"], required: true },
    caseCount: { type: Number, required: true }, // Total Notified
    confirmedCount: { type: Number, default: 0 },
    confirmedNS1: { type: Number, default: 0 },
    confirmedIgM: { type: Number, default: 0 },
    suspectedCount: { type: Number, default: 0 },
    deathCount: { type: Number, default: 0 },

    // Clinical Categories
    dfCount: { type: Number, default: 0 }, // Dengue Fever
    dhfCount: { type: Number, default: 0 }, // Dengue Hemorrhagic Fever
    severeDengueCount: { type: Number, default: 0 },
    warningSignsCount: { type: Number, default: 0 },

    // Demographics
    maleCount: { type: Number, default: 0 },
    femaleCount: { type: Number, default: 0 },
    ageGroup: { type: String, default: "Mixed" },

    severityLevel: { type: String, enum: ["LOW", "MEDIUM", "HIGH"], default: "LOW" },
    source: { type: String, default: "Manual" },
    notes: { type: String },
    reportedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    weekNumber: { type: Number },
    month: { type: Number },
    year: { type: Number },
    verified: { type: Boolean, default: false }
});

module.exports = mongoose.model("CaseReport", caseReportSchema);
