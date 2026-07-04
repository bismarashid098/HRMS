const express = require("express");
const {
  getJobPostings, getJobPostingById, createJobPosting, updateJobPosting, deleteJobPosting,
  getCandidates, getCandidateById, createCandidate, updateCandidateStatus, addInterview, deleteCandidate
} = require("../controllers/recruitmentController");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const { upload, withFolder } = require("../middleware/uploadMiddleware");

const router = express.Router();
router.use(protect, authorize("Admin"));

// Job postings
router.get("/jobs", getJobPostings);
router.get("/jobs/:id", getJobPostingById);
router.post("/jobs", createJobPosting);
router.put("/jobs/:id", updateJobPosting);
router.delete("/jobs/:id", deleteJobPosting);

// Candidates
router.get("/candidates", getCandidates);
router.get("/candidates/:id", getCandidateById);
router.post("/candidates", withFolder("resumes"), upload.single("resume"), createCandidate);
router.put("/candidates/:id/status", updateCandidateStatus);
router.post("/candidates/:id/interviews", addInterview);
router.delete("/candidates/:id", deleteCandidate);

module.exports = router;
