// Add this to your mosquito-backend/routes/hospital_routes.js
// OR create a new file: routes/casereport_routes.js

const express = require("express");
const router = express.Router();
const CaseReport = require("../models/CaseReport");
const Hospital = require("../models/hospital");

const mapSeverity = (s) => {
    if (!s) return "LOW";
    const val = s.toString().toUpperCase();
    if (val === "MILD") return "LOW";
    if (val === "MODERATE") return "MEDIUM";
    if (val === "SEVERE") return "HIGH";
    return val; // Hopefully it's already LOW/MEDIUM/HIGH
};

// POST /api/case-reports — submit a single case report (manual entry from UI)
router.post("/", async (req, res) => {
    try {
        const body = req.body;

        if (!body.hospitalId) return res.status(400).json({ success: false, message: "hospitalId is required" });
        if (!body.caseCount && body.caseCount !== 0) return res.status(400).json({ success: false, message: "caseCount is required" });

        const reportDate = body.reportedAt ? new Date(body.reportedAt) : new Date();
        const year = reportDate.getFullYear();
        const month = reportDate.getMonth() + 1;

        // ISO week number
        const d = new Date(Date.UTC(year, reportDate.getMonth(), reportDate.getDate()));
        const dy = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dy);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const weekNumber = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);

        const severityLevel = mapSeverity(body.severityLevel);

        // If location is missing, try to fetch it from the hospital
        let location = body.location;
        if (!location || !location.lat) {
            const hospital = await Hospital.findOne({ hospitalId: body.hospitalId });
            if (hospital) location = hospital.location;
            else location = { lat: 0, lng: 0 };
        }

        const report = new CaseReport({
            hospitalId: body.hospitalId,
            hospitalName: body.hospitalName || "",
            district: body.district || "",
            province: body.province || "",
            location: body.location || {},
            diseaseType: body.diseaseType || "dengue",
            caseCount: parseInt(body.caseCount) || 0,
            confirmedCount: parseInt(body.confirmedCount) || 0,
            confirmedNS1: parseInt(body.confirmedNS1) || 0,
            confirmedIgM: parseInt(body.confirmedIgM) || 0,
            suspectedCount: parseInt(body.suspectedCount) || 0,
            deathCount: parseInt(body.deathCount) || 0,

            // Clinical
            dfCount: parseInt(body.dfCount) || 0,
            dhfCount: parseInt(body.dhfCount) || 0,
            severeDengueCount: parseInt(body.severeDengueCount) || 0,
            warningSignsCount: parseInt(body.warningSignsCount) || 0,

            // Demographics
            maleCount: parseInt(body.maleCount) || 0,
            femaleCount: parseInt(body.femaleCount) || 0,
            ageGroup: body.ageGroup || "Mixed",

            severityLevel,
            source: body.source || "Manual",
            notes: body.notes || "",
            reportedAt: reportDate,
            weekNumber,
            month,
            year,
            verified: body.verified !== undefined ? body.verified : true,
        });

        await report.save();
        res.json({ success: true, data: report });
    } catch (e) {
        console.error("Case report POST error:", e.message);
        res.status(500).json({ success: false, message: e.message });
    }
});

// GET /api/case-reports — List reports (with filtering)
router.get("/", async (req, res) => {
    try {
        const { hospitalId, district, diseaseType, verified, limit = 100 } = req.query;
        const query = {};
        if (hospitalId) query.hospitalId = hospitalId;
        if (district) query.district = district;
        if (diseaseType) query.diseaseType = diseaseType;
        if (verified !== undefined) query.verified = verified === 'true';

        const reports = await CaseReport.find(query).sort({ reportedAt: -1 }).limit(Number(limit));
        res.json({ success: true, data: reports, count: reports.length });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

// GET /api/case-reports/count — Get total count
router.get("/count", async (req, res) => {
    try {
        const count = await CaseReport.countDocuments();
        res.json({ success: true, count });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

// GET /api/case-reports/stats — Get analytics stats
router.get("/stats", async (req, res) => {
    try {
        const totalReports = await CaseReport.countDocuments();
        const verifiedReports = await CaseReport.countDocuments({ verified: true });
        const mlRecords = await CaseReport.countDocuments({ source: "ML Gap-Fill" });

        // Calculate average cases per week
        const casesByWeek = await CaseReport.aggregate([
            { $group: { _id: { year: "$year", week: "$weekNumber" }, total: { $sum: "$caseCount" } } }
        ]);
        const avgCasesPerWeek = casesByWeek.length ? Math.round(casesByWeek.reduce((acc, curr) => acc + curr.total, 0) / casesByWeek.length) : 0;

        // Cases by district
        const districtCases = await CaseReport.aggregate([
            { $group: { _id: "$district", count: { $sum: "$caseCount" } } },
            { $sort: { count: -1 } }
        ]);
        const mostAffected = districtCases.length ? districtCases[0]._id : "N/A";
        const top10Districts = districtCases.slice(0, 10).map(d => ({ district: d._id || "Unknown", cases: d.count }));

        // Accuracy timeline
        const monthlyStats = await CaseReport.aggregate([
            {
                $group: {
                    _id: { year: "$year", month: "$month" },
                    total: { $sum: 1 },
                    verified: { $sum: { $cond: ["$verified", 1, 0] } }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        const accuracyTimeline = monthlyStats.map(m => {
            const date = new Date(m._id.year, m._id.month - 1);
            const monthStr = date.toLocaleString('default', { month: 'short' }) + ' ' + date.getFullYear().toString().slice(-2);
            return {
                month: monthStr,
                accuracy: m.total > 0 ? Math.round((m.verified / m.total) * 100) : 0
            };
        });

        const dataAccuracy = totalReports > 0 ? Math.round((verifiedReports / totalReports) * 100) : 0;

        res.json({
            success: true,
            data: {
                totalReports,
                verifiedReports,
                mlRecords,
                avgCasesPerWeek,
                mostAffected,
                top10Districts,
                accuracyTimeline,
                dataAccuracy
            }
        });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

// GET /api/case-reports/:id — Get single report
router.get("/:id", async (req, res) => {
    try {
        const report = await CaseReport.findById(req.params.id);
        if (!report) return res.status(404).json({ success: false, message: "Report not found" });
        res.json({ success: true, data: report });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

// POST /api/case-reports/batch — receives historical data from Colab
router.post("/batch", async (req, res) => {
    try {
        const { api_key, reports } = req.body;

        // API key check
        if (api_key !== process.env.PREDICTION_API_KEY) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        if (!Array.isArray(reports) || reports.length === 0) {
            return res.status(400).json({ success: false, message: "No reports provided" });
        }

        // Upsert by hospitalId + weekNumber + year + diseaseType to avoid duplicates
        const ops = reports.map(r => {
            // Map severity to ensure it passes enum validation
            if (r.severityLevel) r.severityLevel = mapSeverity(r.severityLevel);

            return {
                updateOne: {
                    filter: {
                        hospitalId: r.hospitalId,
                        weekNumber: r.weekNumber,
                        year: r.year,
                        diseaseType: r.diseaseType,
                    },
                    update: { $set: r },
                    upsert: true,
                }
            };
        });

        const result = await CaseReport.bulkWrite(ops);

        res.json({
            success: true,
            inserted: result.upsertedCount,
            modified: result.modifiedCount,
            total: reports.length,
        });

    } catch (e) {
        console.error("Batch insert error:", e.message);
        res.status(500).json({ success: false, message: e.message });
    }
});

// PUT /api/case-reports/:id — Update an existing report
router.put("/:id", async (req, res) => {
    try {
        const body = req.body;
        const reportId = req.params.id;

        const original = await CaseReport.findById(reportId);
        if (!original) return res.status(404).json({ success: false, message: "Report not found" });

        const updateData = { ...body };

        // If date changed, recalculate week, month, year
        if (body.reportedAt) {
            const reportDate = new Date(body.reportedAt);
            const year = reportDate.getFullYear();
            const month = reportDate.getMonth() + 1;

            const d = new Date(Date.UTC(year, reportDate.getMonth(), reportDate.getDate()));
            const dy = d.getUTCDay() || 7;
            d.setUTCDate(d.getUTCDate() + 4 - dy);
            const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
            const weekNumber = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);

            updateData.weekNumber = weekNumber;
            updateData.month = month;
            updateData.year = year;
            updateData.reportedAt = reportDate;
        }

        if (body.severityLevel) {
            updateData.severityLevel = mapSeverity(body.severityLevel);
        }

        const updated = await CaseReport.findByIdAndUpdate(reportId, updateData, { new: true });
        res.json({ success: true, data: updated });
    } catch (e) {
        console.error("Case report PUT error:", e.message);
        res.status(500).json({ success: false, message: e.message });
    }
});

// DELETE /api/case-reports/:id — Delete a report
router.delete("/:id", async (req, res) => {
    try {
        const deleted = await CaseReport.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ success: false, message: "Report not found" });
        res.json({ success: true, message: "Report deleted successfully" });
    } catch (e) {
        console.error("Case report DELETE error:", e.message);
        res.status(500).json({ success: false, message: e.message });
    }
});

module.exports = router;
