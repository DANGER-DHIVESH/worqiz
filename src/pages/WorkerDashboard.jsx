
import { useJobs } from "../context/JobContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function WorkerDashboard() {
  const { jobs, applyToJob, completeJob } = useJobs();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [timeNow, setTimeNow] = useState(Date.now());
  const [withdrawn, setWithdrawn] = useState(() => {
    const saved = localStorage.getItem("worqiz_withdrawn");
    return saved ? Number(saved) : 0;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem("worqiz_withdrawn", withdrawn);
  }, [withdrawn]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const totalEarnings = jobs
    .filter(
      (job) =>
        job.assignedTo === user.role &&
        job.status === "completed"
    )
    .reduce((sum, job) => sum + Number(job.pay), 0);

  const availableBalance = totalEarnings - withdrawn;

  const handleWithdraw = () => {
    if (availableBalance > 0) {
      setWithdrawn(totalEarnings);
      alert("✅ Withdrawal Successful!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Worker Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-3 py-1 rounded"
        >
          Logout
        </button>
      </div>

      {/* Wallet Section */}
      <div className="bg-green-100 p-4 rounded shadow space-y-2">
        <h2 className="text-lg font-bold text-green-700">
          Total Earnings: ₹{totalEarnings}
        </h2>
        <p className="text-green-800">
          Available Balance: ₹{availableBalance}
        </p>

        <button
          onClick={handleWithdraw}
          disabled={availableBalance <= 0}
          className={`px-4 py-2 rounded text-white ${
            availableBalance > 0
              ? "bg-green-600"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Withdraw
        </button>
      </div>

      {/* Job List */}
      {jobs.map((job) => {
        const alreadyApplied = job.applicants.includes(user.role);
        const isClosed =
          job.status === "assigned" ||
          job.status === "closed" ||
          job.status === "completed";
        const isMine = job.assignedTo === user.role;

        const secondsLeft =
          job.expiresAt && job.status === "open"
            ? Math.max(
                0,
                Math.floor((job.expiresAt - timeNow) / 1000)
              )
            : null;

        return (
          <div
            key={job.id}
            className={`p-4 rounded shadow space-y-2 ${
              job.urgent
                ? "bg-red-50 border border-red-400"
                : "bg-white"
            }`}
          >
            {job.urgent && (
              <span className="bg-red-600 text-white text-xs px-2 py-1 rounded">
                URGENT
              </span>
            )}

            {job.urgent &&
              job.status === "open" &&
              secondsLeft !== null && (
                <p className="text-red-600 font-semibold text-sm">
                  Expires in: {secondsLeft} sec
                </p>
              )}

            <h3 className="font-semibold">{job.title}</h3>

            <p className="text-sm text-gray-500">
              ₹{job.pay} | {job.duration}
            </p>

            <p>Status: {job.status}</p>

            {isMine && job.status === "assigned" && (
              <button
                onClick={() => completeJob(job.id)}
                className="bg-blue-600 text-white px-3 py-1 rounded"
              >
                Mark as Completed
              </button>
            )}

            {!isMine && (
              <button
                disabled={alreadyApplied || isClosed}
                onClick={() => applyToJob(job.id, user.role)}
                className={`px-3 py-1 rounded text-white ${
                  alreadyApplied || isClosed
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600"
                }`}
              >
                {job.status === "closed"
                  ? "Expired"
                  : alreadyApplied
                  ? "Applied"
                  : "Apply"}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
