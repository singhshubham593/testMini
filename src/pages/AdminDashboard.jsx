import React, { useState } from "react";
import { useApp } from "../context/AppContext";

export default function AdminDashboard() {
  const { users, setUsers, jobs, candidates } = useApp();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("manager");

  const addUser = () => {
    if (email && email.includes("@company.com")) {
      setUsers([...users, { email, role }]);
      setEmail("");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Admin Dashboard</h2>
      <div className="flex gap-2 mb-4">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="newuser@company.com"
          className="border p-2 rounded"
        />
        <select value={role} onChange={(e) => setRole(e.target.value)} className="border p-2 rounded">
          <option value="manager">Manager</option>
          <option value="recruiter">Recruiter</option>
        </select>
        <button onClick={addUser} className="bg-green-500 px-4 py-2 text-white rounded">
          Add User
        </button>
      </div>

      <h3 className="font-semibold mt-4">All Jobs</h3>
      <ul className="list-disc pl-6">
        {jobs.map((job, i) => (
          <li key={i}>{job.title} ({job.description})</li>
        ))}
      </ul>

      <h3 className="font-semibold mt-4">All Candidates</h3>
      <ul className="list-disc pl-6">
        {candidates.map((c, i) => (
          <li key={i}>{c.name} - {c.email} (for {c.jobTitle})</li>
        ))}
      </ul>
    </div>
  );
}
