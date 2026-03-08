// routes/alert_routes.js
const router = require("express").Router();
const ctl = require("../controllers/alert.controller");

router.get("/", ctl.getAlerts);

module.exports = router;
