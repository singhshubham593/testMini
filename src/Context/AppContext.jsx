import React, { createContext, useContext, useState } from "react";

const AppContext = createContext();
export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [users, setUsers] = useState([
    { email: "admin@company.com", role: "admin" },
    { email: "manager@company.com", role: "manager" },
    { email: "recruiter@company.com", role: "recruiter" }
  ]);

  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);

  return (
    <AppContext.Provider value={{ users, setUsers, jobs, setJobs, candidates, setCandidates }}>
      {children}
    </AppContext.Provider>
  );
};
