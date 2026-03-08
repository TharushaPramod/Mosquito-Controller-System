const { getDb } = require("../config/firebase");
const { getCachedPredictions } = require("./prediction.service");

// ── Main heatmap data ────────────────────────────────────────
// Used by: SriLankaMap.jsx (district fill colors + popups)
//          Map.jsx sidebar stats
const getHeatmapData = async (filters = {}) => {
    const db = getDb();
    const caseData = await getCurrentCaseData(db, filters);

    // Merge in ML predictions (cached, avoids re-running model every request)
    let predictions = [];
    try { predictions = await getCachedPredictions(); }
    catch (e) { console.warn("Predictions unavailable:", e.message); }

    const predMap = {};
    predictions.forEach(p => { predMap[p.district] = p; });

    const points = caseData.map(d => ({
        district: d.district,
        province: d.province,
        lat: d.latitude,
        lng: d.longitude,
        currentCases: d.totalCases,
        dengueCases: d.dengueCases,
        chikungunyaCases: d.chikungunyaCases,
        riskLevel: d.riskLevel,
        // ML overlay (null until predictions are generated)
        predictedRiskLevel: predMap[d.district]?.riskLevel || null,
        predictedRiskScore: predMap[d.district]?.predictedRiskScore || null,
        predictedCases: predMap[d.district]?.predictedCaseCount || null,
        // Worst of current vs predicted — this is what SriLankaMap uses for color
        effectiveRisk: worstRisk(d.riskLevel, predMap[d.district]?.riskLevel),
        intensity: Math.min(d.totalCases / 200, 1.0), // 0-1 for heatmap opacity
    }));

    return {
        points,
        summary: {
            totalDistricts: points.length,
            highRisk: points.filter(p => p.effectiveRisk === "high").length,
            mediumRisk: points.filter(p => p.effectiveRisk === "medium").length,
            lowRisk: points.filter(p => p.effectiveRisk === "low").length,
            totalCurrentCases: points.reduce((s, p) => s + p.currentCases, 0),
        },
        generatedAt: new Date().toISOString(),
    };
};

// ── District detail for popup / FacilityDetail Map tab ───────
const getDistrictDetail = async (district) => {
    const db = getDb();
    const ago = new Date(Date.now() - 30 * 86400000).toISOString();
    const snap = await db.collection("hospitalCases")
        .where("district", "==", district)
        .where("createdAt", ">=", ago)
        .orderBy("createdAt", "desc")
        .get();

    const cases = snap.docs.map(d => d.data());

    const weekly = {};
    cases.forEach(c => {
        const k = c.year + "-W" + String(c.weekNumber).padStart(2, "0");
        if (!weekly[k]) weekly[k] = { week: k, dengue: 0, chikungunya: 0, total: 0 };
        if (c.diseaseType === "dengue") weekly[k].dengue += c.caseCount;
        if (c.diseaseType === "chikungunya") weekly[k].chikungunya += c.caseCount;
        weekly[k].total += c.caseCount;
    });

    let prediction = null;
    try { const p = await getCachedPredictions({ district }); prediction = p[0] || null; }
    catch { }

    return {
        district,
        totalCases: cases.reduce((s, c) => s + c.caseCount, 0),
        dengueCases: cases.filter(c => c.diseaseType === "dengue").reduce((s, c) => s + c.caseCount, 0),
        chikungunyaCases: cases.filter(c => c.diseaseType === "chikungunya").reduce((s, c) => s + c.caseCount, 0),
        weeklyBreakdown: Object.values(weekly).sort((a, b) => a.week.localeCompare(b.week)),
        outbreakClusters: cases.slice(0, 10).map(c => ({
            position: [c.latitude, c.longitude],
            cases: c.caseCount,
            risk: c.caseCount >= 20 ? "high" : c.caseCount >= 8 ? "medium" : "low",
            color: c.caseCount >= 20 ? "#FF5252" : c.caseCount >= 8 ? "#FFB142" : "#4BC0C0",
        })),
        prediction,
        generatedAt: new Date().toISOString(),
    };
};

// ── Time-series frames for animated heatmap ──────────────────
const getTimeSeriesHeatmap = async (diseaseType = null, weeks = 12) => {
    const db = getDb();
    const start = new Date(Date.now() - weeks * 7 * 86400000).toISOString();
    let q = db.collection("hospitalCases").where("createdAt", ">=", start);
    if (diseaseType) q = q.where("diseaseType", "==", diseaseType);

    const snap = await q.orderBy("createdAt", "asc").get();
    const cases = snap.docs.map(d => d.data());

    const frames = {};
    cases.forEach(c => {
        const wk = c.year + "-W" + String(c.weekNumber).padStart(2, "0");
        if (!frames[wk]) frames[wk] = {};
        if (!frames[wk][c.district]) frames[wk][c.district] = { district: c.district, lat: c.latitude, lng: c.longitude, cases: 0 };
        frames[wk][c.district].cases += c.caseCount;
    });

    return {
        frames: Object.entries(frames).sort(([a], [b]) => a.localeCompare(b)).map(([week, d]) => ({
            week,
            points: Object.values(d).map(p => ({
                ...p,
                intensity: Math.min(p.cases / 200, 1),
                riskLevel: p.cases >= 100 ? "high" : p.cases >= 30 ? "medium" : "low",
            })),
        })),
    };
};

// ── Helpers ──────────────────────────────────────────────────
const getCurrentCaseData = async (db, filters) => {
    const ago = new Date(Date.now() - 30 * 86400000).toISOString();
    let q = db.collection("hospitalCases").where("createdAt", ">=", ago);
    if (filters.diseaseType) q = q.where("diseaseType", "==", filters.diseaseType);
    if (filters.province) q = q.where("province", "==", filters.province);

    const snap = await q.get();
    const cases = snap.docs.map(d => d.data());
    const map = {};

    cases.forEach(c => {
        if (!map[c.district]) map[c.district] = { district: c.district, province: c.province, latitude: c.latitude, longitude: c.longitude, totalCases: 0, dengueCases: 0, chikungunyaCases: 0 };
        map[c.district].totalCases += c.caseCount;
        if (c.diseaseType === "dengue") map[c.district].dengueCases += c.caseCount;
        if (c.diseaseType === "chikungunya") map[c.district].chikungunyaCases += c.caseCount;
    });

    return Object.values(map).map(d => ({
        ...d,
        riskLevel: d.totalCases >= 100 ? "high" : d.totalCases >= 30 ? "medium" : "low",
    }));
};

const LEVELS = { low: 0, medium: 1, high: 2 };
const worstRisk = (a, b) => {
    const max = Math.max(LEVELS[a] || 0, LEVELS[b] || 0);
    return Object.keys(LEVELS).find(k => LEVELS[k] === max) || "low";
};

module.exports = { getHeatmapData, getDistrictDetail, getTimeSeriesHeatmap };