const express = require("express");
const router = express.Router();
const { getTrapControl } = require("../controllers/trapController");

router.get("/control", getTrapControl);
router.get("/control/:district", getTrapControl);

module.exports = router;