import { createSlice, nanoid } from "@reduxjs/toolkit";

const COMPANY_DOMAIN = "company.com";
const PREDEFINED = {
  admin: ["admin@company.com"],
  managers: ["manager@company.com", "manager2@company.com"],
  recruiters: ["recruiter@company.com", "recruiter2@company.com"],
};

export const detectRole = (email) => {
  if (!email) return null;
  const e = email.toLowerCase().trim();
  if (PREDEFINED.admin.includes(e)) return "admin";
  if (PREDEFINED.managers.includes(e)) return "manager";
  if (PREDEFINED.recruiters.includes(e)) return "recruiter";
  if (e.endsWith(`@${COMPANY_DOMAIN}`)) return "manager";
  return null;
};

const nowISO = () => new Date().toISOString();

const initialUsers = [
  { id: 1, name: "Admin User", email: "admin@company.com", role: "admin" },
  { id: 2, name: "Maya Kapoor", email: "manager@company.com", role: "manager" },
  { id: 3, name: "Raj singh", email: "manage2@company.com", role: "manager" },
  { id: 4, name: "Sahil Rao", email: "recruiter@company.com", role: "recruiter" },
  { id: 5, name: "karan", email: "recruiter2@company.com", role: "recruiter" },
];

const initialJobs = [
  { id: 1, title: "Frontend Engineer", description: "React + Tailwind", skills: ["React", "Tailwind"], salary: "₹10-15 LPA", location: "Bengaluru", createdBy: 2, createdAt: nowISO(), isActive: true },
  { id: 2, title: "Backend Engineer", description: "Node.js APIs", skills: ["Node", "SQL"], salary: "₹12-18 LPA", location: "Remote", createdBy: 2, createdAt: nowISO(), isActive: true },
  { id: 3, title: "React Developer", description: "Node.js APIs", skills: ["Node", "SQL"], salary: "₹12-18 LPA", location: "Remote", createdBy: 3, createdAt: nowISO(), isActive: true },
  { id: 4, title: "Next js Engineer", description: "Node.js APIs", skills: ["Node", "SQL"], salary: "₹12-18 LPA", location: "Remote", createdBy: 2, createdAt: nowISO(), isActive: true },
  { id: 5, title: "Node Engineer", description: "Node.js APIs", skills: ["Node", "SQL"], salary: "₹12-18 LPA", location: "Remote", createdBy: 2, createdAt: nowISO(), isActive: true },
];

const initialCandidates = [
  { id: 1, name: "Riya Sen", email: "riya@example.com", phone: "+91 90000 11111", resume: "https://example.com/riya.pdf", notes: "Strong API skills", appliedForJob: 2, referredBy: 3, status: "contacted", contactHistory: [{ date: nowISO(), note: "WhatsApp message" }] },
  { id: 2, name: "Neha", email: "neha@example.com", phone: "+91 90000 11111", resume: "https://example.com/riya.pdf", notes: "Strong API skills", appliedForJob: 3, referredBy: 2, status: "contacted", contactHistory: [{ date: nowISO(), note: "WhatsApp message" }] },
  { id: 3, name: "Sayan", email: "sayan@example.com", phone: "+91 11111 11111", resume: "https://example.com/sayan.pdf", notes: "problem solver", appliedForJob: 1, referredBy: 2, status: "contacted", contactHistory: [{ date: nowISO(), note: "WhatsApp message" }] },
  { id: 4, name: "Radha", email: "radha@example.com", phone: "+91 22222 22222", resume: "https://example.com/radha.pdf", notes: "react skills", appliedForJob: 2, referredBy: 3, status: "contacted", contactHistory: [{ date: nowISO(), note: "WhatsApp message" }] },
  { id: 5, name: "Shivam", email: "sayan@example.com", phone: "+91 11111 11111", resume: "https://example.com/sayan.pdf", notes: "problem solver", appliedForJob: 3, referredBy: 2, status: "contacted", contactHistory: [{ date: nowISO(), note: "WhatsApp message" }] },
  { id: 6, name: "Radhika", email: "radhika@example.com", phone: "+91 22222 22222", resume: "https://example.com/radha.pdf", notes: "react skills", appliedForJob: 4, referredBy: 2, status: "contacted", contactHistory: [{ date: nowISO(), note: "WhatsApp message" }] },
  { id: 7, name: "Vinod", email: "vinod@example.com", phone: "+91 33333 33333", resume: "https://example.com/vinod.pdf", notes: " API skills", appliedForJob: 1, referredBy: 2, status: "contacted", contactHistory: [{ date: nowISO(), note: "WhatsApp message" }] },
];

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
        selectedUserId: null
      },
    },
    mi: {
      managerSidebar: {
        jobsOpen: false,
        selectedJobId: null
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
        return { payload: { id: Number(user.id) || Number(nanoid(6).replace(/\D/g, "").slice(0, 4)) || Math.floor(Math.random() * 10000), ...user } };
      },
    },
    addJob: {
      reducer(state, action) {
        state.jobs.unshift(action.payload);
      },
      prepare(job) {
        return { payload: { id: Number(job.id) || Number(nanoid(5).replace(/\D/g, "").slice(0, 3)) || Math.floor(Math.random() * 1000), createdAt: nowISO(), ...job, isActive: job.isActive !== undefined ? job.isActive : true, } };
      },
    },
    addCandidate: {
      reducer(state, action) {
        state.candidates.unshift(action.payload);
      },
      prepare(c) {
        return { payload: { id: Number(c.id) || Number(nanoid(7).replace(/\D/g, "").slice(0, 5)) || Math.floor(Math.random() * 100000), contactHistory: [], ...c } };
      },
    },
    updateCandidate(state, action) {
      const { id, updates } = action.payload;
      const idx = state.candidates.findIndex((c) => c.id === id);
      if (idx > -1) state.candidates[idx] = { ...state.candidates[idx], ...updates };
    },
    updateJob(state, action) {
      const { id, updates } = action.payload;
      const idx = state.jobs.findIndex((j) => j.id === id);
      if (idx > -1) {
        state.jobs[idx] = { ...state.jobs[idx], ...updates };
      }
    },
    deleteJob(state, action) {
      const id = action.payload;
      state.jobs = state.jobs.filter(j => j.id !== id);
    },
    // UI (Admin sidebar behavior)
    toggleManagers(state) {
      state.ui.adminSidebar.managersOpen = !state.ui.adminSidebar.managersOpen;
    },
    toggleRecruiters(state) {
      state.ui.adminSidebar.recruitersOpen = !state.ui.adminSidebar.recruitersOpen;
    },
    selectAdminUser(state, action) {
      state.ui.adminSidebar.selectedUserId = action.payload;
    },
    // UI (Manager sidebar behavior)
    toggleManagerJobs(state) {
      state.mi.managerSidebar.jobsOpen = !state.mi.managerSidebar.jobsOpen;
    },
    selectManagerJob(state, action) {
      state.mi.managerSidebar.selectedJobId = action.payload;
    },
    toggleJobActive(state, action) {
      const id= action.payload;
      const idx=state.jobs.findIndex(j => j.id===id);
      if(idx > -1){ state.jobs[idx].isActive = !state.jobs[idx].isActive; }
    },
  },
});

export const { actions, reducer } = appSlice;
