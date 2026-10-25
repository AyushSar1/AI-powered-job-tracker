const express = require("express");
const router = express.Router();
const upload = require("../config/multer");
const {uploadResume, getResume, deleteResume, analyzeResume, getResumeAnalysis} = require("../controllers/resume");

router.post("/upload", upload.single("resume"), uploadResume);

router.get("/", getResume);

router.delete("/", deleteResume);

router.post("/analyze", analyzeResume);

router.get("/analysis", getResumeAnalysis);

module.exports = router;