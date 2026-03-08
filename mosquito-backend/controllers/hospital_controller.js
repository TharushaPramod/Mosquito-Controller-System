// controllers/hospital.controller.js
const svc = require("../services/hospital.service");

const getAll = async (req, res) => {
    try {
        const data = await svc.getAllHospitals(req.query);
        res.json({ success: true, data, count: data.length });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const add = async (req, res) => {
    try {
        const hospital = await svc.addHospital(req.body);
        res.json({ success: true, data: hospital });
    } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};

const update = async (req, res) => {
    try {
        const hospital = await svc.updateHospital(req.params.id, req.body);
        res.json({ success: true, data: hospital });
    } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};

const remove = async (req, res) => {
    try {
        await svc.deleteHospital(req.params.id);
        res.json({ success: true, message: "Deleted" });
    } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};

const getFacilityById = async (req, res) => {
    try {
        const data = await svc.getFacilityById(req.params.id);
        res.json({ success: true, data });
    } catch (e) {
        res.status(e.message === "Facility not found" ? 404 : 500)
            .json({ success: false, message: e.message });
    }
};

const getStats = async (req, res) => {
    try {
        const data = await svc.getHospitalStats();
        res.json({ success: true, data });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

module.exports = { getAll, add, update, remove, getStats, getFacilityById };
