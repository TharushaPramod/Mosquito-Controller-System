// models/PHIAllocation.js
const { denguesafeDB } = require("../config/db");
const mongoose = require("mongoose");

const PHIAllocationSchema = new mongoose.Schema({
    district: { type: String, required: true, trim: true },
    predictedCases: { type: Number, required: true },
    assignedPHIId: { type: String, required: true },
    assignedPHIName: { type: String, required: true },
    weekNumber: { type: Number, required: true },
    assignedBy: { type: String, required: true },
    recommendedCount: { type: String },
    status: { type: String, enum: ["assigned", "pending"], default: "assigned" },
    createdAt: { type: Date, default: Date.now },
});

module.exports =
    denguesafeDB.models.PHIAllocation ||
    denguesafeDB.model("PHIAllocation", PHIAllocationSchema);
