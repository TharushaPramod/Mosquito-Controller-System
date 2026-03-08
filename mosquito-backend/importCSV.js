const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
const MosquitoData = require('./models/MosquitoData');
require('dotenv').config();

mongoose.connect("mongodb+srv://lukysam95_db_user:Yx91Ozr06CFKhbBC@mosqutio.5v0rge0.mongodb.net/?appName=mosqutio")
  .then(() => console.log('MongoDB connected ✅'))
  .catch(err => console.log(err));

const results = [];

fs.createReadStream('mosquito_clean.csv')
  .pipe(csv())
  .on('data', (row) => {
    if (row.Location && row.Cumulative) {
      results.push({
        location: row.Location,
        year: parseInt(row.Year),
        month: parseInt(row.Month),
        cumulative: parseInt(row.Cumulative)
      });
    }
  })
  .on('end', async () => {
    try {
      await MosquitoData.insertMany(results);
      console.log('✅ Data Imported Successfully');
      mongoose.connection.close();
    } catch (err) {
      console.log(err);
    }
  });