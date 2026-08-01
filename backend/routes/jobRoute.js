import express from "express";
import upload from "../middleware/multer.js";
import adminAuth from "../middleware/adminAuth.js";
import {
  addJob,
  listJobs,
  listAllJobs,
  toggleJobStatus,
  removeJob,
  applyJob,
  listApplications,
  updateApplicationStatus,
} from "../controllers/jobController.js";

const jobRouter = express.Router();

// public
jobRouter.get("/list", listJobs);
jobRouter.post("/apply", upload.single("resume"), applyJob);

// admin
jobRouter.post("/add", adminAuth, addJob);
jobRouter.post("/list-all", adminAuth, listAllJobs);
jobRouter.post("/toggle-status", adminAuth, toggleJobStatus);
jobRouter.post("/remove", adminAuth, removeJob);
jobRouter.post("/applications", adminAuth, listApplications);
jobRouter.post("/application-status", adminAuth, updateApplicationStatus);

export default jobRouter;
