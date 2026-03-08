// routes/hospital_routes.js
const router = require("express").Router();
const ctl = require("../controllers/hospital_controller");

router.get("/", ctl.getAll);
router.get("/stats", ctl.getStats);
router.get("/:id", ctl.getFacilityById);
router.post("/", ctl.add);
router.put("/:id", ctl.update);
router.delete("/:id", ctl.remove);

module.exports = router;
