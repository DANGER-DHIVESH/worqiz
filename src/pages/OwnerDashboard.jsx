import { useState } from "react";
import { useJobs } from "../context/JobContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function OwnerDashboard() {
  const { jobs, addJob, assignJob, rateJob } = useJobs();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [pay, setPay] = useState("");
  const [duration, setDuration] = useState("");
  const [urgent, setUrgent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    addJob({ title, pay, duration, urgent });
    setTitle("");
    setPay("");
    setDuration("");
    setUrgent(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 space-y-6">

      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Owner Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-3 py-1 rounded"
        >
          Logout
        </button>
      </div>

      {/* Post Job */}
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
            placeholder="Duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={urgent}
              onChange={(e) => setUrgent(e.target.checked)}
            />
            <label>QuickHire (Urgent)</label>
          </div>

          <button className="bg-black text-white px-4 py-2 rounded w-full">
            Post Job
          </button>
        </form>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold">Posted Jobs</h3>

        {jobs.map((job) => (
          <div key={job.id} className="bg-white p-4 rounded shadow space-y-2">
            <p className="font-semibold">{job.title}</p>
            <p className="text-sm text-gray-500">
              ₹{job.pay} | {job.duration}
            </p>

            <p>Status: {job.status}</p>

            {job.status === "open" &&
              job.applicants.map((applicant, index) => (
                <button
                  key={index}
                  onClick={() => assignJob(job.id, applicant)}
                  className="bg-blue-600 text-white px-3 py-1 rounded mr-2"
                >
                  Accept {applicant}
                </button>
              ))}

            {/* Rating Section */}
            {job.status === "completed" && !job.rating && (
              <div className="space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => rateJob(job.id, star)}
                    className="bg-yellow-400 px-2 py-1 rounded"
                  >
                    {star} ⭐
                  </button>
                ))}
              </div>
            )}

            {job.rating && (
              <p className="font-semibold text-yellow-600">
                Rated: {job.rating} ⭐
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
