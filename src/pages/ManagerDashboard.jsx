import React, { useState } from "react";
import { useApp } from "../context/AppContext";

export default function ManagerDashboard() {
  const { jobs, setJobs, users, candidates, setCandidates } = useApp();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [selectedJob, setSelectedJob] = useState("");
  const [candidate, setCandidate] = useState({ name: "", email: "" });
  const recruiters = users.filter(u => u.role === "recruiter");

  const addJob = () => {
    setJobs([...jobs, { id: Date.now(), title, description: desc }]);
    setTitle(""); setDesc("");
  };

  const referCandidate = (recruiterEmail) => {
    setCandidates([...candidates, { ...candidate, recruiterEmail, jobTitle: selectedJob }]);
    setCandidate({ name: "", email: "" });
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Manager Dashboard</h2>
      <div className="mb-6">
        <h3 className="font-semibold">Post Job</h3>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Job Title" className="border p-2 w-full rounded mb-2"/>
        <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description" className="border p-2 w-full rounded mb-2"/>
        <button onClick={addJob} className="bg-blue-600 text-white px-4 py-2 rounded">Post Job</button>
      </div>

      <div>
        <h3 className="font-semibold">Refer Candidate</h3>
        <select value={selectedJob} onChange={e => setSelectedJob(e.target.value)} className="border p-2 w-full rounded mb-2">
          <option value="">Select Job</option>
          {jobs.map(j => <option key={j.id} value={j.title}>{j.title}</option>)}
        </select>
        <input value={candidate.name} onChange={e => setCandidate({ ...candidate, name: e.target.value })} placeholder="Candidate Name" className="border p-2 w-full rounded mb-2"/>
        <input value={candidate.email} onChange={e => setCandidate({ ...candidate, email: e.target.value })} placeholder="Candidate Email" className="border p-2 w-full rounded mb-2"/>
        <div className="flex gap-2">
          {recruiters.map(r => (
            <button key={r.email} onClick={() => referCandidate(r.email)} className="bg-green-600 text-white px-4 py-2 rounded">
              Send to {r.email}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
