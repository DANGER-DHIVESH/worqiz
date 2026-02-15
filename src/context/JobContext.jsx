import { createContext, useContext, useState } from "react";
import { useAuth } from "./AuthContext";

const JobContext = createContext();

export function JobProvider({ children }) {
  const [jobs, setJobs] = useState([
    {
      id: 1,
      title: "Event Helper",
      pay: 500,
      duration: "3 Hours",
      applicants: [],
    },
  ]);

  const addJob = (job) => {
    setJobs([
      ...jobs,
      {
        ...job,
        id: Date.now(),
        applicants: [],
      },
    ]);
  };

  const applyToJob = (jobId, userRole) => {
    setJobs(
      jobs.map((job) =>
        job.id === jobId
          ? {
              ...job,
              applicants: [...job.applicants, userRole],
            }
          : job
      )
    );
  };

  return (
    <JobContext.Provider value={{ jobs, addJob, applyToJob }}>
      {children}
    </JobContext.Provider>
  );
}

export function useJobs() {
  return useContext(JobContext);
}
