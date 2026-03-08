const router = require("express").Router();
const ctl = require("../controllers/notification.controller");
const { verifyToken, verifyAdmin } = require("../middleware/auth.middleware");

// GET  /api/notifications/alerts  — Alerts.jsx list, AlertsList.jsx widget
// ?type=outbreak&riskLevel=high&district=Colombo&limit=3
router.get("/alerts", ctl.getActiveAlerts);

// POST /api/notifications/alerts  (admin / health officer only)
router.post("/alerts", verifyToken, verifyAdmin, ctl.createAlert);

// POST /api/notifications/subscribe  — subscribe FCM device token
// Body: { token, topic }
router.post("/subscribe", ctl.subscribeToTopic);

module.exports = router;