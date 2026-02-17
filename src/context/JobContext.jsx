import { createContext, useContext, useState, useEffect } from "react";

const JobContext = createContext();

export function JobProvider({ children }) {
  const [jobs, setJobs] = useState(() => {
    const savedJobs = localStorage.getItem("worqiz_jobs");
    return savedJobs
      ? JSON.parse(savedJobs)
      : [
          {
            id: 1,
            title: "Event Helper",
            pay: 500,
            duration: "3 Hours",
            applicants: [],
            status: "open",
            assignedTo: null,
            urgent: false,
            expiresAt: null,
            rating: null,
            paid: false,
          },
        ];
  });

  useEffect(() => {
    localStorage.setItem("worqiz_jobs", JSON.stringify(jobs));
  }, [jobs]);

  const addJob = (job) => {
    const now = Date.now();

    setJobs([
      ...jobs,
      {
        id: Date.now(),
        title: job.title,
        pay: job.pay,
        duration: job.duration,
        applicants: [],
        status: "open",
        assignedTo: null,
        urgent: job.urgent || false,
        expiresAt: job.urgent ? now + 300000 : null,
        rating: null,
        paid: false,
      },
    ]);
  };

  const applyToJob = (jobId, userRole) => {
    setJobs(
      jobs.map((job) => {
        if (job.id !== jobId || job.status !== "open") return job;

        if (job.urgent) {
          return {
            ...job,
            applicants: [userRole],
            status: "assigned",
            assignedTo: userRole,
          };
        }

        return {
          ...job,
          applicants: job.applicants.includes(userRole)
            ? job.applicants
            : [...job.applicants, userRole],
        };
      })
    );
  };

  const assignJob = (jobId, workerRole) => {
    setJobs(
      jobs.map((job) =>
        job.id === jobId
          ? { ...job, status: "assigned", assignedTo: workerRole }
          : job
      )
    );
  };

  const completeJob = (jobId) => {
    setJobs(
      jobs.map((job) =>
        job.id === jobId
          ? {
              ...job,
              status: "completed",
              paid: true,
            }
          : job
      )
    );
  };

  const rateJob = (jobId, rating) => {
    setJobs(
      jobs.map((job) =>
        job.id === jobId
          ? { ...job, rating }
          : job
      )
    );
  };

  return (
    <JobContext.Provider
      value={{
        jobs,
        addJob,
        applyToJob,
        assignJob,
        completeJob,
        rateJob,
      }}
    >
      {children}
    </JobContext.Provider>
  );
}

export function useJobs() {
  return useContext(JobContext);
}
