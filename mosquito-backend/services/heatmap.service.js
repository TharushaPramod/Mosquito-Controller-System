// services/heatmap.service.js
// Rewritten to use MongoDB (CaseReport) instead of Firebase

const CaseReport = require("../models/CaseReport");
const Prediction = require("../models/prediction");

const RISK_LEVEL = (cases) => cases >= 100 ? "high" : cases >= 30 ? "medium" : "low";
const WORST = (a, b) => ["high", "medium", "low"].find(r => [a, b].includes(r)) || "low";

// GET /api/heatmap
// District coordinates & province lookup
const DISTRICT_META = {
    "Colombo": { province: "Western", lat: 6.9271, lng: 79.8612 },
    "Gampaha": { province: "Western", lat: 7.0873, lng: 80.0144 },
    "Kalutara": { province: "Western", lat: 6.5854, lng: 79.9607 },
    "Kandy": { province: "Central", lat: 7.2906, lng: 80.6337 },
    "Matale": { province: "Central", lat: 7.4675, lng: 80.6234 },
    "Nuwara Eliya": { province: "Central", lat: 6.9497, lng: 80.7891 },
    "Galle": { province: "Southern", lat: 6.0535, lng: 80.2210 },
    "Matara": { province: "Southern", lat: 5.9549, lng: 80.5550 },
    "Hambantota": { province: "Southern", lat: 6.1429, lng: 81.1212 },
    "Jaffna": { province: "Northern", lat: 9.6615, lng: 80.0255 },
    "Kilinochchi": { province: "Northern", lat: 9.3803, lng: 80.4006 },
    "Mannar": { province: "Northern", lat: 8.9810, lng: 79.9044 },
    "Vavuniya": { province: "Northern", lat: 8.7514, lng: 80.4971 },
    "Mullaitivu": { province: "Northern", lat: 9.2671, lng: 80.8128 },
    "Batticaloa": { province: "Eastern", lat: 7.7170, lng: 81.7004 },
    "Ampara": { province: "Eastern", lat: 7.3004, lng: 81.6738 },
    "Trincomalee": { province: "Eastern", lat: 8.5874, lng: 81.2152 },
    "Kurunegala": { province: "North Western", lat: 7.4867, lng: 80.3647 },
    "Puttalam": { province: "North Western", lat: 8.0362, lng: 79.8283 },
    "Anuradhapura": { province: "North Central", lat: 8.3114, lng: 80.4037 },
    "Polonnaruwa": { province: "North Central", lat: 7.9403, lng: 81.0188 },
    "Badulla": { province: "Uva", lat: 6.9934, lng: 81.0550 },
    "Moneragala": { province: "Uva", lat: 6.8727, lng: 81.3506 },
    "Ratnapura": { province: "Sabaragamuwa", lat: 6.6828, lng: 80.3992 },
    "Kegalle": { province: "Sabaragamuwa", lat: 7.2513, lng: 80.3464 },
    "Kalmunai": { province: "Eastern", lat: 7.4148, lng: 81.8261 },
};

const getHeatmapData = async (filters = {}) => {
    // Real cases: last 30 days
    const ago = new Date(Date.now() - 30 * 24 * 3600000);
    const match = { reportedAt: { $gte: ago } };
    if (filters.diseaseType) match.diseaseType = filters.diseaseType;
    if (filters.province) match.province = filters.province;

    const cases = await CaseReport.aggregate([
        { $match: match },
        {
            $group: {
                _id: "$district",
                district: { $first: "$district" },
                province: { $first: "$province" },
                lat: { $first: "$location.lat" },
                lng: { $first: "$location.lng" },
                totalCases: { $sum: "$caseCount" },
                dengueCases: { $sum: { $cond: [{ $eq: ["$diseaseType", "dengue"] }, "$caseCount", 0] } },
                chikungunyaCases: { $sum: { $cond: [{ $eq: ["$diseaseType", "chikungunya"] }, "$caseCount", 0] } },
            }
        },
    ]);

    // Gap-fill + predictions from ML model (covers Sep 2025 → Mar 2026)
    const preds = await Prediction.aggregate([
        { $match: { data_type: { $in: ["predicted", "gap_fill"] } } },
        { $sort: { generated_at: -1 } },
        {
            $group: {
                _id: "$district",
                risk_level: { $first: "$risk_level" },
                predicted_cases: { $first: "$predicted_cases" },
            }
        },
    ]);
    const predMap = {};
    preds.forEach(p => { predMap[p._id] = p; });

    // Build a map of real cases by district (uppercase key)
    const realMap = {};
    cases.forEach(d => { realMap[d.district?.toUpperCase()] = d; });

    // Merge: all 26 districts always appear, using gap-fill where no real data
    const points = Object.entries(DISTRICT_META).map(([districtName, meta]) => {
        const key = districtName.toUpperCase();
        const real = realMap[key];
        const pred = predMap[key];

        const realCases = real?.totalCases || 0;
        const predCases = pred?.predicted_cases || 0;
        // Use predicted cases when no real recent data available
        const displayCases = realCases > 0 ? realCases : predCases;

        const riskLevel = RISK_LEVEL(realCases);
        const predRiskLevel = pred?.risk_level || RISK_LEVEL(predCases);
        const effectiveRisk = realCases > 0 ? WORST(riskLevel, predRiskLevel) : predRiskLevel || "low";
        const isGapFill = realCases === 0 && predCases > 0;

        return {
            district: districtName,
            province: real?.province || meta.province,
            lat: real?.lat || meta.lat,
            lng: real?.lng || meta.lng,
            currentCases: realCases,
            displayCases,
            dengueCases: real?.dengueCases || 0,
            chikungunyaCases: real?.chikungunyaCases || 0,
            riskLevel,
            predictedRiskLevel: predRiskLevel,
            predictedCases: predCases,
            effectiveRisk,
            isGapFill,          // true = coloured from ML prediction
            intensity: Math.min(displayCases / 200, 1.0),
        };
    });

    return {
        points,
        summary: {
            totalDistricts: points.length,
            highRisk: points.filter(p => p.effectiveRisk === "high").length,
            mediumRisk: points.filter(p => p.effectiveRisk === "medium").length,
            lowRisk: points.filter(p => p.effectiveRisk === "low").length,
            totalCurrentCases: points.reduce((s, p) => s + p.displayCases, 0),
            usingGapFill: points.filter(p => p.isGapFill).length,
        },
        generatedAt: new Date().toISOString(),
    };
};

// GET /api/heatmap/district/:district
const getDistrictDetail = async (district) => {
    const ago = new Date(Date.now() - 30 * 24 * 3600000);
    const cases = await CaseReport.find({
        district: { $regex: new RegExp("^" + district + "$", "i") },
        reportedAt: { $gte: ago },
    }).sort({ reportedAt: -1 });

    const weekly = {};
    cases.forEach(c => {
        const k = c.year + "-W" + String(c.weekNumber).padStart(2, "0");
        if (!weekly[k]) weekly[k] = { week: k, dengue: 0, chikungunya: 0, total: 0 };
        if (c.diseaseType === "dengue") weekly[k].dengue += c.caseCount;
        if (c.diseaseType === "chikungunya") weekly[k].chikungunya += c.caseCount;
        weekly[k].total += c.caseCount;
    });

    const pred = await Prediction.findOne({
        district: district.toUpperCase(),
        data_type: { $in: ["predicted", "gap_fill"] },
    }).sort({ generated_at: -1 });

    return {
        district,
        totalCases: cases.reduce((s, c) => s + c.caseCount, 0),
        dengueCases: cases.filter(c => c.diseaseType === "dengue").reduce((s, c) => s + c.caseCount, 0),
        chikungunyaCases: cases.filter(c => c.diseaseType === "chikungunya").reduce((s, c) => s + c.caseCount, 0),
        weeklyBreakdown: Object.values(weekly).sort((a, b) => a.week.localeCompare(b.week)),
        prediction: pred ? { risk_level: pred.risk_level, predicted_cases: pred.predicted_cases } : null,
        generatedAt: new Date().toISOString(),
    };
};

// GET /api/heatmap/timeseries
const getTimeSeriesHeatmap = async (diseaseType = null, weeks = 12) => {
    const ago = new Date(Date.now() - weeks * 7 * 24 * 3600000);
    const match = { reportedAt: { $gte: ago } };
    if (diseaseType) match.diseaseType = diseaseType;

    const cases = await CaseReport.find(match).sort({ reportedAt: 1 });

    const frames = {};
    cases.forEach(c => {
        const wk = c.year + "-W" + String(c.weekNumber).padStart(2, "0");
        if (!frames[wk]) frames[wk] = {};
        if (!frames[wk][c.district]) frames[wk][c.district] = { district: c.district, lat: c.location?.lat, lng: c.location?.lng, cases: 0 };
        frames[wk][c.district].cases += c.caseCount;
    });

    return {
        frames: Object.entries(frames).sort(([a], [b]) => a.localeCompare(b)).map(([week, d]) => ({
            week,
            points: Object.values(d).map(p => ({
                ...p,
                intensity: Math.min(p.cases / 200, 1),
                riskLevel: RISK_LEVEL(p.cases),
            })),
        })),
    };
};

// GET /api/heatmap/dashboard-stats — for StatCards
const getDashboardStats = async () => {
    const now = new Date();
    // Use UTC-based today boundary so records saved as UTC midnight are included
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const weekAgo = new Date(Date.now() - 7 * 24 * 3600000);
    const prevWeek = new Date(Date.now() - 14 * 24 * 3600000);

    const [todayStats, thisWeek, lastWeek, allTimeDeaths] = await Promise.all([
        CaseReport.aggregate([{ $match: { reportedAt: { $gte: todayUTC } } },
        { $group: { _id: null, cases: { $sum: "$caseCount" }, deaths: { $sum: "$deathCount" } } }]),
        CaseReport.aggregate([{ $match: { reportedAt: { $gte: weekAgo } } },
        { $group: { _id: null, total: { $sum: "$caseCount" } } }]),
        CaseReport.aggregate([{ $match: { reportedAt: { $gte: prevWeek, $lt: weekAgo } } },
        { $group: { _id: null, total: { $sum: "$caseCount" } } }]),
        CaseReport.aggregate([{ $group: { _id: null, total: { $sum: "$deathCount" } } }]),
    ]);

    const todayVal = todayStats[0]?.cases || 0;
    const todayDeaths = todayStats[0]?.deaths || 0;
    const thisWeekVal = thisWeek[0]?.total || 0;
    const lastWeekVal = lastWeek[0]?.total || 0;
    const totalDeaths = allTimeDeaths[0]?.total || 0;

    const weekChange = lastWeekVal === 0
        ? (thisWeekVal > 0 ? 100 : 0)
        : Math.round((thisWeekVal - lastWeekVal) / lastWeekVal * 100);

    // Active outbreaks = districts with >100 cases in last 7 days
    const activeDistricts = await CaseReport.aggregate([
        { $match: { reportedAt: { $gte: weekAgo } } },
        { $group: { _id: "$district", total: { $sum: "$caseCount" } } },
        { $match: { total: { $gte: 100 } } },
    ]);

    // High risk areas count (from our unified heatmap logic)
    const heatmapRes = await getHeatmapData();
    const highRiskAreas = heatmapRes.summary.highRisk;

    // Pending = unverified reports in last 48h
    const pending = await CaseReport.countDocuments({
        verified: false,
        reportedAt: { $gte: new Date(Date.now() - 48 * 3600000) },
    });

    return {
        todayCases: todayVal,
        todayDeaths: todayDeaths,
        totalDeaths: totalDeaths,
        thisWeekCases: thisWeekVal,
        weekChange,
        activeOutbreaks: activeDistricts.length,
        highRiskAreas: highRiskAreas,
        pendingReports: pending,
    };
};

// GET /api/heatmap/trend — last 14 WEEKS trend for TrendChart
const getTrend = async (district = null) => {
    const weeksAgo = new Date(Date.now() - 14 * 7 * 24 * 3600000);
    const match = { reportedAt: { $gte: weeksAgo } };
    if (district) match.district = { $regex: new RegExp("^" + district + "$", "i") };

    const results = await CaseReport.aggregate([
        { $match: match },
        {
            $group: {
                _id: { year: "$year", week: "$weekNumber" },
                cases: { $sum: "$caseCount" },
                deaths: { $sum: "$deathCount" },
                date: { $min: "$reportedAt" },
            }
        },
        { $sort: { "_id.year": 1, "_id.week": 1 } },
        { $limit: 14 },
    ]);

    return results.map(r => ({
        name: "W" + r._id.week,
        date: new Date(r.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
        cases: r.cases || 0,
        recovered: Math.round((r.cases || 0) * 0.75),
        active: Math.round((r.cases || 0) * 0.25),
    }));
};

// GET /api/heatmap/outbreak-history — for Past Outbreak History tab
const getOutbreakHistory = async (filters = {}) => {
    const match = {};
    if (filters.district && filters.district !== "All")
        match.district = { $regex: new RegExp("^" + filters.district + "$", "i") };
    if (filters.diseaseType && filters.diseaseType !== "All")
        match.diseaseType = filters.diseaseType.toLowerCase();
    if (filters.severity && filters.severity !== "All") {
        const sev = filters.severity.toLowerCase();
        const map = { high: "severe", medium: "moderate", low: "mild" };
        match.severityLevel = map[sev] || sev;
    }
    if (filters.startDate) match.reportedAt = { $gte: new Date(filters.startDate) };
    if (filters.endDate) match.reportedAt = { ...match.reportedAt, $lte: new Date(filters.endDate) };

    // Group by district + year + month for meaningful monthly outbreak periods
    const outbreaks = await CaseReport.aggregate([
        { $match: match },
        {
            $group: {
                _id: { district: "$district", year: "$year", month: "$month" },
                district: { $first: "$district" },
                diseaseType: { $first: "$diseaseType" },
                startDate: { $min: "$reportedAt" },
                endDate: { $max: "$reportedAt" },
                totalCases: { $sum: "$caseCount" },
                totalDeaths: { $sum: "$deathCount" },
                hospitalName: { $first: "$hospitalName" },
            }
        },
        { $sort: { startDate: -1 } },
        { $limit: 1000 },
    ]);

    return outbreaks.map((o, i) => ({
        id: `OB-${o._id.year}-${String(i + 1).padStart(3, "0")}`,
        district: o.district,
        diseaseType: o.diseaseType,
        startDate: o.startDate?.toISOString().split("T")[0],
        endDate: o.endDate?.toISOString().split("T")[0],
        reportedCases: o.totalCases,
        deaths: o.totalDeaths,
        severity: o.totalCases >= 100 ? "HIGH" : o.totalCases >= 30 ? "MEDIUM" : "LOW",
        source: o.hospitalName || "Hospital Report",
    }));
};


// GET /api/heatmap/yearly-stats — dedicated yearly totals for seasonal chart
const getYearlyStats = async (filters = {}) => {
    const match = {};
    if (filters.district && filters.district !== "All")
        match.district = { $regex: new RegExp("^" + filters.district + "$", "i") };
    if (filters.diseaseType && filters.diseaseType !== "All")
        match.diseaseType = filters.diseaseType.toLowerCase();

    const yearly = await CaseReport.aggregate([
        { $match: match },
        {
            $group: {
                _id: "$year",
                cases: { $sum: "$caseCount" },
                deaths: { $sum: "$deathCount" },
                districts: { $addToSet: "$district" },
            }
        },
        { $sort: { _id: 1 } },
    ]);

    const monthly = await CaseReport.aggregate([
        { $match: match },
        {
            $group: {
                _id: { year: "$year", month: "$month" },
                cases: { $sum: "$caseCount" },
            }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    return {
        yearly: yearly.map(y => ({
            name: String(y._id),
            cases: y.cases,
            deaths: y.deaths,
            districts: y.districts.length,
        })),
        monthly: monthly.map(m => ({
            name: new Date(m._id.year, m._id.month - 1, 1)
                .toLocaleDateString("en-GB", { month: "short", year: "2-digit" }),
            year: m._id.year,
            month: m._id.month,
            cases: m.cases,
        })),
    };
};


// GET /api/heatmap/report-stats — for Reports page
const getReportStats = async () => {
    const total = await CaseReport.countDocuments();
    const verified = await CaseReport.countDocuments({ verified: true });
    const accuracy = total > 0 ? ((verified / total) * 100).toFixed(1) : 0;

    // Last month vs previous month count
    const now = new Date();
    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const twoMonthAgo = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate());
    const thisMonth = await CaseReport.countDocuments({ reportedAt: { $gte: monthAgo } });
    const lastMonth = await CaseReport.countDocuments({ reportedAt: { $gte: twoMonthAgo, $lt: monthAgo } });
    const logChange = lastMonth > 0 ? Math.round((thisMonth - lastMonth) / lastMonth * 100) : 100;

    // Auto-generate report cards: one per district per month (last 6 months)
    const reports = await CaseReport.aggregate([
        { $match: { reportedAt: { $gte: new Date(Date.now() - 180 * 24 * 3600000) } } },
        {
            $group: {
                _id: { district: "$district", year: "$year", month: "$month" },
                cases: { $sum: "$caseCount" },
                deaths: { $sum: "$deathCount" },
                province: { $first: "$province" },
                lastDate: { $max: "$reportedAt" },
            }
        },
        { $sort: { lastDate: -1 } },
        { $limit: 30 },
    ]);

    const reportCards = reports.map((r, i) => {
        const monthName = new Date(r._id.year, r._id.month - 1, 1)
            .toLocaleDateString("en-US", { month: "short", year: "numeric" });
        const category = r.cases >= 100 ? "Epidemiology"
            : r.cases >= 30 ? "Operations"
                : "Analytics";
        return {
            id: i + 1,
            title: `${r._id.district} District Outbreak Report — ${monthName}`,
            category,
            date: new Date(r.lastDate).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
            fileSize: (r.cases / 500 + 0.5).toFixed(1) + " MB",
            cases: r.cases,
            deaths: r.deaths,
            district: r._id.district,
            province: r.province,
            type: "PDF",
        };
    });

    return {
        totalReports: reportCards.length,
        automatedLogs: total,
        logChange,
        dataAccuracy: parseFloat(accuracy),
        reports: reportCards,
    };
};

// GET /api/heatmap/submission-status — show who submitted today and who didn't
const getSubmissionStatus = async () => {
    const Hospital = require("../models/hospital");
    const now = new Date();
    const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const todayEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

    const allHospitals = await Hospital.find({ status: { $ne: 'Inactive' } }).lean();
    const todayReports = await CaseReport.find({
        reportedAt: { $gte: todayStart, $lte: todayEnd }
    }).select('hospitalId hospitalName district').lean();

    const submittedIds = new Set(todayReports.map(r => r.hospitalId));

    const submitted = [];
    const pending = [];

    allHospitals.forEach(h => {
        const item = {
            id: h.hospitalId,
            name: h.name,
            district: h.district,
            province: h.province,
            type: h.type
        };
        if (submittedIds.has(h.hospitalId)) {
            submitted.push(item);
        } else {
            pending.push(item);
        }
    });

    return {
        date: todayStart.toISOString().split('T')[0],
        totalFacilities: allHospitals.length,
        submittedCount: submitted.length,
        pendingCount: pending.length,
        submitted,
        pending
    };
};

module.exports = {
    getHeatmapData,
    getReportStats,
    getDistrictDetail,
    getTimeSeriesHeatmap,
    getDashboardStats,
    getTrend,
    getOutbreakHistory,
    getYearlyStats,
    getSubmissionStatus
};
