import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const Careers = ({ token }) => {
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("Full-time");
  const [description, setDescription] = useState("");

  const [jobs, setJobs] = useState([]);

  const fetchJobs = async () => {
    try {
      const response = await axios.post(
        backendUrl + "/api/job/list-all",
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (response.data.success) {
        setJobs(response.data.jobs);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        backendUrl + "/api/job/add",
        { title, department, location, type, description },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (response.data.success) {
        toast.success(response.data.message);
        setTitle("");
        setDepartment("");
        setLocation("");
        setType("Full-time");
        setDescription("");
        await fetchJobs();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const toggleStatus = async (id) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/job/toggle-status",
        { id },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (response.data.success) {
        await fetchJobs();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const removeJob = async (id) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/job/remove",
        { id },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (response.data.success) {
        toast.success(response.data.message);
        await fetchJobs();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  return (
    <div>
      <form
        onSubmit={onSubmitHandler}
        className="flex flex-col w-full items-start gap-3 max-w-[600px]"
      >
        <p className="text-lg font-medium">Post a Job Opening</p>

        <div className="w-full">
          <p className="mb-2">Job Title</p>
          <input
            onChange={(e) => setTitle(e.target.value)}
            value={title}
            className="w-full px-3 py-2"
            type="text"
            placeholder="e.g. Frontend Developer"
            required
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:gap-8">
          <div className="w-full">
            <p className="mb-2">Department</p>
            <input
              onChange={(e) => setDepartment(e.target.value)}
              value={department}
              className="w-full px-3 py-2"
              type="text"
              placeholder="e.g. Engineering"
              required
            />
          </div>
          <div className="w-full">
            <p className="mb-2">Location</p>
            <input
              onChange={(e) => setLocation(e.target.value)}
              value={location}
              className="w-full px-3 py-2"
              type="text"
              placeholder="e.g. Remote"
              required
            />
          </div>
          <div>
            <p className="mb-2">Type</p>
            <select
              onChange={(e) => setType(e.target.value)}
              value={type}
              className="w-full px-3 py-2"
            >
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Internship">Internship</option>
              <option value="Contract">Contract</option>
            </select>
          </div>
        </div>

        <div className="w-full">
          <p className="mb-2">Job Description</p>
          <textarea
            onChange={(e) => setDescription(e.target.value)}
            value={description}
            className="w-full px-3 py-2"
            rows="4"
            placeholder="Role responsibilities, requirements, etc."
            required
          />
        </div>

        <button className="w-32 py-3 mt-2 bg-black text-white">POST JOB</button>
      </form>

      <div className="mt-10">
        <p className="text-lg font-medium mb-3">Postings</p>
        <div className="flex flex-col gap-2">
          <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm">
            <b>Title</b>
            <b>Department</b>
            <b>Location</b>
            <b>Status</b>
            <b>Applications</b>
            <b>Action</b>
          </div>

          {jobs.map((job) => (
            <div
              key={job._id}
              className="grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] items-center gap-2 py-2 px-2 border text-sm"
            >
              <p>{job.title}</p>
              <p>{job.department}</p>
              <p>{job.location}</p>
              <p className={job.isActive ? "text-green-600" : "text-gray-400"}>
                {job.isActive ? "Open" : "Closed"}
              </p>
              <Link
                to={`/applications?jobId=${job._id}`}
                className="underline cursor-pointer"
              >
                View
              </Link>
              <div className="flex gap-3">
                <p
                  onClick={() => toggleStatus(job._id)}
                  className="cursor-pointer text-xs underline"
                >
                  {job.isActive ? "Close" : "Reopen"}
                </p>
                <p
                  onClick={() => removeJob(job._id)}
                  className="cursor-pointer text-lg"
                >
                  X
                </p>
              </div>
            </div>
          ))}

          {jobs.length === 0 && (
            <p className="text-gray-500 text-sm mt-2">No job postings yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Careers;
