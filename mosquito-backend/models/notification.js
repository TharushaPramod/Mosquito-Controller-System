const { getDb, getAdmin } = require("../config/firebase");
const { v4: uuid } = require("uuid");

// ── Send FCM push notification ───────────────────────────────
const sendPush = async ({ title, body, topic, data = {} }) => {
    const msg = {
        notification: { title, body },
        data: { ...data, timestamp: new Date().toISOString() },
        topic,
    };
    const id = await getAdmin().messaging().send(msg);
    return { success: true, messageId: id };
};

// ── Create an alert (stores in Firestore + sends FCM) ────────
// Used by: auto-triggered when case thresholds breach,
//          manual creation by health officers
const createAlert = async (alertData) => {
    const db = getDb();
    const id = uuid();
    const doc = {
        id,
        type: alertData.type,       // "outbreak"|"predictive"|"facility"|"general"
        district: alertData.district || null,
        province: alertData.province || null,
        riskLevel: alertData.riskLevel || "medium",
        // Trilingual fields (match your multilingual awareness module)
        titleEn: alertData.titleEn,
        titleSi: alertData.titleSi || null,
        titleTa: alertData.titleTa || null,
        messageEn: alertData.messageEn,
        messageSi: alertData.messageSi || null,
        messageTa: alertData.messageTa || null,
        diseaseType: alertData.diseaseType || null,
        caseCount: alertData.caseCount || null,
        createdAt: new Date().toISOString(),
        active: true,
        sentToFCM: false,
    };

    await db.collection("alerts").doc(id).set(doc);

    // FCM topic: per-district or global
    const topic = doc.district
        ? "district_" + doc.district.toLowerCase().replace(/s+/g, "_")
        : "public_alerts";

    try {
        await sendPush({
            title: doc.titleEn, body: doc.messageEn, topic,
            data: { alertId: id, type: doc.type, riskLevel: doc.riskLevel, district: doc.district || "" }
        });
        await db.collection("alerts").doc(id).update({ sentToFCM: true });
    } catch (e) {
        console.warn("FCM failed (alert still saved):", e.message);
    }

    return doc;
};

// ── Get active alerts ────────────────────────────────────────
// Used by: Alerts.jsx (full page), AlertsList.jsx (dashboard widget)
// Query:   ?type=outbreak&riskLevel=high&district=Colombo&limit=3
const getActiveAlerts = async (filters = {}) => {
    const db = getDb();
    let q = db.collection("alerts").where("active", "==", true);
    if (filters.type) q = q.where("type", "==", filters.type);
    if (filters.riskLevel) q = q.where("riskLevel", "==", filters.riskLevel);
    if (filters.district) q = q.where("district", "==", filters.district);
    q = q.orderBy("createdAt", "desc");
    if (filters.limit) q = q.limit(parseInt(filters.limit));
    const snap = await q.get();
    return snap.docs.map(d => d.data());
};

// ── Auto-generate outbreak alert (called after case submission) ──
const autoGenerateOutbreakAlert = async (district, caseCount, diseaseType) => {
    if (caseCount < 30) return null;

    const isHigh = caseCount >= 100;
    const level = isHigh ? "HIGH" : "MEDIUM";
    const risk = isHigh ? "high" : "medium";
    const disease = diseaseType === "dengue" ? "Dengue" : "Chikungunya";

    const titleEn = level + " RISK: " + disease + " outbreak in " + district;
    const messageEn = district + " has " + caseCount + " " + disease + " cases this month. Eliminate breeding sites.";
    // Sinhala / Tamil versions for your multilingual module
    const messageSi = district + " ජිස්ත්‍රික්කයේ " + caseCount + " රෝගීන් ඇත.";
    const messageTa = district + " மாவட்டத்தில் " + caseCount + " வழக்குகள்.";

    return createAlert({
        type: "outbreak", district, riskLevel: risk,
        titleEn, messageEn, messageSi, messageTa, diseaseType, caseCount
    });
};

// ── Subscribe device to FCM topic ────────────────────────────
// Called from frontend after user logs in
const subscribeToTopic = async (token, topic) => {
    await getAdmin().messaging().subscribeToTopic([token], topic);
    return { success: true, topic };
};

module.exports = { createAlert, getActiveAlerts, autoGenerateOutbreakAlert, subscribeToTopic };