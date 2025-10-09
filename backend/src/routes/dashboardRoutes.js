const express = require("express");
const { dashboardOverview } = require("../controllers/dashboardController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, dashboardOverview);

module.exports = router;
