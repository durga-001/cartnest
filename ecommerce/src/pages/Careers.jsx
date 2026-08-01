import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";

const Careers = () => {
  const { backendUrl, navigate } = useContext(ShopContext);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/job/list");
      if (response.data.success) {
        setJobs(response.data.jobs);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <div className="border-t pt-10">
      <div className="text-2xl text-center">
        <Title text1={"OPEN"} text2={"POSITIONS"} />
        <p className="w-full max-w-md m-auto text-xs sm:text-sm text-gray-500">
          Take a look at what we're hiring for right now.
        </p>
      </div>

      <div className="my-10">
        {loading && (
          <p className="text-center text-gray-500">Loading roles...</p>
        )}

        {!loading && jobs.length === 0 && (
          <p className="text-center text-gray-500">
            No open positions right now. Check back soon!
          </p>
        )}

        <div className="flex flex-col gap-4">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border border-gray-300 p-5"
            >
              <div>
                <p className="font-medium text-base text-gray-800">
                  {job.title}
                </p>
                <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-500">
                  <span className="border px-2 py-1">{job.department}</span>
                  <span className="border px-2 py-1">{job.location}</span>
                  <span className="border px-2 py-1">{job.type}</span>
                </div>
                <p className="text-sm text-gray-500 mt-3 max-w-xl">
                  {job.description}
                </p>
              </div>

              <button
                onClick={() => navigate(`/careers/apply/${job._id}`)}
                className="border border-black px-6 py-3 text-sm hover:bg-black hover:text-white transition-all duration-500 whitespace-nowrap"
              >
                Apply Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Careers;
