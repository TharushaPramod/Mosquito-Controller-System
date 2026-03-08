const express = require("express");
const router = express.Router();
const { predictNextThreeYears } = require("../controllers/predictionController");


router.get("/predict/:location", predictNextThreeYears);

module.exports = router;