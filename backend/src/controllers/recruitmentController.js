const asyncHandler = require("express-async-handler");
const JobPosting = require("../models/JobPosting");
const Candidate = require("../models/Candidate");
const { logAudit } = require("../services/auditService");

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// ── Job Postings ──────────────────────────────────────────────────────────────

exports.getJobPostings = asyncHandler(async (req, res) => {
  const { status, department, search, page = 1, limit = 20 } = req.query;
  const query = {};
  if (status) query.status = status;
  if (department) query.department = department;
  if (search) query.title = new RegExp(escapeRegex(search), "i");

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [jobs, total] = await Promise.all([
    JobPosting.find(query)
      .populate("department", "name")
      .populate("designation", "title")
      .populate("branch", "name")
      .populate("postedBy", "name")
      .sort({ createdAt: -1 })
      .skip(skip).limit(parseInt(limit)),
    JobPosting.countDocuments(query)
  ]);
  res.json({ jobs, total, page: parseInt(page), limit: parseInt(limit) });
});

exports.getJobPostingById = asyncHandler(async (req, res) => {
  const job = await JobPosting.findById(req.params.id)
    .populate("department designation branch postedBy", "name title");
  if (!job) { res.status(404); throw new Error("Job posting not found"); }

  const candidateCount = await Candidate.countDocuments({ jobPosting: job._id });
  res.json({ ...job.toObject(), candidateCount });
});

exports.createJobPosting = asyncHandler(async (req, res) => {
  const { title, department, designation, branch, description, requirements, vacancies, employmentType, salaryMin, salaryMax, lastDate } = req.body;
  if (!title) { res.status(400); throw new Error("Job title is required"); }

  const job = await JobPosting.create({
    title: title.trim(), department, designation, branch,
    description, requirements,
    vacancies: vacancies || 1,
    employmentType,
    salaryMin: salaryMin !== undefined ? Number(salaryMin) : undefined,
    salaryMax: salaryMax !== undefined ? Number(salaryMax) : undefined,
    lastDate: lastDate ? new Date(lastDate) : undefined,
    postedBy: req.user._id
  });

  logAudit(req, { module: "Recruitment", action: "Create", recordId: job._id, recordName: job.title, description: `${req.user?.name} created job posting: ${job.title}`, newValues: job.toObject() });

  res.status(201).json(job);
});

exports.updateJobPosting = asyncHandler(async (req, res) => {
  const job = await JobPosting.findById(req.params.id);
  if (!job) { res.status(404); throw new Error("Job posting not found"); }

  const old = job.toObject();
  const fields = ["title", "department", "designation", "branch", "description", "requirements", "vacancies", "employmentType", "salaryMin", "salaryMax", "lastDate", "status"];
  fields.forEach((f) => { if (req.body[f] !== undefined) job[f] = req.body[f]; });

  await job.save();
  logAudit(req, { module: "Recruitment", action: "Update", recordId: job._id, recordName: job.title, description: `${req.user?.name} updated job posting: ${job.title}`, oldValues: old, newValues: job.toObject() });

  res.json(job);
});

exports.deleteJobPosting = asyncHandler(async (req, res) => {
  const job = await JobPosting.findById(req.params.id);
  if (!job) { res.status(404); throw new Error("Job posting not found"); }

  await Candidate.deleteMany({ jobPosting: job._id });
  logAudit(req, { module: "Recruitment", action: "Delete", recordId: job._id, recordName: job.title, description: `${req.user?.name} deleted job posting: ${job.title}` });

  await JobPosting.findByIdAndDelete(req.params.id);
  res.json({ message: "Job posting deleted successfully" });
});

// ── Candidates ────────────────────────────────────────────────────────────────

exports.getCandidates = asyncHandler(async (req, res) => {
  const { jobPosting, status, search, page = 1, limit = 20 } = req.query;
  const query = {};
  if (jobPosting) query.jobPosting = jobPosting;
  if (status) query.status = status;
  if (search) {
    const re = new RegExp(escapeRegex(search), "i");
    query.$or = [{ name: re }, { email: re }, { phone: re }];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [candidates, total] = await Promise.all([
    Candidate.find(query)
      .populate("jobPosting", "title")
      .populate("interviews.interviewedBy", "name")
      .sort({ createdAt: -1 })
      .skip(skip).limit(parseInt(limit)),
    Candidate.countDocuments(query)
  ]);
  res.json({ candidates, total, page: parseInt(page), limit: parseInt(limit) });
});

exports.getCandidateById = asyncHandler(async (req, res) => {
  const c = await Candidate.findById(req.params.id)
    .populate("jobPosting", "title department")
    .populate("interviews.interviewedBy", "name");
  if (!c) { res.status(404); throw new Error("Candidate not found"); }
  res.json(c);
});

exports.createCandidate = asyncHandler(async (req, res) => {
  const { jobPosting, name, email, phone, cnic, source, notes } = req.body;
  if (!jobPosting) { res.status(400); throw new Error("Job posting is required"); }
  if (!name) { res.status(400); throw new Error("Candidate name is required"); }

  const job = await JobPosting.findById(jobPosting);
  if (!job) { res.status(404); throw new Error("Job posting not found"); }
  if (job.status === "Closed") { res.status(400); throw new Error("Job posting is closed"); }

  const candidate = await Candidate.create({
    jobPosting, name: name.trim(), email, phone, cnic, source, notes,
    addedBy: req.user._id
  });

  logAudit(req, { module: "Recruitment", action: "Create", recordId: candidate._id, recordName: candidate.name, description: `${req.user?.name} added candidate ${candidate.name} for ${job.title}`, newValues: candidate.toObject() });

  res.status(201).json(candidate);
});

exports.updateCandidateStatus = asyncHandler(async (req, res) => {
  const c = await Candidate.findById(req.params.id);
  if (!c) { res.status(404); throw new Error("Candidate not found"); }

  const validStatuses = ["Applied", "Shortlisted", "Interviewed", "Offered", "Hired", "Rejected", "Withdrawn"];
  const { status, notes, offerDate, joiningDate } = req.body;

  if (status && !validStatuses.includes(status)) { res.status(400); throw new Error("Invalid status"); }

  const old = c.toObject();
  if (status) c.status = status;
  if (notes !== undefined) c.notes = notes;
  if (offerDate) c.offerDate = new Date(offerDate);
  if (joiningDate) c.joiningDate = new Date(joiningDate);

  await c.save();
  logAudit(req, { module: "Recruitment", action: "Update", recordId: c._id, recordName: c.name, description: `${req.user?.name} updated candidate ${c.name} status to ${c.status}`, oldValues: old, newValues: c.toObject() });

  res.json(c);
});

exports.addInterview = asyncHandler(async (req, res) => {
  const c = await Candidate.findById(req.params.id);
  if (!c) { res.status(404); throw new Error("Candidate not found"); }

  const { scheduledAt, interviewedBy, type, result, notes, round } = req.body;
  c.interviews.push({ scheduledAt, interviewedBy, type, result, notes, round });
  if (c.status === "Applied" || c.status === "Shortlisted") c.status = "Interviewed";

  await c.save();
  res.json(c);
});

exports.deleteCandidate = asyncHandler(async (req, res) => {
  const c = await Candidate.findById(req.params.id);
  if (!c) { res.status(404); throw new Error("Candidate not found"); }
  if (c.status === "Hired") { res.status(400); throw new Error("Cannot delete a hired candidate"); }

  logAudit(req, { module: "Recruitment", action: "Delete", recordId: c._id, recordName: c.name, description: `${req.user?.name} deleted candidate ${c.name}` });

  await Candidate.findByIdAndDelete(req.params.id);
  res.json({ message: "Candidate deleted successfully" });
});
