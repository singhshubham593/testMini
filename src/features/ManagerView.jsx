import React, { useState, useEffect } from "react";
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

/* ------------------
   Manager View
   ------------------ */
function ManagerView() {
  const dispatch = useDispatch();
  const { users, jobs, candidates, mi } = useApp();
  const user = useCurrentUser();
  const myJobs = jobs.filter((j) => j.createdBy === user.id);

  const [tab, setTab] = useState("jobs");

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
    setTab("jobDetail");
  };
  const selectedJob =
    jobs.find((j) => j.id === mi.managerSidebar.selectedJobId) || null;

  const jobApplicants = selectedJob
    ? candidates.filter((c) => c.appliedForJob === selectedJob.id)
    : [];

  const handleReferredByChange = (candidateId, newReferredBy) => {
    dispatch(
      actions.updateCandidate({
        id: candidateId,
        updates: { referredBy: newReferredBy },
      })
    );
  };

  return (
    <AppShell>
      <Sidebar>
        <SidebarButton
          active={tab === "profile"}
          onClick={() => setTab("profile")}
          left={<span>👤</span>}
        >
          Profile
        </SidebarButton>
        <SidebarButton
          active={tab === "create"}
          onClick={() => setTab("create")}
          left={<span>➕</span>}
        >
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
            right={
              mi.managerSidebar.jobsOpen ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )
            }
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
                    mi.managerSidebar.selectedJobId === j.id
                      ? "bg-blue-100"
                      : ""
                  }`}
                >
                  {j.title}
                </button>
              ))}
            </div>
          )}
        </div>
        <SidebarButton
          active={tab === "apps"}
          onClick={() => setTab("apps")}
          left={<span>🧾</span>}
        >
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
            </form>
          </Card>
        )}

        {tab === "jobDetail" && selectedJob && (
          <div className=" gap-6 p-4">
            <Card title={`Job Detail: ${selectedJob.title}`}>
              <div className="mb-4">
                <strong>Location:</strong> {selectedJob.location} <br />
                <strong>Salary:</strong> {selectedJob.salary} <br />
                <strong>Description:</strong> {selectedJob.description}
              </div>
              <strong>Candidates:</strong>
              <div className="mt-2 space-y-3">
                {jobApplicants.length === 0 && (
                  <div className="text-blue-500">
                    No candidates applied yet.
                  </div>
                )}
                <div className="grid grid-cols-3 space-x-3">
                  {jobApplicants.map((c) => (
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
                        <div className="text-xs text-blue-500">
                          Notes: {c.notes}
                        </div>
                        <div className="text-xs text-blue-500">
                          Status:{" "}
                          <span className="text-blue-700">{c.status}</span>
                        </div>
                        <div className="text-xs text-blue-600">
                          Referred by:{" "}
                          <select
                            className="text-xs text-blue-600 border rounded px-1"
                            value={c.referredBy || ""}
                            onChange={(e) =>
                              handleReferredByChange(
                                c.id,
                                Number(e.target.value)
                              )
                            }
                          >
                            <option value="">—</option>
                            {users.map((u) => (
                              <option key={u.id} value={u.id}>
                                {u.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        )}

        {tab === "apps" && (
          <Card title="Applications" subtitle="Applications for your jobs">
            <div className="space-y-3">
              {candidates
                .filter((c) => myJobs.some((j) => j.id === c.appliedForJob))
                .map((c) => (
                  <div
                    key={c.id}
                    className="rounded-lg border p-3 bg-yellow-50 flex items-start justify-between"
                  >
                    <div>
                      <p className="font-semibold">{c.name}</p>
                      <p className="text-xs text-blue-500">
                        Applied for:{" "}
                        {jobs.find((j) => j.id === c.appliedForJob)?.title}
                      </p>
                      <p className="text-xs text-blue-700">
                        Referred by:{" "}
                        {users.find((u) => u.id === c.referredBy)?.name}
                      </p>
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
export default ManagerView;
