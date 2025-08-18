 import React, { createContext, useContext, useMemo, useState } from "react";

/**
 * React + Tailwind CSS — Single-file Job Portal
 * Roles: Admin, Manager, Recruiter
 * Auth: Email login restricted to @company.com. Users must exist (admin-managed).
 * Admin: Add users (manager/recruiter), see all jobs & candidates.
 * Manager: Post jobs (basic details) and forward applicant data to a chosen recruiter per job.
 * Recruiter: See assigned jobs, contact candidates, and complete candidate forms.
 * Storage: In-memory via React Context (no persistence across refreshes).
 */

// ---------------------------
// Context & In-Memory Store
// ---------------------------
const AppContext = createContext(null);
const useApp = () => useContext(AppContext);

function AppProvider({ children }) {
  // Seed users — Admin is predefined; others can be added by Admin.
  const [users, setUsers] = useState([
    { id: 1, email: "admin@company.com", role: "admin", name: "Admin" },
    { id: 2, email: "manager@company.com", role: "manager", name: "Manager" },
    { id: 3, email: "recruiter@company.com", role: "recruiter", name: "Recruiter" },
  ]);

  // Jobs, Candidates
  const [jobs, setJobs] = useState([
    {
      id: 1,
      title: "Frontend Engineer",
      location: "Remote",
      type: "Full-time",
      salary: "₹18–28 LPA",
      description:
        "Build delightful UI with React + Tailwind. Collaborate with design & backend.",
      createdBy: 2, // manager id
      recruiterId: 3, // shared with which recruiter
      createdAt: new Date().toISOString(),
    },
  ]);

  // candidates: flat list; linked via jobId
  const [candidates, setCandidates] = useState([
    {
      id: 101,
      jobId: 1,
      name: "Ananya Sharma",
      email: "ananya@example.com",
      phone: "+91-98765-43210",
      notes: "Portfolio looks strong; React + TS.",
      status: "New",
      referredBy: 2, // manager id
      recruiterId: 3,
      contacted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]);

  const nextUserId = useMemo(() => users.reduce((m, u) => Math.max(m, u.id), 0) + 1, [users]);
  const nextJobId = useMemo(() => jobs.reduce((m, j) => Math.max(m, j.id), 0) + 1, [jobs]);
  const nextCandId = useMemo(
    () => candidates.reduce((m, c) => Math.max(m, c.id), 0) + 1,
    [candidates]
  );

  // --- Mutations ---
  const addUser = (email, role, name) => {
    if (!email || !role) return { ok: false, message: "Email & role required" };
    if (!email.endsWith("@company.com"))
      return { ok: false, message: "Only @company.com emails are allowed" };
    const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
    if (exists) return { ok: false, message: "User already exists" };
    const user = { id: nextUserId, email, role, name: name || email.split("@")[0] };
    setUsers((prev) => [...prev, user]);
    return { ok: true, user };
  };

  const addJob = (payload) => {
    const { title, description, location, type, salary, createdBy, recruiterId } = payload || {};
    if (!title || !description) return { ok: false, message: "Title & description are required" };
    const job = {
      id: nextJobId,
      title,
      description,
      location: location || "—",
      type: type || "—",
      salary: salary || "—",
      createdBy,
      recruiterId: recruiterId || null,
      createdAt: new Date().toISOString(),
    };
    setJobs((prev) => [job, ...prev]);
    return { ok: true, job };
  };

  const assignRecruiterToJob = (jobId, recruiterId) => {
    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, recruiterId } : j)));
  };

  const referApplicant = (jobId, applicant, managerId) => {
    if (!jobId || !applicant?.name || !applicant?.email || !applicant?.phone)
      return { ok: false, message: "Name, email & phone are required" };
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return { ok: false, message: "Invalid job" };
    const candidate = {
      id: nextCandId,
      jobId,
      name: applicant.name,
      email: applicant.email,
      phone: applicant.phone,
      notes: applicant.notes || "",
      status: "New",
      referredBy: managerId,
      recruiterId: job.recruiterId || null,
      contacted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCandidates((prev) => [candidate, ...prev]);
    return { ok: true, candidate };
  };

  const updateCandidate = (id, patch) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch, updatedAt: new Date().toISOString() } : c))
    );
  };

  const value = {
    users,
    jobs,
    candidates,
    addUser,
    addJob,
    assignRecruiterToJob,
    referApplicant,
    updateCandidate,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ---------------------------
// UI Primitives (Tailwind-only)
// ---------------------------
const Card = ({ title, subtitle, actions, children, className = "" }) => (
  <div className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
    {(title || actions) && (
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          {title && <h3 className="text-lg font-semibold text-slate-800">{title}</h3>}
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
    )}
    {children}
  </div>
);

const Button = ({ children, variant = "primary", className = "", ...props }) => {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-1";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-300",
    outline:
      "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:ring-blue-300",
    subtle: "bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-300",
    danger: "bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-300",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-300",
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Input = ({ label, hint, ...props }) => (
  <label className="flex w-full flex-col gap-1">
    {label && <span className="text-sm text-slate-600">{label}</span>}
    <input
      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-0 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      {...props}
    />
    {hint && <span className="text-xs text-slate-400">{hint}</span>}
  </label>
);

const TextArea = ({ label, rows = 4, ...props }) => (
  <label className="flex w-full flex-col gap-1">
    {label && <span className="text-sm text-slate-600">{label}</span>}
    <textarea
      rows={rows}
      className="w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-0 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      {...props}
    />
  </label>
);

const Select = ({ label, children, ...props }) => (
  <label className="flex w-full flex-col gap-1">
    {label && <span className="text-sm text-slate-600">{label}</span>}
    <select
      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      {...props}
    >
      {children}
    </select>
  </label>
);

const Badge = ({ children, color = "slate" }) => (
  <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium border-${color}-200 bg-${color}-50 text-${color}-700`}>{children}</span>
);

const Empty = ({ title, subtitle, action }) => (
  <div className="flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">
    <div className="mb-2 text-base font-semibold text-slate-700">{title}</div>
    <div className="mb-4 text-sm">{subtitle}</div>
    {action}
  </div>
);

// ---------------------------
// Auth
// ---------------------------
function Login({ onLogin }) {
  const { users } = useApp();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.endsWith("@company.com")) {
      setError("Only company emails (@company.com) are allowed.");
      return;
    }
    const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user) {
      setError("No account found. Ask Admin to add you as Manager or Recruiter.");
      return;
    }
    onLogin(user);
  };

  const quicks = ["admin@company.com", "manager@company.com", "recruiter@company.com"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-emerald-50">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-slate-800">Albireo Job Portal</h1>
            <p className="mt-2 text-sm text-slate-600">Login with your offical company email.</p>
          </div>
          <Card title="Email Login">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                label="Company Email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                required
              />
              {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>
              )}
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {quicks.map((q) => (
                    <Button key={q} type="button" variant="outline" onClick={() => setEmail(q)} className="text-xs">
                      {q}
                    </Button>
                  ))}
                </div>
                <Button type="submit">Submit</Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ---------------------------
// Dashboards
// ---------------------------
function AdminDashboard() {
  const { users, addUser, jobs, candidates } = useApp();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("manager");
  const [msg, setMsg] = useState("");

  const handleAdd = (e) => {
    e.preventDefault();
    const { ok, message } = addUser(email.trim(), role, name.trim());
    setMsg(ok ? "User added" : message);
    if (ok) {
      setEmail("");
      setName("");
      setRole("manager");
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card title="Add User" subtitle="Create Manager or Recruiter accounts" className="lg:col-span-1">
        <form onSubmit={handleAdd} className="flex flex-col gap-4">
          <Input label="Name" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Company Email" type="email" placeholder="user@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Select label="Role" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="manager">Manager</option>
            <option value="recruiter">Recruiter</option>
          </Select>
          {msg && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">{msg}</div>
          )}
          <div className="flex justify-end"><Button type="submit">Add</Button></div>
        </form>
      </Card>

      <Card title="Users" className="lg:col-span-2">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
              <div>
                <div className="text-sm font-semibold text-slate-800">{u.name} <span className="font-normal text-slate-500">({u.email})</span></div>
                <div className="text-xs text-slate-500">ID: {u.id}</div>
              </div>
              <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 uppercase">{u.role}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card title="All Jobs" className="lg:col-span-3">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {jobs.map((j) => (
            <JobCard key={j.id} job={j} adminView />
          ))}
        </div>
        {jobs.length === 0 && <Empty title="No jobs yet" subtitle="Managers can post jobs from their dashboard" />}
      </Card>

      <Card title="All Candidates" className="lg:col-span-3">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {candidates.map((c) => (
            <CandidateCard key={c.id} candidate={c} />
          ))}
        </div>
        {candidates.length === 0 && <Empty title="No candidates yet" subtitle="Managers can refer applicants; Recruiters complete profiles" />}
      </Card>
    </div>
  );
}

function ManagerDashboard({ currentUser }) {
  const { jobs, addJob, users, assignRecruiterToJob, referApplicant, candidates } = useApp();
  const [form, setForm] = useState({ title: "", location: "", type: "Full-time", salary: "", description: "", recruiterId: "" });
  const [app, setApp] = useState({ jobId: "", name: "", email: "", phone: "", notes: "" });
  const [msg, setMsg] = useState("");

  const recruiters = users.filter((u) => u.role === "recruiter");
  const myJobs = jobs.filter((j) => j.createdBy === currentUser.id);
  const myCandidates = candidates.filter((c) => c.referredBy === currentUser.id);

  const handlePost = (e) => {
    e.preventDefault();
    const { ok, message, job } = addJob({ ...form, createdBy: currentUser.id, recruiterId: form.recruiterId ? Number(form.recruiterId) : null });
    setMsg(ok ? "Job posted" : message);
    if (ok) setForm({ title: "", location: "", type: "Full-time", salary: "", description: "", recruiterId: "" });
  };

  const handleAssign = (jobId, recruiterId) => assignRecruiterToJob(jobId, Number(recruiterId));

  const handleRefer = (e) => {
    e.preventDefault();
    const { ok, message } = referApplicant(Number(app.jobId), app, currentUser.id);
    setMsg(ok ? "Applicant shared with recruiter" : message);
    if (ok) setApp({ jobId: "", name: "", email: "", phone: "", notes: "" });
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card title="Post a Job" subtitle="Basic details" className="lg:col-span-1">
        <form onSubmit={handlePost} className="flex flex-col gap-3">
          <Input label="Title" placeholder="e.g., React Developer" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Location" placeholder="e.g., Bengaluru / Remote" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            <Select label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Contract</option>
              <option>Internship</option>
            </Select>
          </div>
          <Input label="Salary Range" placeholder="₹ — LPA" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} />
          <TextArea label="Description" rows={5} placeholder="Responsibilities, stack, perks…" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <Select label="Share with Recruiter" value={form.recruiterId} onChange={(e) => setForm({ ...form, recruiterId: e.target.value })}>
            <option value="">— None —</option>
            {recruiters.map((r) => (
              <option key={r.id} value={r.id}>{r.name} ({r.email})</option>
            ))}
          </Select>
          {msg && <div className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">{msg}</div>}
          <div className="flex justify-end"><Button type="submit">Post Job</Button></div>
        </form>
      </Card>

      <Card title="Your Jobs" className="lg:col-span-2">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {myJobs.map((j) => (
            <div key={j.id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="mb-1 text-base font-semibold text-slate-800">{j.title}</div>
              <div className="text-xs text-slate-600">{j.location || "—"} • {j.type || "—"} • {j.salary || "—"}</div>
              <div className="mt-2 line-clamp-3 text-sm text-slate-700">{j.description}</div>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                <span>Shared with: {j.recruiterId ? users.find((u) => u.id === j.recruiterId)?.name : "—"}</span>
                <span>{new Date(j.createdAt).toLocaleString()}</span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Select value={j.recruiterId || ""} onChange={(e) => handleAssign(j.id, e.target.value)}>
                  <option value="">Assign recruiter…</option>
                  {recruiters.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </Select>
              </div>
            </div>
          ))}
        </div>
        {myJobs.length === 0 && <Empty title="No jobs yet" subtitle="Post your first job to get started" />}
      </Card>

      <Card title="Refer Applicant" subtitle="Forward application to the job's recruiter" className="lg:col-span-3">
        <form onSubmit={handleRefer} className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Select label="Job" value={app.jobId} onChange={(e) => setApp({ ...app, jobId: e.target.value })}>
            <option value="">Select a job…</option>
            {myJobs.map((j) => (
              <option key={j.id} value={j.id}>{j.title}</option>
            ))}
          </Select>
          <Input label="Applicant Name" placeholder="e.g., Rahul Verma" value={app.name} onChange={(e) => setApp({ ...app, name: e.target.value })} required />
          <Input label="Email" type="email" placeholder="candidate@example.com" value={app.email} onChange={(e) => setApp({ ...app, email: e.target.value })} required />
          <Input label="Phone" placeholder="+91-9xxxxxxxxx" value={app.phone} onChange={(e) => setApp({ ...app, phone: e.target.value })} required />
          <TextArea label="Notes" rows={3} placeholder="Short summary, source, etc." value={app.notes} onChange={(e) => setApp({ ...app, notes: e.target.value })} />
          <div className="flex items-end justify-end md:col-span-3"><Button type="submit" variant="success">Share with Recruiter</Button></div>
        </form>

        <div className="mt-6">
          <div className="mb-2 text-sm font-semibold text-slate-800">Applicants you've referred</div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {myCandidates.map((c) => (
              <CandidateCard key={c.id} candidate={c} />
            ))}
          </div>
          {myCandidates.length === 0 && <Empty title="No applicants shared yet" subtitle="Use the form above to share candidates with recruiters" />}
        </div>
      </Card>
    </div>
  );
}

function RecruiterDashboard({ currentUser }) {
  const { jobs, candidates, updateCandidate } = useApp();
  const myJobs = jobs.filter((j) => j.recruiterId === currentUser.id);
  const myCandidates = candidates.filter((c) => c.recruiterId === currentUser.id);

  const [active, setActive] = useState(myCandidates[0]?.id || null);
  const activeCand = myCandidates.find((c) => c.id === active) || null;

  const setCand = (patch) => activeCand && updateCandidate(activeCand.id, patch);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card title="Assigned Jobs" className="lg:col-span-1">
        {myJobs.length === 0 && <Empty title="No jobs assigned" subtitle="Managers will share jobs with you" />}
        <div className="flex flex-col gap-2">
          {myJobs.map((j) => (
            <div key={j.id} className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="text-sm font-semibold text-slate-800">{j.title}</div>
              <div className="text-xs text-slate-600">{j.location || "—"} • {j.type || "—"} • {j.salary || "—"}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Referred Candidates" className="lg:col-span-2">
        {myCandidates.length === 0 && <Empty title="No candidates yet" subtitle="Managers will refer applicants to your assigned jobs" />}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="md:col-span-1">
            <div className="flex flex-col gap-2">
              {myCandidates.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActive(c.id)}
                  className={`rounded-xl border px-3 py-2 text-left text-sm transition ${active === c.id ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}
                >
                  <div className="font-semibold text-slate-800">{c.name}</div>
                  <div className="text-xs text-slate-600">{jobs.find((j) => j.id === c.jobId)?.title || "—"}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            {activeCand ? (
              <div className="grid grid-cols-1 gap-3">
                <div className="text-base font-semibold text-slate-800">{activeCand.name}</div>
                <div className="text-xs text-slate-600">{activeCand.email} • {activeCand.phone}</div>
                <Select label="Status" value={activeCand.status} onChange={(e) => setCand({ status: e.target.value })}>
                  <option>New</option>
                  <option>Contacted</option>
                  <option>Interview Scheduled</option>
                  <option>Rejected</option>
                  <option>Offer</option>
                </Select>
                <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" checked={activeCand.contacted} onChange={(e) => setCand({ contacted: e.target.checked, status: e.target.checked ? "Contacted" : activeCand.status })} />
                  Candidate contacted
                </label>
                <TextArea label="Notes" rows={5} value={activeCand.notes} onChange={(e) => setCand({ notes: e.target.value })} placeholder="Call summary, feedback, next steps…" />
                <div className="text-right text-xs text-slate-500">Last updated {new Date(activeCand.updatedAt).toLocaleString()}</div>
              </div>
            ) : (
              <Empty title="Select a candidate" subtitle="Pick a candidate from the left list to view & edit details" />
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

// ---------------------------
// Small display components
// ---------------------------
const JobCard = ({ job, adminView = false }) => {
  const { users } = useApp();
  const manager = users.find((u) => u.id === job.createdBy);
  // const recruiter = job.recruiterId ? users.find((u) => u.id === job.recruiterId) : null;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-1 text-base font-semibold text-slate-800">{job.title}</div>
      <div className="text-xs text-slate-600">{job.location || "—"} • {job.type || "—"} • {job.salary || "—"}</div>
      <div className="mt-2 line-clamp-3 text-sm text-slate-700">{job.description}</div>
      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <span>Manager: {manager?.name || "—"}</span>
        {/* <span>Recruiter: {recruiter?.name || "—"}</span> */}
      </div>
      {adminView && <div className="mt-1 text-[11px] text-slate-400">{new Date(job.createdAt).toLocaleString()}</div>}
    </div>
  );
};

const CandidateCard = ({ candidate }) => {
  const { jobs, users } = useApp();
  const job = jobs.find((j) => j.id === candidate.jobId);
  const recruiter = candidate.recruiterId ? users.find((u) => u.id === candidate.recruiterId) : null;
  const manager = users.find((u) => u.id === candidate.referredBy);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm font-semibold text-slate-800">{candidate.name}</div>
          <div className="text-xs text-slate-600">{candidate.email} • {candidate.phone}</div>
        </div>
        <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${candidate.status === "Offer" ? "bg-emerald-100 text-emerald-700" : candidate.status === "Rejected" ? "bg-rose-100 text-rose-700" : candidate.status === "Interview Scheduled" ? "bg-indigo-100 text-indigo-700" : candidate.status === "Contacted" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700"}`}>{candidate.status}</span>
      </div>
      <div className="mt-2 text-xs text-slate-600">Job: {job?.title || "—"}</div>
      <div className="mt-2 text-xs text-slate-600">Recruiter: {recruiter?.name || "—"} • Referred by: {manager?.name || "—"}</div>
      {candidate.notes && <div className="mt-2 text-sm text-slate-700">{candidate.notes}</div>}
      <div className="mt-2 text-[11px] text-slate-400">{new Date(candidate.createdAt).toLocaleString()}</div>
    </div>
  );
};

// ---------------------------
// App Shell
// ---------------------------
function Shell({ currentUser, onLogout, children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-emerald-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow">
              <span className="text-sm font-bold">SS</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-800">Shubham Singh</div>
              {/* <div className="text-xs text-slate-500">Admin • Manager • Recruiter</div> */}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm sm:inline">
              {currentUser.email}
            </span>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase text-emerald-700">
              {currentUser.role}
            </span>
            <Button variant="outline" onClick={onLogout}>Logout</Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl p-6">{children}</main>
      <footer className="mx-auto max-w-7xl p-6 pb-10 text-center text-xs text-slate-500">React Hooks • Context • Tailwind CSS — In-memory demo</footer>
    </div>
  );
}

// ---------------------------
// Root App
// ---------------------------
export default function App() {
  const [currentUser, setCurrentUser] = useState(null);

  return (
    <AppProvider>
      {!currentUser ? (
        <Login onLogin={setCurrentUser} />
      ) : (
        <Shell currentUser={currentUser} onLogout={() => setCurrentUser(null)}>
          {currentUser.role === "admin" && <AdminDashboard />}
          {currentUser.role === "manager" && <ManagerDashboard currentUser={currentUser} />}
          {currentUser.role === "recruiter" && <RecruiterDashboard currentUser={currentUser} />}
        </Shell>
      )}
    </AppProvider>
  );
}
