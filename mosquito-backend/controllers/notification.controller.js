const svc = require("../services/notification.service");

// GET /api/notifications/alerts  — Alerts.jsx + AlertsList.jsx
const getActiveAlerts = async (req, res) => {
    try {
        const data = await svc.getActiveAlerts(req.query);
        res.json({ success: true, count: data.length, data });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// POST /api/notifications/alerts  (admin / health officer)
const createAlert = async (req, res) => {
    try {
        const data = await svc.createAlert(req.body);
        res.status(201).json({ success: true, data });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// POST /api/notifications/subscribe  — subscribe FCM device token to topic
const subscribeToTopic = async (req, res) => {
    try {
        const { token, topic } = req.body;
        if (!token || !topic) return res.status(400).json({ success: false, message: "token and topic required" });
        const data = await svc.subscribeToTopic(token, topic);
        res.json({ success: true, data });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

module.exports = { getActiveAlerts, createAlert, subscribeToTopic };