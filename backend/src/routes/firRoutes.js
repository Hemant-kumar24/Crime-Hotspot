const express = require("express");
const multer = require("multer");
const authMiddleware = require("../middleware/authMiddleware");
const { createFirEntry, uploadFirDataset } = require("../controllers/firController");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.post("/", authMiddleware, createFirEntry);
router.post("/upload", authMiddleware, upload.single("file"), uploadFirDataset);

module.exports = router;
