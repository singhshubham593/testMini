 import React, { useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { actions } from "../redux/appSlice";
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  ChevronRight,
  Mail,
  User,
  Phone,
  MapPin,
} from "lucide-react";
import AppShell from "./AppShell";

// UI Components (Card, SectionTitle, Sidebar, etc.)

const Card = ({ className = "", children }) => (
  <div className={`rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 ${className}`}>
    {children}
  </div>
);

const SectionTitle = ({ icon: Icon, title, right }) => (
  <div className="flex items-center justify-between gap-4 px-5 py-3 border-b border-gray-100">
    <div className="flex items-center gap-2 text-gray-800">
      {Icon && <Icon className="h-5 w-5" />}
      <h3 className="font-semibold">{title}</h3>
    </div>
    {right}
  </div>
);

function JobSidebar({ jobs, selectedJobId, onSelect }) {
  return (
    <aside className="w-full md:w-80 border-r border-gray-200 bg-white rounded-2xl ">
      <div className="p-4 ">
        <h2 className="text-lg font-semibold">Jobs</h2>
        <p className="text-sm text-gray-500">Created by managers</p>
      </div>
      <div className="px-2 space-y-2 overflow-auto max-h-[calc(100vh-96px)] pb-6  ">
        {jobs.map((job) => (
          <button
            key={job.id}
            onClick={() => onSelect(job.id)}
            className={`w-full mt-2 text-left p-3 rounded-xl transition shadow-sm ring-1 ${
              selectedJobId === job.id
                ? "bg-white ring-blue-500/50"
                : "bg-white hover:ring-gray-300 ring-gray-200"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <Briefcase className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{job.title}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Location: {job.location} | Salary: {job.salary}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}

function JobDetails({ job, onSelectApplicant }) {
  return (
    <div className="space-y-6">
      <Card>
        <SectionTitle icon={Briefcase} title="Job Details" />
        <div className="p-5 text-sm space-y-2">
          <div><strong>Title:</strong> {job.title}</div>
          <div><strong>Description:</strong> {job.description}</div>
          <div><strong>Skills:</strong> {job.skills.join(", ")}</div>
          <div><strong>Location:</strong> {job.location}</div>
          <div><strong>Salary:</strong> {job.salary}</div>
          <div><strong>Active:</strong> {job.isActive ? "Yes" : "No"}</div>
        </div>
      </Card>

      <Card>
        <SectionTitle icon={User} title={`Applicants`} />
        <div className="p-3">
          {job.applicants && job.applicants.length > 0 ? (
            <ul className=" grid grid-cols-2 lg:grid-cols-3 gap-3">
              {job.applicants.map((c) => (
                <li
                  key={c.id}
                  className="p-3 rounded-xl ring-1 ring-gray-200 hover:bg-gray-50 flex justify-between items-center"
                >
                  <div>
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-gray-500">{c.email}</div>
                  </div>
                  <button
                    onClick={() => onSelectApplicant(c)}
                    className="text-blue-600 text-sm hover:underline flex items-center gap-1"
                  >
                    View <ChevronRight className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500 text-sm p-4">No applicants yet.</div>
          )}
        </div>
      </Card>
    </div>
  );
}

function CandidateDetails({ candidate, onBack }) {
  const dispatch = useDispatch();
  const [note, setNote] = useState("");
  const [stage, setStage] = useState(candidate.status);

  const addNote = () => {
    if (!note.trim()) return;
    const newHistory = [...(candidate.contactHistory || []), { date: new Date().toISOString(), note }];
    dispatch(actions.updateCandidate({ id: candidate.id, updates: { contactHistory: newHistory } }));
    setNote("");
  };

  const updateStage = (e) => {
    setStage(e.target.value);
    dispatch(actions.updateCandidate({ id: candidate.id, updates: { status: e.target.value } }));
  };

  return (
    <div className="space-y-6">
      <button
        onClick={() => onBack()}
        className="text-sm text-gray-700 hover:underline flex items-center gap-1"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <Card>
        <SectionTitle icon={User} title="Candidate Details" />
        <div className="p-5 space-y-2 text-sm">
          <div><strong>Name:</strong> {candidate.name}</div>
          <div><strong>Email:</strong> {candidate.email}</div>
          <div><strong>Phone:</strong> {candidate.phone}</div>
          <div><strong>Notes:</strong> {candidate.notes}</div>
        </div>
      </Card>

      <Card>
        <SectionTitle icon={Calendar} title="Stage" />
        <div className="p-5">
          <select
            value={stage}
            onChange={updateStage}
            className="rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-500 p-2"
          >
            {["contacted","screening","shortlisted","interview","offer","hired"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </Card>

      <Card>
        <SectionTitle icon={Mail} title="Contact History" />
        <div className="p-5 space-y-2">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add note"
            className="w-full p-2 rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-500"
          />
          <button onClick={addNote} className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700">
            Add Note
          </button>

          <ul className="mt-3 space-y-2">
            {(candidate.contactHistory || []).map((h, i) => (
              <li key={i} className="p-2 rounded-xl bg-gray-50 ring-1 ring-gray-200 text-sm">
                {new Date(h.date).toLocaleDateString()}: {h.note}
              </li>
            ))}
          </ul>
        </div>
      </Card>
    </div>
  );
}

export default function RecruiterView() {
  const dispatch = useDispatch();
  const jobs = useSelector((state) => state.app.jobs);
  const candidates = useSelector((state) => state.app.candidates);

  // Map candidates to their jobs
  const jobsWithApplicants = useMemo(() =>
    jobs.map(j => ({
      ...j,
      applicants: candidates.filter(c => c.appliedForJob === j.id)
    })), [jobs, candidates]
  );

  const [selectedJobId, setSelectedJobId] = useState(jobsWithApplicants[0]?.id || null);
  const selectedJob = jobsWithApplicants.find(j => j.id === selectedJobId);

  const [view, setView] = useState("job");
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  function handleSelectCandidate(c) {
    setSelectedCandidate(c);
    setView("candidate");
  }

  function backToJob() {
    setView("job");
    setSelectedCandidate(null);
  }

  return (
    <AppShell>
      <div className="flex flex-col md:flex-row gap-6 w-full">
        <JobSidebar
          jobs={jobsWithApplicants}
          selectedJobId={selectedJobId}
          onSelect={(id) => { setSelectedJobId(id); backToJob(); }}
        />
        <main className="flex-1">
          {view === "job" && selectedJob && (
            <JobDetails job={selectedJob} onSelectApplicant={handleSelectCandidate} />
          )}
          {view === "candidate" && selectedCandidate && (
            <CandidateDetails candidate={selectedCandidate} onBack={backToJob} />
          )}
          {!selectedJob && <div className="text-gray-500">No job selected.</div>}
        </main>
      </div>
    </AppShell>
  );
}
