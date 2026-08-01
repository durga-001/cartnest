import mongoose from "mongoose";

const jobApplicationSchema = new mongoose.Schema({
  jobId: { type: String, required: true },
  jobTitle: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  coverLetter: { type: String, default: "" },
  resumeUrl: { type: String, required: true },
  status: { type: String, default: "Applied" }, // Applied, Reviewed, Shortlisted, Rejected, Hired
  date: { type: Number, required: true },
});

const jobApplicationModel =
  mongoose.models.jobApplication ||
  mongoose.model("jobApplication", jobApplicationSchema);

export default jobApplicationModel;
