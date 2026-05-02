const axios = require("axios");
const Prediction = require("../models/prediction");

const FLASK_URL = "http://localhost:5001/predict";

// CO2 level logic
const getCO2Level = (dengueRisk, mosquitoDensity) => {
    if (dengueRisk === "HIGH" && mosquitoDensity === "HIGH") return { level: 100, status: "MAXIMUM", color: "red", action: "Activate all traps immediately" };
    if (dengueRisk === "HIGH" && mosquitoDensity === "MEDIUM") return { level: 75, status: "HIGH", color: "orange", action: "Activate primary traps" };
    if (dengueRisk === "HIGH" && mosquitoDensity === "LOW") return { level: 60, status: "ELEVATED", color: "yellow", action: "Activate traps in high-risk zones" };
    if (dengueRisk === "MEDIUM" && mosquitoDensity === "HIGH") return { level: 60, status: "ELEVATED", color: "yellow", action: "Increase trap sensitivity" };
    if (dengueRisk === "MEDIUM" && mosquitoDensity === "MEDIUM") return { level: 40, status: "MODERATE", color: "blue", action: "Standard trap operation" };
    if (dengueRisk === "LOW" && mosquitoDensity === "LOW") return { level: 20, status: "MINIMAL", color: "green", action: "Minimal trap operation" };
    return { level: 30, status: "LOW", color: "green", action: "Standard operation" };
};

const getDensityRisk = (density) => {
    if (density > 20) return "HIGH";
    if (density > 10) return "MEDIUM";
    return "LOW";
};

const getDengueRisk = (cases) => {
    if (cases > 100) return "HIGH";
    if (cases >= 30) return "MEDIUM";
    return "LOW";
};

exports.getTrapControl = async (req, res) => {
    try {
        const district = req.params.district || null;

        // Get latest dengue predictions from MongoDB
        const dengueQuery = district
            ? { district: district.toUpperCase(), data_type: "predicted" }
            : { data_type: "predicted" };

        const denguePredictions = await Prediction.find(dengueQuery)
            .sort({ iso_week: -1 })
            .limit(district ? 1 : 26);

        // Locations your friend has density data for
        const densityLocations = ["Kelaniya", "Negombo"];

        // Build trap control recommendations
        const trapControls = [];

        for (const pred of denguePredictions) {
            const districtName = pred.district;
            const dengueCases = pred.predicted_cases || pred.week_1_cases || 0;
            const dengueRisk = getDengueRisk(dengueCases);

            let mosquitoDensity = "UNKNOWN";
            let densityValue = null;
            let co2Config;

            // Check if this district has density data
            const matchedLocation = densityLocations.find(loc =>
                districtName.toUpperCase().includes(loc.toUpperCase()) ||
                loc.toUpperCase().includes(districtName.toUpperCase())
            );

            if (matchedLocation) {
                // Would call friend's Flask API here
                // For now use dengue risk only as fallback
                mosquitoDensity = dengueRisk; // approximate
                co2Config = getCO2Level(dengueRisk, mosquitoDensity);
            } else {
                // Only dengue prediction available
                co2Config = getCO2Level(dengueRisk, "MEDIUM");
            }

            trapControls.push({
                district: districtName,
                denguePrediction: Math.round(dengueCases),
                dengueRisk,
                mosquitoDensity,
                densityValue,
                hasDensityData: !!matchedLocation,
                co2Level: co2Config.level,
                trapStatus: co2Config.status,
                statusColor: co2Config.color,
                recommendedAction: co2Config.action,
                weekNumber: pred.iso_week,
                lastUpdated: new Date().toISOString(),
            });
        }

        // Sort by CO2 level descending
        trapControls.sort((a, b) => b.co2Level - a.co2Level);

        res.json({
            success: true,
            totalDistricts: trapControls.length,
            densityDataAvailable: densityLocations,
            data: trapControls,
        });

    } catch (error) {
        console.error("Trap control error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};