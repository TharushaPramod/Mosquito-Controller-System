// services/prediction.service.js
const Prediction = require("../models/prediction");

// ── Called by Colab: bulk-upsert forecast rows ──────────────────────────────
const saveForecastBatch = async (rows) => {
    const ops = rows.map((row) => {
        const risk_level = Prediction.getRiskLevel(row.predicted_cases);
        return {
            updateOne: {
                filter: { district: row.district.toUpperCase(), date: new Date(row.date) },
                update: {
                    $set: {
                        district: row.district.toUpperCase(),
                        date: new Date(row.date),
                        iso_week: row.iso_week ?? null,
                        iso_year: row.iso_year ?? null,
                        predicted_cases: row.predicted_cases,
                        lower_bound: row.lower_bound ?? null,
                        upper_bound: row.upper_bound ?? null,
                        weekly_rainfall: row.weekly_rainfall ?? null,
                        avg_temperature: row.avg_temperature ?? null,
                        risk_level,
                        data_type: row.data_type || "predicted",
                        model_used: row.model_used || "XGBOOST",
                        generated_at: new Date(),
                    },
                },
                upsert: true,
            },
        };
    });

    const result = await Prediction.bulkWrite(ops);
    return {
        upserted: result.upsertedCount,
        modified: result.modifiedCount,
        total: ops.length,
    };
};

// ── GET latest 2-week forecast for one district ──────────────────────────────
const getDistrictForecast = async (district) => {
    const rows = await Prediction.find({
        district: district.toUpperCase(),
        data_type: { $in: ["predicted", "gap_fill"] },
    })
        .sort({ date: -1 })
        .limit(2)
        .lean();

    if (!rows.length) return null;

    return {
        district: district.toUpperCase(),
        forecasts: rows.reverse().map((r) => ({
            date: r.date,
            iso_week: r.iso_week,
            predicted_cases: r.predicted_cases,
            lower_bound: r.lower_bound,
            upper_bound: r.upper_bound,
            risk_level: r.risk_level,
            weekly_rainfall: r.weekly_rainfall,
            avg_temperature: r.avg_temperature,
        })),
        model_used: rows[0].model_used,
        generated_at: rows[0].generated_at,
    };
};

// ── GET all districts latest forecast (for heatmap) ──────────────────────────
const getAllDistrictForecasts = async () => {
    // Get the most recent predicted date
    const latest = await Prediction.findOne({ data_type: { $in: ["predicted", "gap_fill"] } })
        .sort({ generated_at: -1 })
        .lean();

    if (!latest) return [];

    // Get one row per district for that generation batch (within last 7 days)
    const since = new Date(latest.generated_at.getTime() - 7 * 24 * 3600000);

    const rows = await Prediction.aggregate([
        {
            $match: {
                data_type: { $in: ["predicted", "gap_fill"] },
                generated_at: { $gte: since },
            },
        },
        { $sort: { date: 1 } },
        {
            $group: {
                _id: "$district",
                district: { $first: "$district" },
                week_1_date: { $first: "$date" },
                week_1_cases: { $first: "$predicted_cases" },
                week_1_risk: { $first: "$risk_level" },
                week_2_date: { $last: "$date" },
                week_2_cases: { $last: "$predicted_cases" },
                week_2_risk: { $last: "$risk_level" },
                model_used: { $first: "$model_used" },
                generated_at: { $first: "$generated_at" },
            },
        },
        { $sort: { week_1_cases: -1 } },
    ]);

    return rows;
};

// ── GET full timeline for one district (actual + predicted) ──────────────────
const getDistrictTimeline = async (district, weeks = 24) => {
    const rows = await Prediction.find({ district: district.toUpperCase() })
        .sort({ date: -1 })
        .limit(weeks)
        .lean();

    return rows.reverse().map((r) => ({
        date: r.date,
        iso_week: r.iso_week,
        predicted_cases: r.predicted_cases,
        lower_bound: r.lower_bound,
        upper_bound: r.upper_bound,
        risk_level: r.risk_level,
        data_type: r.data_type,
    }));
};

// ── GET risk summary for dashboard stat cards ────────────────────────────────
const getRiskSummary = async () => {
    const since = new Date(Date.now() - 7 * 24 * 3600000);
    const rows = await Prediction.find({
        data_type: { $in: ["predicted", "gap_fill"] },
        generated_at: { $gte: since },
    }).lean();

    const summary = { high: [], medium: [], low: [], total_districts: 0 };
    const seen = new Set();

    rows.forEach((r) => {
        if (!seen.has(r.district)) {
            seen.add(r.district);
            summary[r.risk_level].push(r.district);
            summary.total_districts++;
        }
    });

    return summary;
};

module.exports = {
    saveForecastBatch,
    getDistrictForecast,
    getAllDistrictForecasts,
    getDistrictTimeline,
    getRiskSummary,
};
