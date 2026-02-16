import { useState } from "react";
import { useJobs } from "../context/JobContext";

export default function OwnerDashboard() {
  const { jobs, addJob } = useJobs();

  const [title, setTitle] = useState("");
  const [pay, setPay] = useState("");
  const [duration, setDuration] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    addJob({
      title,
      pay,
      duration,
    });

    setTitle("");
    setPay("");
    setDuration("");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 space-y-6">
      
      {/* Post Job Form */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-lg font-bold mb-4">Post New Job</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Job Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />

          <input
            type="number"
            placeholder="Pay (₹)"
            value={pay}
            onChange={(e) => setPay(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />

          <input
            type="text"
            placeholder="Duration (e.g., 4 Hours)"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />

          <button
            type="submit"
            className="bg-black text-white px-4 py-2 rounded w-full"
          >
            Post Job
          </button>
        </form>
      </div>

      {/* Posted Jobs Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold">Posted Jobs</h3>

        {jobs.length === 0 && (
          <p className="text-gray-500">No jobs posted yet.</p>
        )}

        {jobs.map((job) => (
          <div
            key={job.id}
            className="bg-white p-4 rounded shadow"
          >
            <p className="font-semibold">{job.title}</p>
            <p className="text-sm text-gray-500">
              ₹{job.pay} | {job.duration}
            </p>
            <p className="text-sm mt-2">
              Applicants:{" "}
              <span className="font-bold">
                {job.applicants.length}
              </span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
