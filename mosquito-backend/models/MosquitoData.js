const mongoose = require('mongoose');

const mosquitoSchema = new mongoose.Schema({
  location: String,
  year: Number,
  month: Number,
  cumulative: Number
});

module.exports = mongoose.model('MosquitoData', mosquitoSchema);