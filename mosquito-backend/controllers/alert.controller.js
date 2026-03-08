// controllers/alert.controller.js
const svc = require("../services/alert.service");

const getAlerts = async (req, res) => {
    try {
        const alerts = await svc.getAlerts();
        res.json({ success: true, data: alerts, count: alerts.length });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};

module.exports = { getAlerts };
