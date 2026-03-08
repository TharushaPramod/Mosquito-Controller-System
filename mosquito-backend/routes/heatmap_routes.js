// routes/heatmap_routes.js
const router = require("express").Router();
const ctl = require("../controllers/heatmap.controller");

router.get("/", ctl.getHeatmapData);
router.get("/district/:district", ctl.getDistrictDetail);
router.get("/timeseries", ctl.getTimeSeriesHeatmap);
router.get("/dashboard-stats", ctl.getDashboardStats);   // NEW — StatCards
router.get("/trend", ctl.getTrend);             // NEW — TrendChart
router.get("/outbreak-history", ctl.getOutbreakHistory);  // NEW — Past Outbreak History

router.get("/report-stats", ctl.getReportStats);
router.get("/yearly-stats", ctl.getYearlyStats);       // Seasonal chart
router.get("/submission-status", ctl.getSubmissionStatus); // Facility tracking

module.exports = router;
