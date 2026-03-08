const mongoose = require('mongoose');
require('dotenv').config({ path: 'c:/Users/Admin/Desktop/Research Project/Mosquito-Controller-System/mosquito-backend/.env' });
const CaseReport = require('c:/Users/Admin/Desktop/Research Project/Mosquito-Controller-System/mosquito-backend/models/CaseReport');

async function checkDeaths() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const totalDeathsResult = await CaseReport.aggregate([
            { $group: { _id: null, total: { $sum: "$deathCount" }, count: { $sum: { $cond: [{ $gt: ["$deathCount", 0] }, 1, 0] } } } }
        ]);

        if (totalDeathsResult.length > 0) {
            console.log(`Total deaths in DB: ${totalDeathsResult[0].total}`);
            console.log(`Records with non-zero deaths: ${totalDeathsResult[0].count}`);
        } else {
            console.log('No CaseReport records found in DB.');
        }

        const recentDeaths = await CaseReport.find({ deathCount: { $gt: 0 } }).limit(5);
        if (recentDeaths.length > 0) {
            console.log('\nRecent records with deaths:');
            recentDeaths.forEach(r => {
                console.log(`- ${r.district}: ${r.deathCount} deaths (${r.diseaseType}) on ${r.reportedAt}`);
            });
        }

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkDeaths();
