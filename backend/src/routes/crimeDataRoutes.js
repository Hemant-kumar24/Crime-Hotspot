const express = require("express");
const { getCrimeData } = require("../controllers/crimeDataController");

const router = express.Router();

router.get("/", getCrimeData);

module.exports = router;
