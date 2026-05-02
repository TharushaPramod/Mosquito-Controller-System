// controllers/phi_allocation_controller.js
const PHIAllocation = require("../models/PHIAllocation");

// GET /api/phi-allocations
// Optional query params: district, weekNumber, status
const getAllocations = async (req, res) => {
    try {
        const { district, weekNumber, status } = req.query;
        const filter = {};
        if (district) filter.district = { $regex: new RegExp(`^${district}$`, "i") };
        if (weekNumber) filter.weekNumber = Number(weekNumber);
        if (status) filter.status = status;

        const data = await PHIAllocation.find(filter).sort({ createdAt: -1 });
        res.json({ success: true, count: data.length, data });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};

// POST /api/phi-allocations
// Body: { district, predictedCases, assignedPHIId, assignedPHIName, weekNumber, assignedBy, recommendedCount }
const createAllocation = async (req, res) => {
    try {
        const {
            district,
            predictedCases,
            assignedPHIId,
            assignedPHIName,
            weekNumber,
            assignedBy,
            recommendedCount,
        } = req.body;

        // Basic validation
        if (!district || predictedCases == null || !assignedPHIId || !assignedPHIName || !weekNumber || !assignedBy) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: district, predictedCases, assignedPHIId, assignedPHIName, weekNumber, assignedBy",
            });
        }

        const allocation = new PHIAllocation({
            district,
            predictedCases,
            assignedPHIId,
            assignedPHIName,
            weekNumber,
            assignedBy,
            recommendedCount,
            status: "assigned",
        });

        const saved = await allocation.save();
        res.status(201).json({ success: true, data: saved });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};

module.exports = { getAllocations, createAllocation };
