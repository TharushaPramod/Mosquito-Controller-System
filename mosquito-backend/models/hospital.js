// models/Hospital.js
const mongoose = require("mongoose");

const HospitalSchema = new mongoose.Schema({
    hospitalId: { type: String, unique: true },
    name: { type: String, required: true },
    district: { type: String, required: true },
    province: { type: String },
    type: { type: String, enum: ["National Hospital", "Teaching Hospital", "General Hospital", "Base Hospital", "District Hospital", "Divisional Hospital", "PHI"], default: "District Hospital" },
    contactPerson: { type: String },
    contactPhone: { type: String },
    contactEmail: { type: String },
    location: { lat: Number, lng: Number },
    status: { type: String, enum: ["Active", "Delayed", "Not Sending Data"], default: "Active" },
    verified: { type: Boolean, default: false },
    lastReportAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.models.Hospital || mongoose.model("Hospital", HospitalSchema);
