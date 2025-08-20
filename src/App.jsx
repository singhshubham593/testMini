 import React, { useEffect, useMemo, useState } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import { configureStore, createSlice, nanoid } from "@reduxjs/toolkit";
import { ChevronDown, ChevronRight } from "lucide-react";

/**
 * Single-file React Job Portal (Admin • Manager • Recruiter)
 * - State management migrated to Redux Toolkit (@reduxjs/toolkit + react-redux)
 * - Tailwind CSS only (assumes Tailwind is set up in the host project)
 * - Login: Email / WhatsApp (mock) / Google (mock)
 * - Admin Sidebar: Totals + expandable Managers/Recruiters lists
 * - Click a manager/recruiter to view details on the right panel
 * - All dummy data lives in Redux store
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

/* -----------------
   Initial in-memory DB
   ----------------- */
const nowISO = () => new Date().toISOString();

const initialUsers = [
  { id: 1, name: "Admin User", email: "admin@company.com", role: "admin" },
  { id: 2, name: "Maya Kapoor", email: "manager@company.com", role: "manager" },
  { id: 3, name: "Shubham", email: "manage2@company.com", role: "manager" },
  { id: 4, name: "Sahil Rao", email: "recruiter@company.com", role: "recruiter" },
  { id: 5, name: "karan", email: "recruiter2@company.com", role: "recruiter" },
];

const initialJobs = [
  { id: 1, title: "Frontend Engineer", description: "React + Tailwind", skills: ["React","Tailwind"], salary: "₹10-15 LPA", location: "Bengaluru", createdBy: 2, createdAt: nowISO() },
  { id: 2, title: "Backend Engineer", description: "Node.js APIs", skills: ["Node","SQL"], salary: "₹12-18 LPA", location: "Remote", createdBy: 2, createdAt: nowISO() },
  { id: 3, title: "React Developer", description: "Node.js APIs", skills: ["Node","SQL"], salary: "₹12-18 LPA", location: "Remote", createdBy: 3, createdAt: nowISO() },
  { id: 4, title: "Next js Engineer", description: "Node.js APIs", skills: ["Node","SQL"], salary: "₹12-18 LPA", location: "Remote", createdBy: 2, createdAt: nowISO() },
  { id: 5, title: "Node Engineer", description: "Node.js APIs", skills: ["Node","SQL"], salary: "₹12-18 LPA", location: "Remote", createdBy: 2, createdAt: nowISO() },
];

const initialCandidates = [
  { id: 1, name: "Riya Sen", email: "riya@example.com", phone: "+91 90000 11111", resume: "https://example.com/riya.pdf", notes: "Strong API skills", appliedForJob: 2, referredBy: 3, status: "contacted", contactHistory: [{ date: nowISO(), note: "WhatsApp message" }] },
  { id: 1, name: "Riya Sen", email: "riya@example.com", phone: "+91 90000 11111", resume: "https://example.com/riya.pdf", notes: "Strong API skills", appliedForJob: 3, referredBy: 3, status: "contacted", contactHistory: [{ date: nowISO(), note: "WhatsApp message" }] },
  { id: 2, name: "Sayan", email: "sayan@example.com", phone: "+91 11111 11111", resume: "https://example.com/sayan.pdf", notes: "problem solver", appliedForJob: 1, referredBy: 2, status: "contacted", contactHistory: [{ date: nowISO(), note: "WhatsApp message" }] },
  { id: 3, name: "Radha", email: "radha@example.com", phone: "+91 22222 22222", resume: "https://example.com/radha.pdf", notes: "react skills", appliedForJob: 2, referredBy: 3, status: "contacted", contactHistory: [{ date: nowISO(), note: "WhatsApp message" }] },
  { id: 2, name: "Sayan", email: "sayan@example.com", phone: "+91 11111 11111", resume: "https://example.com/sayan.pdf", notes: "problem solver", appliedForJob: 3, referredBy: 2, status: "contacted", contactHistory: [{ date: nowISO(), note: "WhatsApp message" }] },
  { id: 3, name: "Radha", email: "radha@example.com", phone: "+91 22222 22222", resume: "https://example.com/radha.pdf", notes: "react skills", appliedForJob: 4, referredBy: 3, status: "contacted", contactHistory: [{ date: nowISO(), note: "WhatsApp message" }] },
  { id: 4, name: "Vinod", email: "vinod@example.com", phone: "+91 33333 33333", resume: "https://example.com/vinod.pdf", notes: " API skills", appliedForJob: 1, referredBy: 2, status: "contacted", contactHistory: [{ date: nowISO(), note: "WhatsApp message" }] },
];

/* ---------
   Redux Slice
   --------- */
const appSlice = createSlice({
  name: "app",
  initialState: {
    currentUser: null,
    users: initialUsers,
    jobs: initialJobs,
    candidates: initialCandidates,
    ui: {
      adminSidebar: {
        managersOpen: false,
        recruitersOpen: false,
        selectedUserId: null, // manager or recruiter selected in admin view
      },
    },
    mi: {
      managerSidebar:{
        jobsOpen: false, // for manager view
        selectedJobId: null, // job selected in manager view
      },
    },
  },
  reducers: {
    login(state, action) {
      state.currentUser = action.payload;
    },
    logout(state) {
      state.currentUser = null;
    },
    addUser: {
      reducer(state, action) {
        state.users.push(action.payload);
      },
      prepare(user) {
        return { payload: { id: Number(user.id) || Number(nanoid(6).replace(/\D/g, "").slice(0, 4)) || Math.floor(Math.random()*10000), ...user } };
      },
    },
    addJob: {
      reducer(state, action) {
        state.jobs.unshift(action.payload);
      },
      prepare(job) {
        return { payload: { id: Number(job.id) || Number(nanoid(5).replace(/\D/g, "").slice(0, 3)) || Math.floor(Math.random()*1000), createdAt: nowISO(), ...job } };
      },
    },
    addCandidate: {
      reducer(state, action) {
        state.candidates.unshift(action.payload);
      },
      prepare(c) {
        return { payload: { id: Number(c.id) || Number(nanoid(7).replace(/\D/g, "").slice(0, 5)) || Math.floor(Math.random()*100000), contactHistory: [], ...c } };
      },
    },
    updateCandidate(state, action) {
      const { id, updates } = action.payload;
      const idx = state.candidates.findIndex((c) => c.id === id);
      if (idx > -1) state.candidates[idx] = { ...state.candidates[idx], ...updates };
    },
    // UI (Admin sidebar behavior)
    toggleManagers(state) {
      state.ui.adminSidebar.managersOpen = !state.ui.adminSidebar.managersOpen;
    },
    toggleRecruiters(state) {
      state.ui.adminSidebar.recruitersOpen = !state.ui.adminSidebar.recruitersOpen;
    },
    selectAdminUser(state, action) {
      state.ui.adminSidebar.selectedUserId = action.payload; // null to clear
    },
    // UI (Manager sidebar behavior)
    toggleManagerJobs(state) {
      state.mi.managerSidebar.jobsOpen = !state.mi.managerSidebar.jobsOpen;
    },
    selectManagerJob(state, action) {
      state.mi.managerSidebar.selectedJobId = action.payload; // null to clear
    },
  },
});

const { actions, reducer } = appSlice;
const store = configureStore({ reducer: { app: reducer } });

// Selectors
const useApp = () => useSelector((s) => s.app);
const useCurrentUser = () => useSelector((s) => s.app.currentUser);

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
  const dispatch = useDispatch();
  const app = useApp();
  const [email, setEmail] = useState("");
  const [method, setMethod] = useState("email");
  const [error, setError] = useState("");

  const handleLogin = (simulateEmail) => {
    const e = (simulateEmail || email).trim().toLowerCase();
    if (!e) return setError("Please enter email");
    const role = detectRole(e);
    if (!role) return setError("Unauthorized email — use company email or demo buttons");

    const existing = app.users.find((u) => u.email === e);
    const user = existing || { id: Math.floor(Math.random()*10000), name: e.split('@')[0], email: e, role };
    dispatch(actions.login(user));
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
            <div className="flex gap-3 flex-wrap">
              <Button type="submit" className="bg-blue-600 text-white">Sign in</Button>
              <Button type="button" className="border" onClick={()=>handleLogin('admin@company.com')}>Demo Admin</Button>
              <Button type="button" className="border" onClick={()=>handleLogin('manager@company.com')}>Demo Manager</Button>
              <Button type="button" className="border" onClick={()=>handleLogin('recruiter@company.com')}>Demo Recruiter</Button>
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
  const user = useCurrentUser();
  const dispatch = useDispatch();
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
            {user && <button onClick={()=>dispatch(actions.logout())} className="rounded-lg border px-3 py-2 text-sm">Logout</button>}
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
   Sidebar Component (generic)
   ------------------ */
const SidebarButton = ({ active, onClick, left, right, children }) => (
  <button onClick={onClick} className={`w-full text-left rounded-xl px-3 py-2 text-sm font-medium flex items-center justify-between ${active ? 'bg-blue-400 text-yellow-100' : 'hover:bg-yellow-50 text-blue-700'}`}>
    <span className="flex items-center gap-2">{left}{children}</span>
    {right}
  </button>
);

const Sidebar = ({ children }) => (
  <aside className="rounded-2xl border border-yellow-200 bg-white p-3 shadow-sm h-fit w-64 shrink-0">
    <div className="px-2 pb-1">
      <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Dashboard</p>
    </div>
    <nav className="mt-1 space-y-1">{children}</nav>
  </aside>
);

/* ------------------
   Admin View (with expandable lists & right panel details)
   ------------------ */
function AdminView() {
  const dispatch = useDispatch();
  const { users, jobs, candidates, ui } = useApp();
  const [tab, setTab] = useState('overview');
  const [form, setForm] = useState({ name:'', email:'', role:'manager' });

  const managers = users.filter(u=>u.role==='manager');
  const recruiters = users.filter(u=>u.role==='recruiter');

  const addUser = (e)=>{
    e.preventDefault();
    if(!form.name||!form.email) return;
    dispatch(actions.addUser(form));
    setForm({name:'',email:'',role:'manager'});
  };

  const selectedUser = users.find(u => u.id === ui.adminSidebar.selectedUserId) || null;

  const ManagerDetail = ({manager})=>{
    const mJobs = jobs.filter(j=>j.createdBy===manager.id);
    return (
      <div>
        <h4 className="text-sm font-semibold">Jobs by {manager.name}</h4>
        <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 space-y-3">
          {mJobs.length===0 && <p className="text-sm text-blue-500">No jobs posted.</p>}
          {mJobs.map(j=>{
            const cands = candidates.filter(c=>c.appliedForJob===j.id);
            return (
              <div className=" ">
              <div key={j.id} className="  rounded-lg border p-3 bg-yellow-50">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-blue-700">{j.title}</p>
                    <p className="text-xs text-blue-500">{j.location} • {j.salary}</p>
                  </div>
                  <div className="text-xs text-blue-600">{cands.length} applicants</div>
                </div>
                <div className="mt-2">
                  {cands.map(c=> (
                    <div key={c.id} className="flex items-center justify-between mt-2">
                      <div>
                        <p className="text-sm font-medium">{c.name}</p>
                        <p className="text-xs text-blue-500">Referred by: {users.find(u=>u.id===c.referredBy)?.name || '—'}</p>
                      </div>
                      <Badge className="bg-slate-100 text-blue-700">{c.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const RecruiterDetail = ({recruiter})=>{
    const referred = candidates.filter(c=>c.referredBy===recruiter.id);
    return (
      <div>
        <h4 className="text-sm font-semibold text-blue-700">Referrals by {recruiter.name}</h4>
        <div className="mt-2 space-y-2 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {referred.length===0 && <p className="text-sm text-blue-500">No referrals yet.</p>}
          {referred.map(c=> (
            <div key={c.id} className="rounded-lg border p-3 bg-yellow-50 flex items-start justify-between">
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-blue-500">Applied: {jobs.find(j=>j.id===c.appliedForJob)?.title || '—'}</p>
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
      {/* Left Sidebar */}
      <Sidebar>
        <SidebarButton active={tab==='overview'} onClick={()=>setTab('overview')} left={<span>📊</span>}>Overview</SidebarButton>
        <SidebarButton active={tab==='add'} onClick={()=>setTab('add')} left={<span>➕</span>}>Add Manager / Recruiter</SidebarButton>

        {/* Totals */}
        <div className="rounded-xl border p-3 bg-yellow-50 mt-2">
          <p className="text-xs text-blue-500">Totals</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div className="rounded-lg border p-2 text-center">
              <p className="text-[11px] text-blue-500">Managers</p>
              <p className="text-sm font-semibold text-blue-600">{managers.length}</p>
            </div>
            <div className="rounded-lg border p-2 text-center">
              <p className="text-[11px] text-blue-500">Recruiters</p>
              <p className="text-sm font-semibold text-blue-600">{recruiters.length}</p>
            </div>
          </div>
        </div>

        {/* Expandable Managers */}
        <div className="mt-2">
          <SidebarButton
            active={tab==='managers'}
            onClick={()=>{ setTab('managers'); dispatch(actions.toggleManagers()); }}
            left={<span>👥</span>}
            right={ui.adminSidebar.managersOpen ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
          >
            Managers ({managers.length})
          </SidebarButton>
          {ui.adminSidebar.managersOpen && (
            <div className="mt-1 ml-2 space-y-1">
              {managers.map(m => (
                <button key={m.id} onClick={()=>dispatch(actions.selectAdminUser(m.id))} className={`w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-yellow-50 ${ui.adminSidebar.selectedUserId===m.id ? 'bg-blue-100' : ''}`}>
                  {m.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Expandable Recruiters */}
        <div className="mt-1">
          <SidebarButton
            active={tab==='recruiters'}
            onClick={()=>{ setTab('recruiters'); dispatch(actions.toggleRecruiters()); }}
            left={<span>🧑‍💼</span>}
            right={ui.adminSidebar.recruitersOpen ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
          >
            Recruiters ({recruiters.length})
          </SidebarButton>
          {ui.adminSidebar.recruitersOpen && (
            <div className="mt-1 ml-2 space-y-1">
              {recruiters.map(r => (
                <button key={r.id} onClick={()=>dispatch(actions.selectAdminUser(r.id))} className={`w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-yellow-50 ${ui.adminSidebar.selectedUserId===r.id ? 'bg-blue-100' : ''}`}>
                  {r.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </Sidebar>

      {/* Right content */}
      <main className="flex-1 min-w-0 space-y-6">
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
                  <p className="text-xl font-semibold text-blue-500">{jobs.length}</p>
                </div>
              </div>
            </Card>

            <Card title="Recent Jobs" subtitle="Latest posts">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {jobs.map(j => (
                  <div key={j.id} className="rounded-lg border p-3">
                    <p className="font-semibold">{j.title}</p>
                    <p className="text-xs text-blue-500">{j.location} • {j.salary}</p>
                    <p className="text-xs mt-2 text-blue-600">Posted by: {users.find(u=>u.id===j.createdBy)?.name}</p>
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

        {/* Right-side detail when a user is selected from sidebar */}
        {selectedUser && (
          <Card
            title={`${selectedUser.role === 'manager' ? 'Manager' : 'Recruiter'} — ${selectedUser.name}`}
            subtitle={selectedUser.email}
            right={<Button className="border" onClick={()=>dispatch(actions.selectAdminUser(null))}>Clear</Button>}
          >
            {selectedUser.role === 'manager' ? (
              <ManagerDetail manager={selectedUser} />
            ) : (
              <RecruiterDetail recruiter={selectedUser} />
            )}
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
  const dispatch = useDispatch();
  const { users, jobs, candidates,mi } = useApp();
  const user = useCurrentUser();
  const myJobs = jobs.filter(j => j.createdBy === user.id);
  const [tab, setTab] = useState('jobs');
  const [form, setForm] = useState({ title:'', description:'', skills:'', salary:'', location:'' });

  const postJob = (e)=>{
    e.preventDefault();
    if(!form.title) return;
    const payload = { ...form, skills: form.skills.split(',').map(s=>s.trim()).filter(Boolean), createdBy: user.id };
    dispatch(actions.addJob(payload));
    setForm({ title:'', description:'', skills:'', salary:'', location:'' });
    setTab('jobs');
  };

  const selecteJob = jobs.find(j => j.id === mi.managerSidebar.selectedJobId) || null;

  return (
    <AppShell>
      <Sidebar>
        <SidebarButton active={tab==='profile'} onClick={()=>setTab('profile')} left={<span>👤</span>}>Profile</SidebarButton>
        <SidebarButton active={tab==='create'} onClick={()=>setTab('create')} left={<span>➕</span>}>Create New Job Post</SidebarButton>
        <div className="mt-2"> 
          <SidebarButton active={tab==='jobs'} onClick={()=>{setTab('jobs'); dispatch(actions.toggleManagerJobs()); }} left={<span>📋</span>} right={ mi.managerSidebar.jobsOpen ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}>Total Jobs Posted</SidebarButton>
          {mi.managerSidebar.jobsOpen && (
            <div className="mt-1 ml-2 space-y-1">
              {jobs.map(j => (
                <button key={j.id} onClick={()=>dispatch(actions.selectManagerJob(j.id))} className={`w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-yellow-50 ${mi.managerSidebar.selectedJobId===j.id ? 'bg-blue-100' : ''}`}>
                  {j.title}
                </button>
              ))}
            </div>
          )}
        </div>
        <SidebarButton active={tab==='apps'} onClick={()=>setTab('apps')} left={<span>🧾</span>}>Applications per Job</SidebarButton>
      </Sidebar>

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
                  <div className="text-xs text-blue-700 mt-2">Applicants: {candidates.filter(c=>c.appliedForJob===j.id).length}</div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {tab==='apps' && (
          <Card title="Applications" subtitle="Applications for your jobs">
            <div className="space-y-3">
              {candidates.filter(c=> myJobs.some(j=>j.id===c.appliedForJob)).map(c=> (
                <div key={c.id} className="rounded-lg border p-3 bg-yellow-50 flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{c.name}</p>
                    <p className="text-xs text-blue-500">Applied for: {jobs.find(j=>j.id===c.appliedForJob)?.title}</p>
                    <p className="text-xs text-blue-700">Referred by: {users.find(u=>u.id===c.referredBy)?.name}</p>
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
  const dispatch = useDispatch();
  const { jobs, candidates, users } = useApp();
  const user = useCurrentUser();
  const myReferrals = candidates.filter(c=>c.referredBy===user.id);
  const [selectedJob, setSelectedJob] = useState(jobs[0]?.id || "");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [form, setForm] = useState({ name:'', email:'', phone:'', resume:'', notes:'', appliedForJob: selectedJob });

  useEffect(()=>{ setForm(f=>({...f, appliedForJob: selectedJob})); },[selectedJob]);

  const refer = (e)=>{
    e.preventDefault();
    if(!form.name || !form.email || !form.appliedForJob) return;
    dispatch(actions.addCandidate({ ...form, referredBy: user.id, status: 'referred' }));
    setForm({ name:'', email:'', phone:'', resume:'', notes:'', appliedForJob: selectedJob });
  };

  const openCandidate = (c)=>{ setSelectedCandidate(c); };
  const updateStatus = (id, status, note='')=>{
    const candidate = candidates.find(x=>x.id===id);
    const ch = (candidate?.contactHistory||[]).concat([{date: nowISO(), note}]);
    dispatch(actions.updateCandidate({ id, updates:{ status, contactHistory: ch }}));
    if(selectedCandidate?.id===id) setSelectedCandidate({...selectedCandidate, status, contactHistory: ch});
  };

  return (
    <AppShell>
      <Sidebar>
        <SidebarButton active left={<span>➕</span>}>Refer Candidate</SidebarButton>
      </Sidebar>

      <main className="flex-1 min-w-0">
        <div className="space-y-6">
          <Card title="Refer Candidate" subtitle="Select job and provide candidate details">
            <form onSubmit={refer} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block text-sm"><div className="font-medium">Select Job</div><select className="mt-1 w-full rounded-lg border px-3 py-2" value={selectedJob} onChange={(e)=>setSelectedJob(Number(e.target.value))}>{jobs.map(j=> <option key={j.id} value={j.id}>#{j.id} — {j.title}</option>)}</select></label>
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
                      <p className="text-xs text-blue-500">{jobs.find(j=>j.id===c.appliedForJob)?.title}</p>
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
                    <p className="text-xs text-blue-500">Applied for: {jobs.find(j=>j.id===selectedCandidate.appliedForJob)?.title}</p>
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
  const app = useApp();
  if(!app.currentUser) return <Login />;
  if(app.currentUser.role==='admin') return <AdminView />;
  if(app.currentUser.role==='manager') return <ManagerView />;
  if(app.currentUser.role==='recruiter') return <RecruiterView />;
  return <div className="p-10">Unknown role</div>;
}

/* -----
   App (Provider wired to Redux store)
   ----- */
export default function App(){
  const value = useMemo(()=>({}), []); // dummy to keep similar structure; not used now
  return (
    <Provider store={store} value={value}>
      <Router />
    </Provider>
  );
}
