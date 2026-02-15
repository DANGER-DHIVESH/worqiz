import { useJobs } from "../context/JobContext";
import { useAuth } from "../context/AuthContext";

export default function WorkerDashboard() {
  const { jobs, applyToJob } = useJobs();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 p-4 space-y-4">
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-bold">Available Jobs Nearby</h2>
        <p className="text-gray-600">Jobs within 5km</p>
      </div>

      {jobs.map((job) => {
        const alreadyApplied = job.applicants.includes(user.role);

        return (
          <div
            key={job.id}
            className="bg-white p-4 rounded shadow space-y-2"
          >
            <h3 className="font-semibold">{job.title}</h3>
            <p className="text-sm text-gray-500">
              ₹{job.pay} | {job.duration}
            </p>

            <button
              disabled={alreadyApplied}
              onClick={() => applyToJob(job.id, user.role)}
              className={`px-3 py-1 rounded text-white ${
                alreadyApplied
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600"
              }`}
            >
              {alreadyApplied ? "Applied" : "Apply"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
