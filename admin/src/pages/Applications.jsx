import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";

const Applications = ({ token }) => {
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get("jobId") || "";
  const [applications, setApplications] = useState([]);

  const fetchApplications = async () => {
    try {
      const response = await axios.post(
        backendUrl + "/api/job/applications",
        jobId ? { jobId } : {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (response.data.success) {
        setApplications(response.data.applications);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [jobId]);

  const statusHandler = async (event, applicationId) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/job/application-status",
        { applicationId, status: event.target.value },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (response.data.success) {
        await fetchApplications();
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
      <p className="text-lg font-medium mb-3">
        Job Applications {jobId ? "(filtered)" : ""}
      </p>

      <div className="flex flex-col gap-3">
        {applications.map((app) => (
          <div
            key={app._id}
            className="border p-4 text-sm flex flex-col md:flex-row md:items-center md:justify-between gap-3"
          >
            <div>
              <p className="font-medium text-gray-800">
                {app.name}{" "}
                <span className="text-gray-400 font-normal">applied for</span>{" "}
                {app.jobTitle}
              </p>
              <p className="text-gray-500 mt-1">
                {app.email} · {app.phone}
              </p>
              {app.coverLetter && (
                <p className="text-gray-500 mt-1 max-w-xl">{app.coverLetter}</p>
              )}
              <a
                href={app.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="underline text-gray-700 mt-1 inline-block"
              >
                View Resume
              </a>
              <p className="text-xs text-gray-400 mt-1">
                Applied: {new Date(app.date).toLocaleDateString()}
              </p>
            </div>

            <select
              onChange={(event) => statusHandler(event, app._id)}
              value={app.status}
              className="p-2 font-medium border w-fit h-fit"
            >
              <option value="Applied">Applied</option>
              <option value="Reviewed">Reviewed</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Rejected">Rejected</option>
              <option value="Hired">Hired</option>
            </select>
          </div>
        ))}

        {applications.length === 0 && (
          <p className="text-gray-500 text-sm">No applications yet.</p>
        )}
      </div>
    </div>
  );
};

export default Applications;
