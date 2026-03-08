// services/alert.service.js
// Generates real-time alerts from CaseReport + Prediction data

const CaseReport = require("../models/CaseReport");
const Prediction = require("../models/prediction");

const SEVERITY = (cases) => cases >= 200 ? "Critical" : cases >= 100 ? "High" : cases >= 30 ? "Medium" : "Low";

const getAlerts = async () => {
    const alerts = [];
    const now = new Date();
    const weekAgo = new Date(Date.now() - 7 * 24 * 3600000);
    const prevWeek = new Date(Date.now() - 14 * 24 * 3600000);

    // ── 1. Outbreak alerts: districts with high cases this week ──────────
    const thisWeekByDistrict = await CaseReport.aggregate([
        { $match: { reportedAt: { $gte: weekAgo } } },
        {
            $group: {
                _id: "$district",
                cases: { $sum: "$caseCount" },
                province: { $first: "$province" },
            }
        },
        { $match: { cases: { $gte: 30 } } },
        { $sort: { cases: -1 } },
        { $limit: 10 },
    ]);

    // Get previous week for comparison
    const prevWeekByDistrict = await CaseReport.aggregate([
        { $match: { reportedAt: { $gte: prevWeek, $lt: weekAgo } } },
        { $group: { _id: "$district", cases: { $sum: "$caseCount" } } },
    ]);
    const prevMap = {};
    prevWeekByDistrict.forEach(d => { prevMap[d._id] = d.cases; });

    thisWeekByDistrict.forEach((d, i) => {
        const prev = prevMap[d._id] || 0;
        const change = prev > 0 ? Math.round((d.cases - prev) / prev * 100) : 100;
        const sev = SEVERITY(d.cases);
        const isSpike = change >= 50;

        alerts.push({
            id: `outbreak-${d._id}-${Date.now()}`,
            title: isSpike
                ? `Dengue Spike Detected — ${d._id}`
                : `High Dengue Activity — ${d._id}`,
            description: isSpike
                ? `${d.cases} cases reported this week in ${d._id} (${change > 0 ? '+' : ''}${change}% vs last week).`
                : `${d.cases} cases reported this week in ${d._id}, ${d.province} Province.`,
            severity: sev,
            date: now.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
            time: now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
            type: "Outbreak",
            district: d._id,
            cases: d.cases,
            change,
        });
    });

    // ── 2. Prediction alerts: ML-predicted high risk districts ───────────
    const highRiskPreds = await Prediction.aggregate([
        { $match: { data_type: { $in: ["predicted", "gap_fill"] }, risk_level: { $in: ["high", "medium"] } } },
        { $sort: { generated_at: -1 } },
        {
            $group: {
                _id: "$district",
                risk_level: { $first: "$risk_level" },
                predicted_cases: { $first: "$predicted_cases" },
                week_start: { $first: "$week_start" },
            }
        },
        { $sort: { predicted_cases: -1 } },
        { $limit: 5 },
    ]);

    highRiskPreds.forEach(p => {
        const districtName = p._id.charAt(0) + p._id.slice(1).toLowerCase();
        alerts.push({
            id: `prediction-${p._id}-${Date.now()}`,
            title: `ML Forecast: ${p.risk_level === "high" ? "High" : "Elevated"} Risk — ${districtName}`,
            description: `XGBoost model predicts ~${Math.round(p.predicted_cases)} dengue cases for ${districtName}. Early intervention recommended.`,
            severity: p.risk_level === "high" ? "High" : "Medium",
            date: now.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
            time: now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
            type: "Prediction",
            district: districtName,
            predictedCases: Math.round(p.predicted_cases),
        });
    });

    // ── 3. Pending reports alert ─────────────────────────────────────────
    const pendingCount = await CaseReport.countDocuments({
        verified: false,
        reportedAt: { $gte: new Date(Date.now() - 48 * 3600000) },
    });
    if (pendingCount > 0) {
        alerts.push({
            id: `pending-${Date.now()}`,
            title: `${pendingCount} Unverified Facility Report${pendingCount > 1 ? "s" : ""} Pending`,
            description: `${pendingCount} health facility report${pendingCount > 1 ? "s" : ""} submitted in the last 48 hours awaiting verification.`,
            severity: pendingCount >= 5 ? "High" : "Medium",
            date: now.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
            time: now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
            type: "Facility",
        });
    }

    // ── 4. System alert: data freshness check ────────────────────────────
    const latestRecord = await CaseReport.findOne().sort({ reportedAt: -1 });
    if (latestRecord) {
        const daysSinceUpdate = Math.floor((now - latestRecord.reportedAt) / (24 * 3600000));
        if (daysSinceUpdate > 7) {
            alerts.push({
                id: `system-stale-${Date.now()}`,
                title: "Health Data Not Updated Recently",
                description: `Last case report was ${daysSinceUpdate} days ago. Please ensure hospital data sync is running.`,
                severity: "High",
                date: now.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
                time: now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
                type: "System",
            });
        } else {
            alerts.push({
                id: `system-ok-${Date.now()}`,
                title: "Health Data Sync Active",
                description: `System is up to date. Last record received ${daysSinceUpdate === 0 ? "today" : daysSinceUpdate + " day(s) ago"}.`,
                severity: "Low",
                date: now.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
                time: now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
                type: "System",
            });
        }
    }

    // Sort: Critical → High → Medium → Low
    const order = { Critical: 0, High: 1, Medium: 2, Low: 3 };
    alerts.sort((a, b) => order[a.severity] - order[b.severity]);

    return alerts;
};

module.exports = { getAlerts };
