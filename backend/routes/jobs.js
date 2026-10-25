const express = require("express");
const {getAllJobs, getJob, createJob, updateJob, deleteJob, getJobMatches, getJobMatchAnalysis} = require("../controllers/jobs");
const router = express.Router();

router.get("/", getAllJobs);
router.post("/", createJob);
router.get("/matches", getJobMatches);
router.post("/:id/match-analysis", getJobMatchAnalysis);
router.get("/:id", getJob);
router.patch("/:id", updateJob);
router.delete("/:id", deleteJob);

module.exports = router;