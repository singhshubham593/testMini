 import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useApp, useCurrentUser } from "../redux/hooks";
import Card from "../components/Card";
import Button from "../components/Button";
import Sidebar from "../components/Sidebar";
import SidebarButton from "../components/SidebarButton";
import Badge from "../components/Badge";
import { actions } from "../redux/appSlice";
import AppShell from "./appShell";
import { ChevronDown, ChevronRight } from "lucide-react";

function ManagerView() {
  const dispatch = useDispatch();
  const { users, jobs, candidates, mi } = useApp();
  const user = useCurrentUser();
  const myJobs = jobs.filter((j) => j.createdBy === user.id);
  const [tab, setTab] = useState("jobs");
  const [searchQuery, setSearchQuery] = useState(""); 
  const [editingJobId, setEditingJobId] = useState(null);
  const [isEditingJob, setIsEditingJob] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    location: "",
    salary: "",
    skills: "",
  });

  const [form, setForm] = useState({
    title: "",
    employmentType: "",
    industry: "",
    functionalArea: "",
    description: "",
    minExp: "",
    maxExp: "",
    salaryType: "yearly",
    minSalary: "",
    maxSalary: "",
    jobLocation: "",
    jobNature: "fulltime",
    shifts: [],
    questionnaire: [],
    companyName: "",
    companyDescription: "",
    skills: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setForm((prev) => ({
        ...prev,
        [name]: checked
          ? [...prev[name], value]
          : prev[name].filter((v) => v !== value),
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const postJob = (e) => {
    e.preventDefault();
    if (!form.title) return;

    const payload = {
      ...form,
      skills: form.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      createdBy: user.id,
    };

    dispatch(actions.addJob(payload));
    setForm({
      title: "",
      employmentType: "",
      industry: "",
      functionalArea: "",
      description: "",
      minExp: "",
      maxExp: "",
      salaryType: "yearly",
      minSalary: "",
      maxSalary: "",
      jobLocation: "",
      jobNature: "fulltime",
      shifts: [],
      questionnaire: [],
      companyName: "",
      companyDescription: "",
      skills: "",
    });
    setTab("jobs");
  };

  const selectJob = (jobId) => {
    dispatch(actions.selectManagerJob(jobId));
    setSearchQuery(""); // clear search when switching jobs
    setTab("jobDetail");
    setIsEditingJob(false);
  };
  const selectedJob = jobs.find((j) => j.id === mi.managerSidebar.selectedJobId) || null;

  // Candidates who applied for the selected job
  const jobApplicants = selectedJob ? candidates.filter((c) => c.appliedForJob === selectedJob.id) : [];

  // Filter candidates per job by name using searchQuery
  const filteredApplicants = jobApplicants.filter((c) => {
    const nameMatch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    const emailMatch = c.email.toLowerCase().includes(searchQuery.toLowerCase());
    const contactmatch = c.phone.toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatch || emailMatch || contactmatch;
  });

  // filter all candidates by name using searchQuery
  const filteredCandidates = candidates.filter((c) => { 
    const nameMatch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    const emailMatch = c.email.toLowerCase().includes(searchQuery.toLowerCase());   
    const contactmatch = c.phone.toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatch || emailMatch || contactmatch;

  });

  const handleReferredByChange = (candidateId, newReferredBy) => {
    dispatch(
      actions.updateCandidate({
        id: candidateId,
        updates: { referredBy: newReferredBy },
      })
    );
  };

   const startEditJob = () => {
    if (!selectedJob) return;
    setIsEditingJob(true);
    setEditForm({
      title: selectedJob.title || "",
      description: selectedJob.description || "",
      location: selectedJob.location || "",
      salary: selectedJob.salary || "",
      skills: selectedJob.skills ? selectedJob.skills.join(", ") : "",
    });
  };

  const cancelEditJob = () => {
    setIsEditingJob(false);
    setEditForm({
    title: "",
    employmentType: "",
    industry: "",
    functionalArea: "",
    description: "",
    minExp: "",
    maxExp: "",
    salaryType: "yearly",
    minSalary: "",
    maxSalary: "",
    jobLocation: "",
    jobNature: "fulltime",
    shifts: [],
    questionnaire: [],
    companyName: "",
    companyDescription: "",
    skills: "",
  });
};

   const saveJobEdits = (e) => {
    e.preventDefault();
    if (!selectedJob) return;

    dispatch(
      actions.updateJob({
        id: selectedJob.id,
        updates: {
          title: editForm.title,
          description: editForm.description,
          location: editForm.location,
          salary: editForm.salary,
          skills: editForm.skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        },
      })
    );
    setIsEditingJob(false);
  };
 
 const deleteCurrentJob = () => {
    if (!selectedJob) return;
    if (window.confirm("Are you sure you want to delete this job?")) {
      dispatch(actions.deleteJob(selectedJob.id));
      dispatch(actions.selectManagerJob(null));
      setTab("jobs"); // go back to jobs list
      setIsEditingJob(false);
    }
  };

  

  return (
    <AppShell>
      <Sidebar>
        <SidebarButton active={tab === "profile"} onClick={() => setTab("profile")} left={<span>👤</span>}>
          Profile
        </SidebarButton>
        <SidebarButton active={tab === "create"} onClick={() => setTab("create")} left={<span>➕</span>}>
          Create New Job Post
        </SidebarButton>
        <div className="mt-2">
          <SidebarButton
            active={tab === "jobs"}
            onClick={() => {
              setTab("jobs");
              dispatch(actions.toggleManagerJobs());
            }}
            left={<span>📋</span>}
            right={mi.managerSidebar.jobsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          >
            Total Jobs Posted
          </SidebarButton>
          {mi.managerSidebar.jobsOpen && (
            <div className="mt-1 ml-2 space-y-1">
              {myJobs.map((j) => (
                <button
                  key={j.id}
                  onClick={() => selectJob(j.id)}
                  className={`w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-yellow-50 ${
                    mi.managerSidebar.selectedJobId === j.id ? "bg-blue-100" : ""
                  }`}
                >
                  {j.title}
                </button>
              ))}
            </div>
          )}
        </div>
        <SidebarButton active={tab === "apps"} onClick={() => setTab("apps")} left={<span>🧾</span>}>
          Applications per Job
        </SidebarButton>
      </Sidebar>

      <main className="flex-1 min-w-0">
        {tab === "profile" && (
          <Card title="Profile" subtitle={user.name}>
            <p className="text-sm">Email: {user.email}</p>
          </Card>
        )}

         {tab === "create" && (
          <Card title="Create Job" subtitle="Fill basic details">
            <form onSubmit={postJob} className="space-y-6">
              {/* Job Title */}
              <div>
                <label className="font-semibold block">Job Title</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className="w-full border p-2 rounded-lg mt-2"
                />
              </div>

              {/* Employment Type */}
              <div>
                <label className="font-semibold block">Employment Type</label>
                <div className="flex flex-wrap gap-4 mt-2">
                  {[
                    "Work From Home",
                    "Permanent",
                    "Contractual",
                    "Internship",
                  ].map((type) => (
                    <label key={type} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="employmentType"
                        value={type}
                        checked={form.employmentType === type}
                        onChange={handleChange}
                      />
                      {type}
                    </label>
                  ))}
                </div>
              </div>

              {/* Industry & Functional Area */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold block">Select Industry</label>
                  <select
                    name="industry"
                    value={form.industry}
                    onChange={handleChange}
                    className="w-full border p-2 rounded-lg mt-2"
                  >
                    <option value="">Select Industry</option>
                    <option>IT</option>
                    <option>Healthcare</option>
                    <option>Finance</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block">
                    Select Functional Area
                  </label>
                  <select
                    name="functionalArea"
                    value={form.functionalArea}
                    onChange={handleChange}
                    className="w-full border p-2 rounded-lg mt-2"
                  >
                    <option value="">Select Functional Area</option>
                    <option>Developer</option>
                    <option>Designer</option>
                    <option>HR</option>
                  </select>
                </div>
              </div>

              {/* Job Description */}
              <div>
                <label className="font-semibold block">Job Description</label>
                <textarea
                  name="description"
                  rows="4"
                  value={form.description}
                  onChange={handleChange}
                  className="w-full border p-2 rounded-lg mt-2"
                ></textarea>
              </div>

              {/* Skills */}
              <div>
                <label className="font-semibold block">
                  Skills (comma separated)
                </label>
                <input
                  type="text"
                  name="skills"
                  value={form.skills}
                  onChange={handleChange}
                  placeholder="e.g. React, Node.js, SQL"
                  className="w-full border p-2 rounded-lg mt-2"
                />
              </div>

              {/* Experience */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold block">Min Exp</label>
                  <input
                    type="number"
                    name="minExp"
                    value={form.minExp}
                    onChange={handleChange}
                    className="w-full border p-2 rounded-lg mt-2"
                  />
                </div>
                <div>
                  <label className="font-semibold block">Max Exp</label>
                  <input
                    type="number"
                    name="maxExp"
                    value={form.maxExp}
                    onChange={handleChange}
                    className="w-full border p-2 rounded-lg mt-2"
                  />
                </div>
              </div>

              {/* Salary */}
              <div>
                <label className="font-semibold block">Salary</label>
                <div className="flex items-center gap-6 mt-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="salaryType"
                      value="yearly"
                      checked={form.salaryType === "yearly"}
                      onChange={handleChange}
                    />{" "}
                    Yearly
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="salaryType"
                      value="monthly"
                      checked={form.salaryType === "monthly"}
                      onChange={handleChange}
                    />{" "}
                    Monthly
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <input
                    type="number"
                    name="minSalary"
                    value={form.minSalary}
                    onChange={handleChange}
                    placeholder="Min Salary"
                    className="border p-2 rounded-lg"
                  />
                  <input
                    type="number"
                    name="maxSalary"
                    value={form.maxSalary}
                    onChange={handleChange}
                    placeholder="Max Salary"
                    className="border p-2 rounded-lg"
                  />
                </div>
              </div>

              {/* Job Location */}
              <div>
                <label className="font-semibold block">
                  Select Job Location
                </label>
                <input
                  type="text"
                  name="jobLocation"
                  value={form.jobLocation}
                  onChange={handleChange}
                  placeholder="Enter Job Location"
                  className="w-full border p-2 rounded-lg mt-2"
                />
              </div>

              {/* Job Nature */}
              <div>
                <label className="font-semibold block">Job Nature</label>
                <div className="flex gap-6 mt-2">
                  {["fulltime", "parttime"].map((nature) => (
                    <label key={nature} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="jobNature"
                        value={nature}
                        checked={form.jobNature === nature}
                        onChange={handleChange}
                      />
                      {nature === "fulltime" ? "Full Time" : "Part Time"}
                    </label>
                  ))}
                </div>
              </div>

              {/* Shifts */}
              <div>
                <label className="font-semibold block">Shifts</label>
                <div className="flex flex-wrap gap-4 mt-2">
                  {[
                    "Morning",
                    "Noon",
                    "Evening",
                    "Night",
                    "Split",
                    "Rotating",
                  ].map((shift) => (
                    <label key={shift} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="shifts"
                        value={shift}
                        checked={form.shifts.includes(shift)}
                        onChange={handleChange}
                      />
                      {shift}
                    </label>
                  ))}
                </div>
              </div>

              {/* Questionnaire */}
              <div>
                <label className="font-semibold block">Questionnaire</label>
                <div className="flex flex-col gap-3 mt-2">
                  {[
                    "Skills",
                    "Willing to relocate",
                    "Expected CTC",
                    "Notice Period",
                    "Date of Birth",
                  ].map((q) => (
                    <label key={q} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="questionnaire"
                        value={q}
                        checked={form.questionnaire.includes(q)}
                        onChange={handleChange}
                      />
                      {q}
                    </label>
                  ))}
                </div>
              </div>

              {/* Company Details */}
              <div>
                <label className="font-semibold block">Company Details</label>
                <input
                  type="text"
                  name="companyName"
                  value={form.companyName}
                  onChange={handleChange}
                  placeholder="Company Name"
                  className="w-full border p-2 rounded-lg mt-2"
                />
                <textarea
                  name="companyDescription"
                  rows="3"
                  value={form.companyDescription}
                  onChange={handleChange}
                  placeholder="Company Description"
                  className="w-full border p-2 rounded-lg mt-2"
                ></textarea>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Post Job
              </button>
              {/* Job creation form as before */}
              {/* ... */}
            </form>
          </Card>
        )}

        {tab === "jobDetail" && selectedJob && (
          <div className="p-4 space-y-4">
            <Card title={`Job Detail: ${selectedJob.title}`}>
              
              {isEditingJob ? (
                <form onSubmit={saveJobEdits} className="space-y-4">
                  <div>
                    <label className="font-semibold block">Job Title</label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="w-full border px-2 py-1 rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-semibold block">Location</label>
                    <input
                      type="text"
                      value={editForm.location}
                      onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                      className="w-full border px-2 py-1 rounded"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block">Salary</label>
                    <input
                      type="text"
                      value={editForm.salary}
                      onChange={(e) => setEditForm({ ...editForm, salary: e.target.value })}
                      className="w-full border px-2 py-1 rounded"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block">Description</label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="w-full border px-2 py-1 rounded"
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="font-semibold block">Skills (comma separated)</label>
                    <input
                      type="text"
                      value={editForm.skills}
                      onChange={(e) => setEditForm({ ...editForm, skills: e.target.value })}
                      className="w-full border px-2 py-1 rounded"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-2xl">
                      Save
                    </button>
                    <button type="button" onClick={cancelEditJob} className="bg-yellow-400  px-4 py-2 rounded-2xl">
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
                  <div className="mb-4">
                    <strong>Location:</strong> {selectedJob.location} <br />
                    <strong>Salary:</strong> {selectedJob.salary} <br />
                    <strong>Description:</strong> {selectedJob.description}
                  </div>
                  <div>
                    <label className="font-semibold block mb-2">Assign Recruiter</label>
                   <select
    value={selectedJob.recruiterId || ""}
    onChange={(e) =>
      dispatch(
        actions.updateJob({
          id: selectedJob.id,
          updates: { recruiterId: Number(e.target.value) },
        })
      )
    }
    className="border rounded p-2 w-full max-w-xs"
  >
    <option value="">Select recruiter</option>
    {users
      .filter((u) => u.role === "recruiter")
      .map((r) => (
        <option key={r.id} value={r.id}>
          {r.name}
        </option>
      ))}
                    </select>
                  </div>
                  </div>
                  <div className="mb-4">
                    <button onClick={startEditJob} className="mr-3 bg-blue-400 text-white px-4 py-2 rounded-2xl">
                      Edit
                    </button>
                    <button onClick={deleteCurrentJob} className="bg-yellow-500 px-4 py-2 rounded-2xl">
                      Delete
                    </button>
                  
                  <button
                    onClick={() => dispatch(actions.toggleJobActive(selectedJob.id))}
                    className={`px-2 py-2 mx-2 rounded-xl font-bold
                    ${selectedJob.isActive ? "bg-green-600 text-white" : "bg-gray-400 text-white"}`}
                  >
                    { selectedJob.isActive ? "Disable Post" : "Enable Post"}
                 </button>
                  {/* <div className="mb-4">
                    <span
                      className={`inline-block px-3 py-1 rounded text-xs font-bold
                      ${selectedJob.isActive ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-700"}`}
                    >
                      {selectedJob.isActive ? "Active" : "Inactive"}
                    </span>
                  </div> */}
                  </div>
                  
                </>
              )}
              
              
              <div className="flex items-center justify-between mb-3">
                <div>Candidates ({filteredApplicants.length})</div>
                <input
                  type="text"
                  placeholder="Search by name, email or contact"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded border px-2 py-1"
                />
              </div>

              <div className="space-y-3">
                {filteredApplicants.length === 0 && <div className="text-blue-500">No candidates match your search.</div>}
                <div className="grid grid-cols-3 space-x-3">
                  {filteredApplicants.map((c) => (
                    <div
                      key={c.id}
                      className="rounded-lg border p-3 bg-yellow-50 flex items-start justify-between"
                    >
                      <div>
                        <div className="font-semibold">{c.name}</div>
                        <div className="text-xs text-blue-500">
                          {c.email} • {c.phone}
                        </div>
                        <div className="text-xs text-blue-500">
                          Resume:{" "}
                          <a
                            className="text-blue-600 underline"
                            href={c.resume}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {c.resume}
                          </a>
                        </div>
                        <div className="text-xs text-blue-500">Notes: {c.notes}</div>
                        <div className="text-xs text-blue-500">
                          Status: <span className="text-blue-700">{c.status}</span>
                        </div>
                        {/* <div className="text-xs text-blue-600">
                          Referred by:{" "}
                          <select
                            className="text-xs text-blue-600 border rounded px-1"
                            value={c.referredBy || ""}
                            onChange={(e) =>
                              handleReferredByChange(c.id, Number(e.target.value))
                            }
                          >
                            <option value="">—</option>
                            {users
                              .filter((u) => u.role === "recruiter")
                              .map((u) => (
                                <option key={u.id} value={u.id}>
                                  {u.name}
                                </option>
                              ))}
                          </select>
                        </div> */}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        )}
        {tab === "apps" && (
          <div>
            
          <Card title="Candidates ">
            <input
              type="text"
              placeholder="Search by name, email or contact"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded border px-2 py-1 mb-4"
              />
            <div className="grid lg:grid-col-4 md:grid-cols-3  gap-3">
              {filteredCandidates
                 
                .map((c) => (
                  <div
                    key={c.id}
                    className="rounded-lg border p-3 bg-yellow-50 flex g items-start justify-between  "
                  >
                    <div className="space-y-1">
                      <p className="font-semibold">{c.name}</p>
                      <p className="text-xs text-blue-500">
                        • {c.email} 
                        <br />
                        • {c.phone}
                      </p>
                      <p className="text-xs text-blue-500">
                        Applied for: {jobs.find((j) => j.id === c.appliedForJob)?.title}
                      </p>
                      {/* <p className="text-xs text-blue-700">
                        Referred by: {users.find((u) => u.id === c.referredBy)?.name}
                      </p> */}
                    </div>
                    {/* <div className="text-xs text-blue-700">{c.status}</div> */}
                  </div>
                ))}
            </div>
          </Card>
          </div>
        )}
      </main>
    </AppShell>
  );
}

export default ManagerView;
