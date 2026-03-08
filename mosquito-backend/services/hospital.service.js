// services/hospital.service.js
const Hospital = require("../models/hospital");
const CaseReport = require("../models/CaseReport");

const DISTRICT_COORDS = {
    'Colombo': { lat: 6.9271, lng: 79.8612, province: 'Western' },
    'Gampaha': { lat: 7.0873, lng: 80.0144, province: 'Western' },
    'Kalutara': { lat: 6.5854, lng: 79.9607, province: 'Western' },
    'Kandy': { lat: 7.2906, lng: 80.6337, province: 'Central' },
    'Matale': { lat: 7.4675, lng: 80.6234, province: 'Central' },
    'Nuwara Eliya': { lat: 6.9497, lng: 80.7891, province: 'Central' },
    'Galle': { lat: 6.0535, lng: 80.2210, province: 'Southern' },
    'Matara': { lat: 5.9549, lng: 80.5550, province: 'Southern' },
    'Hambantota': { lat: 6.1429, lng: 81.1212, province: 'Southern' },
    'Jaffna': { lat: 9.6615, lng: 80.0255, province: 'Northern' },
    'Kilinochchi': { lat: 9.3803, lng: 80.4006, province: 'Northern' },
    'Mannar': { lat: 8.9810, lng: 79.9044, province: 'Northern' },
    'Vavuniya': { lat: 8.7514, lng: 80.4971, province: 'Northern' },
    'Mullaitivu': { lat: 9.2671, lng: 80.8128, province: 'Northern' },
    'Batticaloa': { lat: 7.7170, lng: 81.7004, province: 'Eastern' },
    'Ampara': { lat: 7.3004, lng: 81.6738, province: 'Eastern' },
    'Trincomalee': { lat: 8.5874, lng: 81.2152, province: 'Eastern' },
    'Kurunegala': { lat: 7.4867, lng: 80.3647, province: 'North Western' },
    'Puttalam': { lat: 8.0362, lng: 79.8283, province: 'North Western' },
    'Anuradhapura': { lat: 8.3114, lng: 80.4037, province: 'North Central' },
    'Polonnaruwa': { lat: 7.9403, lng: 81.0188, province: 'North Central' },
    'Badulla': { lat: 6.9934, lng: 81.0550, province: 'Uva' },
    'Moneragala': { lat: 6.8727, lng: 81.3506, province: 'Uva' },
    'Ratnapura': { lat: 6.6828, lng: 80.3992, province: 'Sabaragamuwa' },
    'Kegalle': { lat: 7.2513, lng: 80.3464, province: 'Sabaragamuwa' },
    'Kalmunai': { lat: 7.4148, lng: 81.8261, province: 'Eastern' },
};

// GET all hospitals with last report time from CaseReport
const getAllHospitals = async (filters = {}) => {
    const query = {};
    if (filters.district && filters.district !== 'All') query.district = filters.district;
    if (filters.status && filters.status !== 'All') query.status = filters.status;
    if (filters.search) {
        query.$or = [
            { name: { $regex: filters.search, $options: 'i' } },
            { district: { $regex: filters.search, $options: 'i' } },
            { contactPerson: { $regex: filters.search, $options: 'i' } },
        ];
    }

    const hospitals = await Hospital.find(query).sort({ createdAt: -1 });

    // Enrich with last report date from CaseReport
    const enriched = await Promise.all(hospitals.map(async (h) => {
        const lastReport = await CaseReport.findOne({ hospitalId: h.hospitalId })
            .sort({ reportedAt: -1 }).select('reportedAt').lean();

        // Auto-compute status based on last report
        let computedStatus = h.status;
        if (lastReport?.reportedAt) {
            const daysSince = (Date.now() - new Date(lastReport.reportedAt)) / (24 * 3600000);
            computedStatus = daysSince <= 7 ? 'Active' : daysSince <= 14 ? 'Delayed' : 'Not Sending Data';
        }

        return {
            ...h.toObject(),
            lastReportAt: lastReport?.reportedAt || null,
            lastUpdate: lastReport?.reportedAt
                ? new Date(lastReport.reportedAt).toLocaleString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
                : 'No Data',
            computedStatus,
        };
    }));

    return enriched;
};

// POST add new hospital
const addHospital = async (data) => {
    const meta = DISTRICT_COORDS[data.district] || { lat: 7.8731, lng: 80.7718, province: 'Unknown' };

    // Auto-generate hospitalId
    const count = await Hospital.countDocuments();
    const hospitalId = `H-${data.district.substring(0, 3).toUpperCase()}-${String(count + 1).padStart(3, '0')}`;

    const hospital = new Hospital({
        hospitalId,
        name: data.name,
        district: data.district,
        province: data.province || meta.province,
        type: data.type,
        contactPerson: data.contactPerson,
        contactPhone: data.contactPhone,
        contactEmail: data.contactEmail,
        location: data.location || { lat: meta.lat, lng: meta.lng },
        status: 'Active',
        verified: false,
    });

    await hospital.save();
    return hospital;
};

// PUT update hospital
const updateHospital = async (id, data) => {
    return Hospital.findByIdAndUpdate(id, data, { new: true });
};

// DELETE hospital
const deleteHospital = async (id) => {
    return Hospital.findByIdAndDelete(id);
};

// GET stats for dashboard
const getHospitalStats = async () => {
    const total = await Hospital.countDocuments();
    const active = await Hospital.countDocuments({ status: 'Active' });
    const delayed = await Hospital.countDocuments({ status: 'Delayed' });
    const noData = await Hospital.countDocuments({ status: 'Not Sending Data' });
    return { total, active, delayed, noData };
};


// GET full facility detail by ID (for FacilityDetail page)
const getFacilityById = async (id) => {
    const mongoose = require("mongoose");
    const isObjId = mongoose.Types.ObjectId.isValid(id);

    const hospital = await Hospital.findOne(
        isObjId ? { $or: [{ _id: id }, { hospitalId: id }] } : { hospitalId: id }
    ).lean();
    if (!hospital) throw new Error("Facility not found");

    const CaseReport = require("../models/CaseReport");

    // Today stats
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
    const todayAgg = await CaseReport.aggregate([
        { $match: { hospitalId: hospital.hospitalId, reportedAt: { $gte: todayStart, $lte: todayEnd } } },
        { $group: { _id: null, confirmed: { $sum: "$caseCount" }, suspected: { $sum: "$suspectedCount" }, deaths: { $sum: "$deathCount" } } }
    ]);
    const today = todayAgg[0] || { confirmed: 0, suspected: 0, deaths: 0 };

    // Daily reports
    const dailyReports = await CaseReport.find({ hospitalId: hospital.hospitalId })
        .sort({ reportedAt: -1 }).limit(100).lean();

    // Monthly trend
    const twelveAgo = new Date(Date.now() - 365 * 24 * 3600000);
    const monthly = await CaseReport.aggregate([
        { $match: { hospitalId: hospital.hospitalId, reportedAt: { $gte: twelveAgo } } },
        { $group: { _id: { year: "$year", month: "$month" }, cases: { $sum: "$caseCount" }, date: { $min: "$reportedAt" } } },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);
    const monthlyData = monthly.map(m => ({
        name: new Date(m.date).toLocaleDateString("en-US", { month: "short" }),
        cases: m.cases,
    }));

    // Yearly trend
    const yearly = await CaseReport.aggregate([
        { $match: { hospitalId: hospital.hospitalId } },
        { $group: { _id: "$year", cases: { $sum: "$caseCount" } } },
        { $sort: { _id: 1 } },
    ]);
    const yearlyData = yearly.map(y => ({ name: String(y._id), cases: y.cases }));

    // Category breakdown totals
    const totalsAgg = await CaseReport.aggregate([
        { $match: { hospitalId: hospital.hospitalId } },
        { $group: { _id: null, confirmed: { $sum: "$caseCount" }, suspected: { $sum: "$suspectedCount" }, deaths: { $sum: "$deathCount" } } }
    ]);
    const t = totalsAgg[0] || {};
    const categoryData = [
        { name: "Confirmed", value: t.confirmed || 0 },
        { name: "Suspected", value: t.suspected || 0 },
        { name: "Recovered", value: Math.round((t.confirmed || 0) * 0.75) },
        { name: "Deaths", value: t.deaths || 0 },
    ];

    // Distribution by year for radial chart
    const distributionData = yearly.slice(-4).map((y, i) => ({
        name: String(y._id),
        value: y.cases,
        fill: ["#64B49F", "#4A90E2", "#82ca9d", "#8884d8"][i % 4],
    }));

    // Computed status
    const lastReport = dailyReports[0];
    let computedStatus = hospital.status || "Active";
    if (lastReport) {
        const days = (Date.now() - new Date(lastReport.reportedAt)) / (24 * 3600000);
        computedStatus = days <= 7 ? "Active" : days <= 14 ? "Delayed" : "Not Sending Data";
    }

    return {
        hospital: { ...hospital, computedStatus },
        today: { confirmed: today.confirmed, suspected: today.suspected, deaths: today.deaths },
        dailyReports: dailyReports.map(r => ({
            _id: r._id,
            date: new Date(r.reportedAt).toLocaleDateString("en-GB"),
            confirmed: r.caseCount || 0,
            suspected: r.suspectedCount || 0,
            death: r.deathCount || 0,
            ageGroup: r.ageGroup || "—",
            source: r.source || "Manual",
            severity: r.severityLevel || "—",
            disease: r.diseaseType || "dengue",
        })),
        stats: { monthlyData, yearlyData, categoryData, distributionData },
    };
};

module.exports = { getAllHospitals, getFacilityById, addHospital, updateHospital, deleteHospital, getHospitalStats };
