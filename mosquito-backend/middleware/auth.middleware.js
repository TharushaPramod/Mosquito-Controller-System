const { getAdmin } = require("../config/firebase");

// ── Verify Firebase JWT (used by logged-in users / admins) ──
const verifyToken = async (req, res, next) => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer "))
        return res.status(401).json({ success: false, message: "No token provided" });

    try {
        const decoded = await getAdmin().auth().verifyIdToken(header.split(" ")[1]);
        req.user = decoded;
        next();
    } catch {
        res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
};

// ── Verify Hospital API Key (header: X-Hospital-API-Key) ────
// Used when a hospital system POSTs case reports
const verifyHospitalApiKey = (req, res, next) => {
    const key = req.headers["x-hospital-api-key"];
    if (!key)
        return res.status(401).json({ success: false, message: "Hospital API key required" });

    // In production compare against per-hospital key stored in Firestore
    // For now: compare to the master key in .env
    const master = process.env.HOSPITAL_MASTER_API_KEY;
    if (master && key !== master)
        return res.status(403).json({ success: false, message: "Invalid hospital API key" });

    next();
};

// ── Verify admin / health officer role (use AFTER verifyToken) ──
const verifyAdmin = (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });
    if (!["admin", "health_officer"].includes(req.user.role))
        return res.status(403).json({ success: false, message: "Admin access required" });
    next();
};

module.exports = { verifyToken, verifyHospitalApiKey, verifyAdmin };