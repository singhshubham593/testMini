import React from "react";
import { useApp } from "../context/AppContext";

export default function RecruiterDashboard({ user }) {
  const { candidates } = useApp();
  const assigned = candidates.filter(c => c.recruiterEmail === user.email);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Recruiter Dashboard</h2>
      <h3 className="font-semibold">My Candidates</h3>
      <ul className="list-disc pl-6">
        {assigned.map((c, i) => (
          <li key={i}>{c.name} ({c.email}) - Applied for {c.jobTitle}</li>
        ))}
      </ul>
    </div>
  );
}
