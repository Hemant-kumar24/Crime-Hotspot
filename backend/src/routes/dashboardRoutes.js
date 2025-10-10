const express = require("express");
const { dashboardOverview, predictiveAnalysis } = require("../controllers/dashboardController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, dashboardOverview);
router.get("/predictive", authMiddleware, predictiveAnalysis);

module.exports = router;
