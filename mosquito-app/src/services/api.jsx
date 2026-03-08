// services/api.jsx — Central API service
const BASE = import.meta.env.VITE_API_URL;

const req = async (path, opts = {}) => {
    const token = localStorage.getItem("authToken");
    const res = await fetch(BASE + path, {
        headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: "Bearer " + token }),
            ...opts.headers,
        },
        ...opts,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "API error");
    return data;
};

// ── Dashboard ────────────────────────────────────────────────
export const dashboardApi = {
    getCasesByDistrict: (month, year) =>
        req("/hospitals/cases/by-district?month=" + month + "&year=" + year),
    getHeatmapData: (diseaseType) =>
        req("/heatmap" + (diseaseType ? "?diseaseType=" + diseaseType : "")),
    getCaseTrend: (district = "Colombo") =>
        req("/hospitals/cases/" + district + "/trend"),
    getLatestAlerts: () => req("/notifications/alerts?limit=3"),
    // NEW — risk summary stat cards (High/Medium/Low district counts)
    getRiskSummary: () => req("/predictions/risk-summary"),
};

// ── Map ──────────────────────────────────────────────────────
export const mapApi = {
    getHeatmapData: (filters = {}) => req("/heatmap?" + new URLSearchParams(filters)),
    getDistrictDetail: (district) => req("/heatmap/district/" + district),
    getHospitals: () => req("/hospitals"),
    getTimeSeriesData: (weeks = 12) => req("/heatmap/timeseries?weeks=" + weeks),
    // NEW — ML forecast overlay on map
    getAllForecasts: () => req("/predictions/all"),
};

// ── Alerts ───────────────────────────────────────────────────
export const alertsApi = {
    getAlerts: (filters = {}) =>
        req("/notifications/alerts?" + new URLSearchParams(filters)),
    createAlert: (data) =>
        req("/notifications/alerts", { method: "POST", body: JSON.stringify(data) }),
    subscribeToNotifications: (token, district) =>
        req("/notifications/subscribe", {
            method: "POST",
            body: JSON.stringify({
                token,
                topic: district
                    ? "district_" + district.toLowerCase().replace(/\s+/g, "_")
                    : "public_alerts",
            }),
        }),
};

// ── Data Integration ─────────────────────────────────────────
export const dataIntegrationApi = {
    getFacilities: (filters = {}) => req("/hospitals?" + new URLSearchParams(filters)),
    registerFacility: (data) => req("/hospitals/register", { method: "POST", body: JSON.stringify(data) }),
    getOutbreakHistory: (filters = {}) => req("/hospitals/cases/by-district?" + new URLSearchParams(filters)),
    getOutbreakTimeline: (district) => req("/hospitals/cases/" + district + "/trend"),
};

// ── Facility Detail ──────────────────────────────────────────
export const facilityApi = {
    getDailyReports: (hospitalId, page = 1, limit = 10) =>
        req("/hospitals/cases?hospitalId=" + hospitalId + "&limit=" + limit),
    getFacilityTrend: (district) => req("/hospitals/cases/" + district + "/trend"),
    getNearbyOutbreaks: (district) => req("/heatmap/district/" + district),
    submitCaseReport: (data, apiKey) =>
        req("/hospitals/cases", {
            method: "POST",
            headers: { "X-Hospital-API-Key": apiKey },
            body: JSON.stringify(data),
        }),
};

// ── Predictions ──────────────────────────────────────────────
export const predictionApi = {
    // 2-week forecast for one district
    getDistrictForecast: (district) =>
        req("/predictions/district/" + district),

    // All districts latest forecast — for heatmap ML overlay
    getAllForecasts: () =>
        req("/predictions/all"),

    // Full timeline (actual + predicted) — for TrendChart
    getTimeline: (district, weeks = 24) =>
        req("/predictions/timeline/" + district + "?weeks=" + weeks),

    // Dashboard stat cards
    getRiskSummary: () =>
        req("/predictions/risk-summary"),
};
