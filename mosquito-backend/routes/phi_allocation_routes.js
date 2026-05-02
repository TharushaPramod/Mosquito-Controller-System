// routes/phi_allocation_routes.js
const router = require("express").Router();
const ctl = require("../controllers/phi_allocation_controller");

// GET  /api/phi-allocations        — list all, optional filters
router.get("/", ctl.getAllocations);

// POST /api/phi-allocations        — create new allocation
router.post("/", ctl.createAllocation);

module.exports = router;
