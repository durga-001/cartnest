import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  department: { type: String, required: true },
  location: { type: String, required: true },
  type: { type: String, required: true }, // Full-time, Part-time, Internship, Contract
  description: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  date: { type: Number, required: true },
});

const jobModel = mongoose.models.job || mongoose.model("job", jobSchema);

export default jobModel;
