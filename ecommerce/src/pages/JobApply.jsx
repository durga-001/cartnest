import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";

const JobApply = () => {
  const { jobId } = useParams();
  const { backendUrl, navigate } = useContext(ShopContext);

  const [job, setJob] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [resume, setResume] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchJob = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/job/list");
      if (response.data.success) {
        const found = response.data.jobs.find((j) => j._id === jobId);
        setJob(found || null);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchJob();
  }, [jobId]);

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (!resume) {
      toast.error("Please attach your resume");
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("jobId", jobId);
      formData.append("jobTitle", job ? job.title : "");
      formData.append("name", name);
      formData.append("email", email);
      formData.append("phone", phone);
      formData.append("coverLetter", coverLetter);
      formData.append("resume", resume);

      const response = await axios.post(
        backendUrl + "/api/job/apply",
        formData,
      );

      if (response.data.success) {
        toast.success(response.data.message);
        navigate("/careers");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col w-[90%] sm:max-w-md m-auto mt-14 gap-4 text-gray-800"
    >
      <div className="inline-flex items-center gap-2 mb-2">
        <p className="prata-regular text-3xl">Apply</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>

      {job && (
        <div className="border border-gray-300 p-4 -mt-2 mb-2">
          <p className="font-medium">{job.title}</p>
          <p className="text-xs text-gray-500 mt-1">
            {job.department} · {job.location} · {job.type}
          </p>
        </div>
      )}

      <input
        onChange={(e) => setName(e.target.value)}
        value={name}
        type="text"
        className="w-full px-3 py-2 border border-gray-800"
        placeholder="Full Name"
        required
      />
      <input
        onChange={(e) => setEmail(e.target.value)}
        value={email}
        type="email"
        className="w-full px-3 py-2 border border-gray-800"
        placeholder="Email"
        required
      />
      <input
        onChange={(e) => setPhone(e.target.value)}
        value={phone}
        type="tel"
        className="w-full px-3 py-2 border border-gray-800"
        placeholder="Phone Number"
        required
      />
      <textarea
        onChange={(e) => setCoverLetter(e.target.value)}
        value={coverLetter}
        className="w-full px-3 py-2 border border-gray-800"
        rows="4"
        placeholder="Why are you a good fit for this role? (optional)"
      />

      <div>
        <label className="text-sm text-gray-600">Resume (PDF or DOC)</label>
        <input
          onChange={(e) => setResume(e.target.files[0])}
          type="file"
          accept=".pdf,.doc,.docx"
          className="w-full mt-1 text-sm"
          required
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="bg-black text-white font-light px-8 py-2 mt-4 disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit Application"}
      </button>
    </form>
  );
};

export default JobApply;
