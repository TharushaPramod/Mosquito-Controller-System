// controllers/heatmap.controller.js
const svc = require("../services/heatmap.service");

const getHeatmapData = async (req, res) => {
    try { res.json({ success: true, data: await svc.getHeatmapData(req.query) }); }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const getDistrictDetail = async (req, res) => {
    try { res.json({ success: true, data: await svc.getDistrictDetail(req.params.district) }); }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const getTimeSeriesHeatmap = async (req, res) => {
    try { res.json({ success: true, data: await svc.getTimeSeriesHeatmap(req.query.diseaseType || null, parseInt(req.query.weeks) || 12) }); }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const getDashboardStats = async (req, res) => {
    try { res.json({ success: true, data: await svc.getDashboardStats() }); }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const getTrend = async (req, res) => {
    try { res.json({ success: true, data: await svc.getTrend(req.query.district || null) }); }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const getOutbreakHistory = async (req, res) => {
    try { res.json({ success: true, data: await svc.getOutbreakHistory(req.query) }); }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
};


const getReportStats = async (req, res) => {
    try { res.json({ success: true, data: await svc.getReportStats() }); }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const getYearlyStats = async (req, res) => {
    try { res.json({ success: true, data: await svc.getYearlyStats(req.query) }); }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const getSubmissionStatus = async (req, res) => {
    try { res.json({ success: true, data: await svc.getSubmissionStatus() }); }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

module.exports = { getReportStats, getHeatmapData, getDistrictDetail, getTimeSeriesHeatmap, getDashboardStats, getTrend, getOutbreakHistory, getYearlyStats, getSubmissionStatus };
