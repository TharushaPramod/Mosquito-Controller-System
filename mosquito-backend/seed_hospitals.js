const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const HospitalSchema = new mongoose.Schema({
    hospitalId: { type: String, unique: true },
    name: { type: String, required: true },
    district: { type: String, required: true },
    province: { type: String },
    type: { type: String, enum: ["National Hospital", "Teaching Hospital", "General Hospital", "Base Hospital", "District Hospital", "Divisional Hospital", "PHI"], default: "District Hospital" },
    location: { lat: Number, lng: Number },
    status: { type: String, default: "Active" },
    verified: { type: Boolean, default: true },
});

const Hospital = mongoose.models.Hospital || mongoose.model('Hospital', HospitalSchema);

const DISTRICT_DATA = {
    'Ampara': { lat: 7.3004, lng: 81.6738, hospital: 'Ampara District Hospital', moh: 'MOH Ampara' },
    'Anuradhapura': { lat: 8.3114, lng: 80.4037, hospital: 'Anuradhapura Teaching Hospital', moh: 'MOH Anuradhapura' },
    'Badulla': { lat: 6.9934, lng: 81.0550, hospital: 'Badulla Provincial General Hospital', moh: 'MOH Badulla' },
    'Batticaloa': { lat: 7.7170, lng: 81.7004, hospital: 'Batticaloa Teaching Hospital', moh: 'MOH Batticaloa' },
    'Colombo': { lat: 6.9271, lng: 79.8612, hospital: 'National Hospital of Sri Lanka', moh: 'MOH Colombo 07' },
    'Galle': { lat: 6.0535, lng: 80.2210, hospital: 'Karapitiya Teaching Hospital', moh: 'MOH Galle Municipal' },
    'Gampaha': { lat: 7.0873, lng: 80.0144, hospital: 'Gampaha District General Hospital', moh: 'MOH Negombo Unit' },
    'Hambantota': { lat: 6.1429, lng: 81.1212, hospital: 'Hambantota District Hospital', moh: 'MOH Hambantota' },
    'Jaffna': { lat: 9.6615, lng: 80.0255, hospital: 'Jaffna Teaching Hospital', moh: 'MOH Jaffna Municipal' },
    'Kalutara': { lat: 6.5854, lng: 79.9607, hospital: 'General Hospital Kalutara', moh: 'MOH Kalutara District' },
    'Kandy': { lat: 7.2906, lng: 80.6337, hospital: 'Kandy National Hospital', moh: 'MOH Kandy Central' },
    'Kegalle': { lat: 7.2513, lng: 80.3464, hospital: 'District General Hospital Kegalle', moh: 'MOH Kegalle District' },
    'Kilinochchi': { lat: 9.3803, lng: 80.4006, hospital: 'Kilinochchi District Hospital', moh: 'MOH Kilinochchi' },
    'Kurunegala': { lat: 7.4867, lng: 80.3647, hospital: 'Kurunegala Teaching Hospital', moh: 'MOH Kurunegala Municipal' },
    'Mannar': { lat: 8.9810, lng: 79.9044, hospital: 'Mannar District Hospital', moh: 'MOH Mannar' },
    'Matale': { lat: 7.4675, lng: 80.6234, hospital: 'District General Hospital Matale', moh: 'MOH Matale District' },
    'Matara': { lat: 5.9549, lng: 80.5550, hospital: 'General Hospital Matara', moh: 'MOH Matara Municipal' },
    'Moneragala': { lat: 6.8727, lng: 81.3506, hospital: 'District General Hospital Moneragala', moh: 'MOH Moneragala' },
    'Mullaitivu': { lat: 9.2671, lng: 80.8128, hospital: 'Mullaitivu District Hospital', moh: 'MOH Mullaitivu' },
    'Nuwara Eliya': { lat: 6.9497, lng: 80.7891, hospital: 'District General Hospital Nuwara Eliya', moh: 'MOH Nuwara Eliya District' },
    'Polonnaruwa': { lat: 7.9403, lng: 81.0188, hospital: 'District General Hospital Polonnaruwa', moh: 'MOH Polonnaruwa' },
    'Puttalam': { lat: 8.0362, lng: 79.8283, hospital: 'District General Hospital Puttalam', moh: 'MOH Puttalam Unit' },
    'Ratnapura': { lat: 6.6828, lng: 80.3992, hospital: 'Ratnapura Teaching Hospital', moh: 'MOH Ratnapura Provincial' },
    'Trincomalee': { lat: 8.5874, lng: 81.2152, hospital: 'Trincomalee District General Hospital', moh: 'MOH Trincomalee' },
    'Vavuniya': { lat: 8.7514, lng: 80.4971, hospital: 'Vavuniya General Hospital', moh: 'MOH Vavuniya' },
    'Kalmunai': { lat: 7.4148, lng: 81.8261, hospital: 'Kalmunai Base Hospital', moh: 'MOH Kalmunai Office' },
};

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Seeding facilities for all districts in Sri Lanka...");

        const count = await Hospital.countDocuments();
        console.log(`Current hospital count: ${count}`);

        for (const [dt, info] of Object.entries(DISTRICT_DATA)) {
            // Seed Hospital
            const hId = `H-${dt.substring(0, 3).toUpperCase()}-FAC-${Math.floor(Math.random() * 900) + 100}`;
            await Hospital.findOneAndUpdate(
                { name: info.hospital, district: dt },
                {
                    hospitalId: hId,
                    name: info.hospital,
                    district: dt,
                    type: info.hospital.includes('Teaching') ? 'Teaching Hospital' : (info.hospital.includes('National') ? 'National Hospital' : 'General Hospital'),
                    location: { lat: info.lat, lng: info.lng },
                    status: 'Active',
                    verified: true
                },
                { upsert: true, new: true }
            );

            // Seed PHI/MOH Unit
            const mId = `H-${dt.substring(0, 3).toUpperCase()}-MOH-${Math.floor(Math.random() * 900) + 100}`;
            await Hospital.findOneAndUpdate(
                { name: info.moh, district: dt },
                {
                    hospitalId: mId,
                    name: info.moh,
                    district: dt,
                    type: 'PHI',
                    location: { lat: info.lat + (Math.random() * 0.05 - 0.025), lng: info.lng + (Math.random() * 0.05 - 0.025) },
                    status: 'Active',
                    verified: true
                },
                { upsert: true, new: true }
            );
        }

        const finalCount = await Hospital.countDocuments();
        console.log(`Seeding complete. Total facilities: ${finalCount}`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seed();
