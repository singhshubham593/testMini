 import React, { createContext, useContext, useEffect, useMemo, useReducer, useState } from "react";

/**
 * Single-file React Job Portal (Admin • Manager • Recruiter)
 * - Tailwind CSS only (assumes Tailwind is set up in the host project)
 * - Login: Email / WhatsApp (mock) / Google (mock)
 * - Full linking: Admin → Manager → Recruiter → Candidate → Status
 * - All data in React Context (in-memory)
 * - Beautiful, modern UI using Tailwind utility classes
 */

/* --------------------
   Role & Dummy Auth
   -------------------- */
const COMPANY_DOMAIN = "company.com";
const PREDEFINED = {
  admin: ["admin@company.com"],
  managers: ["manager@company.com", "manager2@company.com"],
  recruiters: ["recruiter@company.com", "recruiter2@company.com"],
};

const detectRole = (email) => {
  if (!email) return null;
  const e = email.toLowerCase().trim();
  if (PREDEFINED.admin.includes(e)) return "admin";
  if (PREDEFINED.managers.includes(e)) return "manager";
  if (PREDEFINED.recruiters.includes(e)) return "recruiter";
  if (e.endsWith(`@${COMPANY_DOMAIN}`)) return "manager"; // default to manager for same-company emails
  return null;
};

let nextIds = { user: 10, job: 10, candidate: 100 };

/* -----------------
   Initial in-memory DB
   ----------------- */
const initialState = {
  currentUser: null,
  users: [
    { id: 1, name: "Admin User", email: "admin@company.com", role: "admin" },
    { id: 2, name: "Maya Kapoor", email: "manager@company.com", role: "manager" },
    { id: 3, name: "Sahil Rao", email: "recruiter@company.com", role: "recruiter" },
  ],
  jobs: [
    { id: 1, title: "Frontend Engineer", description: "React + Tailwind", skills: ["React","Tailwind"], salary: "₹10-15 LPA", location: "Bengaluru", createdBy: 2, createdAt: new Date().toISOString() },
    { id: 2, title: "Backend Engineer", description: "Node.js APIs", skills: ["Node","SQL"], salary: "₹12-18 LPA", location: "Remote", createdBy: 2, createdAt: new Date().toISOString() },
    { id: 3, title: "React Developer", description: "Node.js APIs", skills: ["Node","SQL"], salary: "₹12-18 LPA", location: "Remote", createdBy: 2, createdAt: new Date().toISOString() },
    { id: 4, title: "Next js Engineer", description: "Node.js APIs", skills: ["Node","SQL"], salary: "₹12-18 LPA", location: "Remote", createdBy: 2, createdAt: new Date().toISOString() },
    { id: 5, title: "Node Engineer", description: "Node.js APIs", skills: ["Node","SQL"], salary: "₹12-18 LPA", location: "Remote", createdBy: 2, createdAt: new Date().toISOString() }
  ],
  candidates: [
    { id: 1, name: "Riya Sen", email: "riya@example.com", phone: "+91 90000 11111", resume: "https://example.com/riya.pdf", notes: "Strong API skills", appliedForJob: 2, referredBy: 3, status: "contacted", contactHistory: [{ date: new Date().toISOString(), note: "WhatsApp message" }] },
  ],
};

/* ---------
   Reducer
   --------- */
function reducer(state, action) {
  switch (action.type) {
    case "LOGIN":
      return { ...state, currentUser: action.payload };
    case "LOGOUT":
      return { ...state, currentUser: null };
    case "ADD_USER": {
      const user = { id: nextIds.user++, ...action.payload };
      return { ...state, users: [...state.users, user] };
    }
    case "ADD_JOB": {
      const job = { id: nextIds.job++, createdAt: new Date().toISOString(), ...action.payload };
      return { ...state, jobs: [job, ...state.jobs] };
    }
    case "ADD_CANDIDATE": {
      const cand = { id: nextIds.candidate++, contactHistory: [], ...action.payload };
      return { ...state, candidates: [cand, ...state.candidates] };
    }
    case "UPDATE_CANDIDATE": {
      const { id, updates } = action.payload;
      const candidates = state.candidates.map((c) => (c.id === id ? { ...c, ...updates } : c));
      return { ...state, candidates };
    }
    default:
      return state;
  }
}

/* -------
   Context
   ------- */
const AppDB = createContext(null);
const useDB = () => useContext(AppDB);

/* ------------------
   Small UI primitives
   ------------------ */
const Badge = ({ children, className = "" }) => (
  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>{children}</span>
);

const Button = ({ children, className = "", ...rest }) => (
  <button {...rest} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold shadow-sm ${className}`}>{children}</button>
);

const Card = ({ title, subtitle, right, children }) => (
  <div className="rounded-2xl border border-yellow-200 bg-white shadow-sm">
    <div className="flex items-start justify-between gap-4 border-b border-yellow-100 p-4">
      <div>
        <h3 className="text-base font-semibold text-blue-500">{title}</h3>
        {subtitle && <p className="text-xs text-blue-500 mt-0.5">{subtitle}</p>}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
    <div className="p-4">{children}</div>
  </div>
);

/* ------------------
   Login Component
   ------------------ */
function Login() {
  const { state, dispatch } = useDB();
  const [email, setEmail] = useState("");
  const [method, setMethod] = useState("email");
  const [error, setError] = useState("");

  const handleLogin = (simulateEmail) => {
    const e = (simulateEmail || email).trim().toLowerCase();
    if (!e) return setError("Please enter email");
    const role = detectRole(e);
    if (!role) return setError("Unauthorized email — use company email or demo buttons");

    // find existing user or create transient one
    const existing = state.users.find((u) => u.email === e);
    const user = existing || { id: nextIds.user++, name: e.split('@')[0], email: e, role };
    dispatch({ type: 'LOGIN', payload: user });
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-yellow-50 to-blue-50 p-6">
      <div className="w-full max-w-xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-blue-600 text-white grid place-content-center text-xl">💼</div>
          <h1 className="text-2xl font-bold text-blue-800">Company Job Portal</h1>
          <p className="text-sm text-blue-500 mt-1">Admin • Manager • Recruiter — demo auth</p>
        </div>

        <Card title="Sign in" subtitle="Email / WhatsApp (mock) / Google (mock)">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <Button onClick={() => setMethod('email')} className={`${method==='email' ? 'bg-blue-600 text-white' : 'border'}`}>Email</Button>
            <Button onClick={() => setMethod('whatsapp')} className={`${method==='whatsapp' ? 'bg-green-500 text-white' : 'border'}`}>WhatsApp</Button>
            <Button onClick={() => setMethod('google')} className={`${method==='google' ? 'bg-red-500 text-white' : 'border'}`}>Google</Button>
          </div>

          <form onSubmit={(e)=>{ e.preventDefault(); handleLogin(); }} className="space-y-3">
            <label className="block text-sm">
              <div className="flex items-center gap-1 font-medium text-blue-700">{method==='whatsapp' ? 'WhatsApp-linked Email' : 'Email'}</div>
              <input value={email} onChange={(e)=>setEmail(e.target.value)} className="mt-1 w-full rounded-lg border border-yellow-200 px-3 py-2" placeholder="you@company.com" />
            </label>
            {error && <div className="text-xs text-rose-600">{error}</div>}
            <div className="flex gap-3">
              <Button type="submit" className="bg-blue-600 text-white">Sign in</Button>
              <Button type="button" className="border" onClick={() => handleLogin('admin@company.com')}>Demo Admin</Button>
              <Button type="button" className="border" onClick={() => handleLogin('manager@company.com')}>Demo Manager</Button>
              <Button type="button" className="border" onClick={() => handleLogin('recruiter@company.com')}>Demo Recruiter</Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

/* ------------------
   App Shell
   ------------------ */
function AppShell({ children }) {
  const { state, dispatch } = useDB();
  const user = state.currentUser;
  return (
    <div className="min-h-screen bg-yellow-50">
      <header className="sticky top-0 z-20 bg-white border-b border-yellow-200">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-600 text-white grid place-content-center">💼</div>
            <div>
              <p className="text-sm font-semibold text-blue-800">Albireo Work</p>
              <p className="text-xs text-blue-500">{user?.name || 'Guest'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-blue-600">Role: <span className="font-semibold">{user?.role}</span></span>
            {user && <button onClick={()=>dispatch({type:'LOGOUT'})} className="rounded-lg border px-3 py-2 text-sm">Logout</button>}
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-6 flex gap-6 items-start">
        {children}
      </div>
    </div>
  );
}

/* ------------------
   Sidebar Component
   ------------------ */
const Sidebar = ({ items }) => (
  <aside className="rounded-2xl border border-yellow-200 bg-white p-3 shadow-sm h-fit w-64 shrink-0">
    <div className="px-2 pb-1">
      <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Dashboard</p>
    </div>
    <nav className="mt-1 space-y-1">
      {items.map((it) => (
        <button key={it.label} onClick={it.onClick} className={`w-full text-left rounded-xl px-3 py-2 text-sm font-medium flex items-center justify-between ${it.active ? 'bg-blue-400 text-yellow-400' : 'hover:bg-yellow-50 text-blue-700'}`}>
          <span className="flex items-center gap-2">{it.icon} {it.label}</span>
          {!!it.count && <span className="text-xs">{it.count}</span>}
        </button>
      ))}
  </nav>
  </aside>
);

/* ------------------
   Admin View
   ------------------ */
function AdminView() {
  const { state, dispatch } = useDB();
  const [tab, setTab] = useState('overview');
  const [form, setForm] = useState({ name:'', email:'', role:'manager' });

  const managers = state.users.filter(u=>u.role==='manager');
  const recruiters = state.users.filter(u=>u.role==='recruiter');

  const addUser = (e)=>{ e.preventDefault(); if(!form.name||!form.email) return; dispatch({type:'ADD_USER', payload:form}); setForm({name:'',email:'',role:'manager'}); }

  const ManagerDetail = ({manager})=>{
    const jobs = state.jobs.filter(j=>j.createdBy===manager.id);
    return (
      <div>
        <h4 className="text-sm font-semibold">Jobs by {manager.name}</h4>
        <div className="mt-3 space-y-3">
          {jobs.length===0 && <p className="text-sm text-blue-500">No jobs posted.</p>}
          {jobs.map(j=>{
            const candidates = state.candidates.filter(c=>c.appliedForJob===j.id);
            return (
              <div key={j.id} className="rounded-lg border p-3 bg-yellow-50">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-blue-700">{j.title}</p>
                    <p className="text-xs text-blue-500">{j.location} • {j.salary}</p>
                  </div>
                  <div className="text-xs text-blue-600">{candidates.length} applicants</div>
                </div>
                <div className="mt-2">
                  {candidates.map(c=> (
                    <div key={c.id} className="flex items-center justify-between mt-2">
                      <div>
                        <p className="text-sm font-medium">{c.name}</p>
                        <p className="text-xs text-blue-500">Referred by: {state.users.find(u=>u.id===c.referredBy)?.name || '—'}</p>
                      </div>
                      <Badge className="bg-slate-100 text-blue-700">{c.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const RecruiterDetail = ({recruiter})=>{
    const referred = state.candidates.filter(c=>c.referredBy===recruiter.id);
    return (
      <div>
        <h4 className="text-sm font-semibold text-blue-700">Referrals by Manager Name</h4>
        <div className="mt-2 space-y-2">
          {referred.length===0 && <p className="text-sm text-blue-500">No referrals yet.</p>}
          {referred.map(c=> (
            <div key={c.id} className="rounded-lg border p-3 bg-yellow-50 flex items-start justify-between">
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-blue-500">Applied: {state.jobs.find(j=>j.id===c.appliedForJob)?.title || '—'}</p>
              </div>
              <div className="text-xs text-blue-600">{c.status}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <AppShell>
      <Sidebar items={[
        { label:'Overview', icon:'📊', active: tab==='overview', onClick:()=>setTab('overview') },
        { label:'Add Manager / Recruiter', icon:'➕', active: tab==='add', onClick:()=>setTab('add') },
        { label:`Total Managers`, icon:'👥', active: tab==='managers', onClick:()=>setTab('managers'), count: managers.length },
        { label:`Total Recruiters`, icon:'🧑‍💼', active: tab==='recruiters', onClick:()=>setTab('recruiters'), count: recruiters.length },
      ]} />

      <main className="flex-1 min-w-0">
        {tab==='overview' && (
          <div className="space-y-6">
            <Card title="Platform Summary">
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="rounded-lg border p-4 bg-yellow-50 text-center">
                  <p className="text-xs text-blue-500">Managers</p>
                  <p className="text-xl font-semibold text-blue-500">{managers.length}</p>
                </div>
                <div className="rounded-lg border p-4 bg-yellow-50 text-center">
                  <p className="text-xs text-blue-500">Recruiters</p>
                  <p className="text-xl font-semibold text-blue-500">{recruiters.length}</p>
                </div>
                <div className="rounded-lg border p-4 bg-yellow-50 text-center">
                  <p className="text-xs text-blue-500">Open Jobs</p>
                  <p className="text-xl font-semibold text-blue-500">{state.jobs.length}</p>
                </div>
              </div>
            </Card>

            <Card title="Recent Jobs" subtitle="Latest posts">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {state.jobs.map(j => (
                  <div key={j.id} className="rounded-lg border p-3">
                    <p className="font-semibold">{j.title}</p>
                    <p className="text-xs text-blue-500">{j.location} • {j.salary}</p>
                    <p className="text-xs mt-2 text-blue-600">Posted by: {state.users.find(u=>u.id===j.createdBy)?.name}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {tab==='add' && (
          <Card title="Add User">
            <form onSubmit={addUser} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block text-sm"><div className="font-medium">Full name</div><input className="mt-1 w-full rounded-lg border px-3 py-2" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} /></label>
              <label className="block text-sm"><div className="font-medium">Email</div><input className="mt-1 w-full rounded-lg border px-3 py-2" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} /></label>
              <label className="block text-sm"><div className="font-medium">Role</div><select className="mt-1 w-full rounded-lg border px-3 py-2" value={form.role} onChange={(e)=>setForm({...form,role:e.target.value})}><option value="manager">Manager</option><option value="recruiter">Recruiter</option></select></label>
              <div className="sm:col-span-2 flex gap-3 items-center"><Button type="submit" className="bg-blue-600 text-white">Create</Button><Button type="button" className="border" onClick={()=>setForm({name:'',email:'',role:'manager'})}>Clear</Button></div>
            </form>
          </Card>
        )}

        {tab==='managers' && (
          <Card title={`Managers (${managers.length})`} subtitle="Click to inspect each manager">
            <div className="grid sm:grid-cols-2 gap-4">
              {managers.map(m => (
                <details key={m.id} className="rounded-lg border p-3"><summary className="cursor-pointer flex items-center justify-between"><div><p className="font-semibold">{m.name}</p><p className="text-xs text-blue-500">{m.email}</p></div><div className="text-xs text-blue-600">View</div></summary><div className="mt-3"><ManagerDetail manager={m} /></div></details>
              ))}
            </div>
          </Card>
        )}

        {tab==='recruiters' && (
          <Card title={`Recruiters (${recruiters.length})`} subtitle="Click to inspect each recruiter">
            <div className="grid sm:grid-cols-2 gap-4">
              {recruiters.map(r => (
                <details key={r.id} className="rounded-lg border p-3"><summary className="cursor-pointer flex items-center justify-between"><div><p className="font-semibold">{r.name}</p><p className="text-xs text-blue-500">{r.email}</p></div><div className="text-xs text-blue-600">View</div></summary><div className="mt-3"><RecruiterDetail recruiter={r} /></div></details>
              ))}
            </div>
          </Card>
        )}
      </main>
    </AppShell>
  );
}

/* ------------------
   Manager View
   ------------------ */
function ManagerView() {
  const { state, dispatch } = useDB();
  const user = state.currentUser;
  const myJobs = state.jobs.filter(j => j.createdBy === user.id);
  const [tab, setTab] = useState('jobs');
  const [form, setForm] = useState({ title:'', description:'', skills:'', salary:'', location:'' });

  const postJob = (e)=>{ e.preventDefault(); if(!form.title) return; const payload = {...form, skills: form.skills.split(',').map(s=>s.trim()).filter(Boolean), createdBy: user.id }; dispatch({type:'ADD_JOB', payload}); setForm({ title:'', description:'', skills:'', salary:'', location:'' }); setTab('jobs'); }

  return (
    <AppShell>
      <Sidebar items={[
        { label:'Profile', icon:'👤', active: tab==='profile', onClick:()=>setTab('profile') },
        { label:'Create New Job Post', icon:'➕', active: tab==='create', onClick:()=>setTab('create') },
        { label:'Total Jobs Posted', icon:'📋', active: tab==='jobs', onClick:()=>setTab('jobs'), count: myJobs.length },
        { label:'Applications per Job', icon:'🧾', active: tab==='apps', onClick:()=>setTab('apps') },
      ]} />

      <main className="flex-1 min-w-0">
        {tab==='profile' && <Card title="Profile" subtitle={user.name}><p className="text-sm">Email: {user.email}</p></Card>}

        {tab==='create' && (
          <Card title="Create Job" subtitle="Fill basic details">
            <form onSubmit={postJob} className="grid grid-cols-1 gap-3">
              <label className="block text-sm"><div className="font-medium">Title</div><input className="mt-1 w-full rounded-lg border px-3 py-2" value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})} /></label>
              <label className="block text-sm"><div className="font-medium">Description</div><textarea className="mt-1 w-full rounded-lg border px-3 py-2" value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} /></label>
              <div className="grid sm:grid-cols-2 gap-3">
                <label className="block text-sm"><div className="font-medium">Skills (comma)</div><input className="mt-1 w-full rounded-lg border px-3 py-2" value={form.skills} onChange={(e)=>setForm({...form,skills:e.target.value})} /></label>
                <label className="block text-sm"><div className="font-medium">Salary</div><input className="mt-1 w-full rounded-lg border px-3 py-2" value={form.salary} onChange={(e)=>setForm({...form,salary:e.target.value})} /></label>
                <label className="block text-sm sm:col-span-2"><div className="font-medium">Location</div><input className="mt-1 w-full rounded-lg border px-3 py-2" value={form.location} onChange={(e)=>setForm({...form,location:e.target.value})} /></label>
              </div>
              <div className="flex gap-3"><Button type="submit" className="bg-blue-600 text-white">Publish Job</Button><Button type="button" className="border" onClick={()=>setForm({ title:'', description:'', skills:'', salary:'', location:'' })}>Clear</Button></div>
            </form>
          </Card>
        )}

        {tab==='jobs' && (
          <Card title={`My Jobs (${myJobs.length})`} subtitle="Jobs posted by you">
            <div className="grid sm:grid-cols-2 gap-4">
              {myJobs.map(j=> (
                <div key={j.id} className="rounded-lg border p-3">
                  <p className="font-semibold">{j.title}</p>
                  <p className="text-xs text-blue-500">{j.location} • {j.salary}</p>
                  <p className="text-sm text-blue-700 mt-2 line-clamp-2">{j.description}</p>
                  <div className="text-xs text-blue-700 mt-2">Applicants: {state.candidates.filter(c=>c.appliedForJob===j.id).length}</div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {tab==='apps' && (
          <Card title="Applications" subtitle="Applications for your jobs">
            <div className="space-y-3">
              {state.candidates.filter(c=> myJobs.some(j=>j.id===c.appliedForJob)).map(c=> (
                <div key={c.id} className="rounded-lg border p-3 bg-yellow-50 flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{c.name}</p>
                    <p className="text-xs text-blue-500">Applied for: {state.jobs.find(j=>j.id===c.appliedForJob)?.title}</p>
                    <p className="text-xs text-blue-700">Referred by: {state.users.find(u=>u.id===c.referredBy)?.name}</p>
                  </div>
                  <div className="text-xs text-blue-700">{c.status}</div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </main>
    </AppShell>
  );
}

/* ------------------
   Recruiter View
   ------------------ */
function RecruiterView(){
  const { state, dispatch } = useDB();
  const user = state.currentUser;
  const myReferrals = state.candidates.filter(c=>c.referredBy===user.id);
  const [selectedJob, setSelectedJob] = useState(state.jobs[0]?.id || "");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [form, setForm] = useState({ name:'', email:'', phone:'', resume:'', notes:'', appliedForJob: selectedJob });

  useEffect(()=>{ setForm(f=>({...f, appliedForJob: selectedJob})); },[selectedJob]);

  const refer = (e)=>{ e.preventDefault(); if(!form.name || !form.email || !form.appliedForJob) return; dispatch({type:'ADD_CANDIDATE', payload:{ ...form, referredBy: user.id, status: 'referred' }}); setForm({ name:'', email:'', phone:'', resume:'', notes:'', appliedForJob: selectedJob }); }

  const openCandidate = (c)=>{ setSelectedCandidate(c); }
  const updateStatus = (id, status, note='')=>{ const candidate = state.candidates.find(x=>x.id===id); const ch = (candidate.contactHistory||[]).concat([{date:new Date().toISOString(), note}]); dispatch({type:'UPDATE_CANDIDATE', payload:{ id, updates:{ status, contactHistory: ch }}}); if(selectedCandidate?.id===id) setSelectedCandidate({...selectedCandidate, status, contactHistory: ch}); }

  return (
    <AppShell>
      <Sidebar items={[
        { label:'Refer Candidate', icon:'➕', active:true, onClick:()=>{} },
      ]} />

      <main className="flex-1 min-w-0">
        <div className="space-y-6">
          <Card title="Refer Candidate" subtitle="Select job and provide candidate details">
            <form onSubmit={refer} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block text-sm"><div className="font-medium">Select Job</div><select className="mt-1 w-full rounded-lg border px-3 py-2" value={selectedJob} onChange={(e)=>setSelectedJob(Number(e.target.value))}>{state.jobs.map(j=> <option key={j.id} value={j.id}>#{j.id} — {j.title}</option>)}</select></label>
              <label className="block text-sm"><div className="font-medium">Full name</div><input className="mt-1 w-full rounded-lg border px-3 py-2" value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} /></label>
              <label className="block text-sm"><div className="font-medium">Email</div><input className="mt-1 w-full rounded-lg border px-3 py-2" value={form.email} onChange={(e)=>setForm({...form, email:e.target.value})} /></label>
              <label className="block text-sm"><div className="font-medium">Phone</div><input className="mt-1 w-full rounded-lg border px-3 py-2" value={form.phone} onChange={(e)=>setForm({...form, phone:e.target.value})} /></label>
              <label className="block text-sm"><div className="font-medium">Resume URL</div><input className="mt-1 w-full rounded-lg border px-3 py-2" value={form.resume} onChange={(e)=>setForm({...form, resume:e.target.value})} /></label>
              <label className="block text-sm sm:col-span-2"><div className="font-medium">Notes</div><textarea className="mt-1 w-full rounded-lg border px-3 py-2" value={form.notes} onChange={(e)=>setForm({...form, notes:e.target.value})} /></label>
              <div className="sm:col-span-2 flex gap-3"><Button type="submit" className="bg-blue-600 text-white">Refer</Button><Button type="button" className="border" onClick={()=>setForm({ name:'', email:'', phone:'', resume:'', notes:'', appliedForJob: selectedJob })}>Clear</Button></div>
            </form>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card title="My Referrals" subtitle="Click a candidate to view details">
              <div className="space-y-2">
                {myReferrals.length===0 && <p className="text-sm text-blue-500">No referrals yet.</p>}
                {myReferrals.map(c=> (
                  <button key={c.id} onClick={()=>openCandidate(c)} className="w-full text-left rounded-lg p-3 border hover:bg-yellow-50 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{c.name}</p>
                      <p className="text-xs text-blue-500">{state.jobs.find(j=>j.id===c.appliedForJob)?.title}</p>
                    </div>
                    <div className="text-xs text-blue-700">{c.status}</div>
                  </button>
                ))}
              </div>
            </Card>

            <Card title="Candidate Details" subtitle="Update status & add contact notes">
              {selectedCandidate ? (
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold">{selectedCandidate.name}</p>
                    <p className="text-xs text-blue-500">{selectedCandidate.email} • {selectedCandidate.phone}</p>
                    <p className="text-xs text-blue-500">Applied for: {state.jobs.find(j=>j.id===selectedCandidate.appliedForJob)?.title}</p>
                  </div>

                  <div>
                    <p className="text-xs font-medium">Status</p>
                    <div className="mt-2 flex gap-2 flex-wrap">
                      {['referred','contacted','shortlisted','rejected','hired'].map(s=> (
                        <button key={s} onClick={()=>updateStatus(selectedCandidate.id, s, `Marked ${s}`)} className={`rounded-md px-3 py-1 text-sm ${selectedCandidate.status===s ? 'bg-blue-600 text-white' : 'border'}`}>{s}</button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium">Notes</p>
                    <p className="text-sm text-blue-700 mt-1">{selectedCandidate.notes || '—'}</p>
                  </div>

                  <div>
                    <p className="text-xs font-medium">Contact History</p>
                    <ul className="mt-2 space-y-1 text-xs text-blue-700">
                      {(selectedCandidate.contactHistory||[]).map((h,i)=> (
                        <li key={i}>• {new Date(h.date).toLocaleString()}: {h.note}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-blue-500">Select a candidate from the list to view details.</p>
              )}
            </Card>
          </div>
        </div>
      </main>
    </AppShell>
  );
}

/* --------
   Router
   -------- */
function Router(){
  const { state } = useDB();
  if(!state.currentUser) return <Login />;
  if(state.currentUser.role==='admin') return <AdminView />;
  if(state.currentUser.role==='manager') return <ManagerView />;
  if(state.currentUser.role==='recruiter') return <RecruiterView />;
  return <div className="p-10">Unknown role</div>;
}

/* -----
   App
   ----- */
export default function App(){
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(()=>{
    if(!state.currentUser) return;
    const existing = state.users.find(u=>u.email===state.currentUser.email);
    if(existing) dispatch({type:'LOGIN', payload:existing});
  }, [state.currentUser?.email]);

  const value = useMemo(()=>({ state, dispatch }), [state, dispatch]);

  return (
    <AppDB.Provider value={value}>
      <Router />
    </AppDB.Provider>
  );
}
