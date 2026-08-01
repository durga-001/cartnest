import { v2 as cloudinary } from "cloudinary";
import jobModel from "../models/jobModel.js";
import jobApplicationModel from "../models/jobApplicationModel.js";

// --- ADMIN: ADD JOB POSTING ---
const addJob = async (req, res) => {
  try {
    const { title, department, location, type, description } = req.body;

    const jobData = {
      title,
      department,
      location,
      type,
      description,
      isActive: true,
      date: Date.now(),
    };

    const job = new jobModel(jobData);
    await job.save();

    return res.json({ success: true, message: "Job posted successfully" });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// --- PUBLIC: LIST ACTIVE JOBS (for the Careers page) ---
const listJobs = async (req, res) => {
  try {
    const jobs = await jobModel.find({ isActive: true }).sort({ date: -1 });
    return res.json({ success: true, jobs });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// --- ADMIN: LIST ALL JOBS (active + closed) ---
const listAllJobs = async (req, res) => {
  try {
    const jobs = await jobModel.find({}).sort({ date: -1 });
    return res.json({ success: true, jobs });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// --- ADMIN: TOGGLE A JOB OPEN/CLOSED (take it off the portal without deleting history) ---
const toggleJobStatus = async (req, res) => {
  try {
    const { id } = req.body;
    const job = await jobModel.findById(id);
    if (!job) {
      return res.json({ success: false, message: "Job not found" });
    }
    job.isActive = !job.isActive;
    await job.save();
    return res.json({
      success: true,
      message: "Job status updated",
      isActive: job.isActive,
    });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// --- ADMIN: REMOVE JOB POSTING ---
const removeJob = async (req, res) => {
  try {
    const { id } = req.body;
    await jobModel.findByIdAndDelete(id);
    return res.json({ success: true, message: "Job removed" });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// --- PUBLIC: APPLY TO A JOB ---
const applyJob = async (req, res) => {
  try {
    const { jobId, jobTitle, name, email, phone, coverLetter } = req.body;

    if (!req.file) {
      return res.json({ success: false, message: "Please attach your resume" });
    }

    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "raw",
      folder: "resumes",
    });

    const applicationData = {
      jobId,
      jobTitle,
      name,
      email,
      phone,
      coverLetter: coverLetter || "",
      resumeUrl: uploadResult.secure_url,
      status: "Applied",
      date: Date.now(),
    };

    const application = new jobApplicationModel(applicationData);
    await application.save();

    return res.json({
      success: true,
      message: "Application submitted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// --- ADMIN: LIST APPLICATIONS (optionally filtered by jobId) ---
const listApplications = async (req, res) => {
  try {
    const { jobId } = req.body;
    const filter = jobId ? { jobId } : {};
    const applications = await jobApplicationModel
      .find(filter)
      .sort({ date: -1 });
    return res.json({ success: true, applications });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// --- ADMIN: UPDATE APPLICATION STATUS ---
const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId, status } = req.body;
    await jobApplicationModel.findByIdAndUpdate(applicationId, { status });
    return res.json({ success: true, message: "Status updated" });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

export {
  addJob,
  listJobs,
  listAllJobs,
  toggleJobStatus,
  removeJob,
  applyJob,
  listApplications,
  updateApplicationStatus,
};
