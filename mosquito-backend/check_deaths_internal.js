const mongoose = require('mongoose');
require('dotenv').config();
const CaseReport = require('./models/CaseReport');

async function checkDeaths() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const totalDeathsResult = await CaseReport.aggregate([
            { $group: { _id: null, total: { $sum: "$deathCount" }, count: { $sum: { $cond: [{ $gt: ["$deathCount", 0] }, 1, 0] } } } }
        ]);

        if (totalDeathsResult.length > 0) {
            console.log(`\n--- DATABASE SUMMARY ---`);
            console.log(`Total deaths in DB: ${totalDeathsResult[0].total}`);
            console.log(`High-death records (count): ${totalDeathsResult[0].count}`);
        } else {
            console.log('\nNo CaseReport records found in DB.');
        }

        const recentDeaths = await CaseReport.find({ deathCount: { $gt: 0 } }).sort({ reportedAt: -1 }).limit(10);
        if (recentDeaths.length > 0) {
            console.log('\n--- RECENT RECORDS WITH DEATHS ---');
            recentDeaths.forEach(r => {
                const date = r.reportedAt ? new Date(r.reportedAt).toLocaleDateString() : 'N/A';
                console.log(`- ${r.district} (${r.diseaseType.toUpperCase()}): ${r.deathCount} deaths | Date: ${date} | Hospital: ${r.hospitalName}`);
            });
        } else {
            console.log('\nNo records found with non-zero death counts.');
        }

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkDeaths();
