   import React, { useState } from "react";

export default function JobPortal() {
  const [view, setView] = useState("poster"); // "poster" or "seeker"
  const [jobs, setJobs] = useState([]);
  const [formData, setFormData] = useState({
    role: "",
    package: "",
    experience: "",
    location: "",
    description: ""
  });
  const [errors, setErrors] = useState({});
  const [expanded, setExpanded] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    let newErrors = {};
    if (!formData.role.trim()) newErrors.role = "Job role is required";
    if (!formData.package.trim()) newErrors.package = "Package is required";
    if (!formData.experience.trim()) newErrors.experience = "Experience is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.description.trim()) newErrors.description = "Job description is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (editIndex !== null) {
      const updatedJobs = [...jobs];
      updatedJobs[editIndex] = formData;
      setJobs(updatedJobs);
      setEditIndex(null);
    } else {
      setJobs([...jobs, formData]);
    }

    setFormData({
      role: "",
      package: "",
      experience: "",
      location: "",
      description: ""
    });
    setShowForm(false);
  };

  const toggleExpand = (index) => {
    setExpanded((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleEdit = (index) => {
    setFormData(jobs[index]);
    setEditIndex(index);
    setShowForm(true);
  };

  const handleApply = (job) => {
    alert(`You have applied for ${job.role} at ${job.location}`);
  };

  const JobCard = ({ job, index, isPoster }) => {
    const isExpanded = expanded[index] || false;
    const shortDesc =
      job.description.length > 100
        ? job.description.substring(0, 100) + "..."
        : job.description;

    return (
      <div className="bg-white border border-gray-200 shadow-md rounded-lg p-4 mb-4">
        <div className="flex justify-between items-start">
          {/* Left side - Job details */}
          <div>
            <div className="flex flex-wrap gap-4 text-blue-900 font-medium mb-2">
              <span>🏢 <strong>Role:</strong> {job.role}</span>
              <span>💰 <strong>Package:</strong> {job.package}</span>
              <span>📅 <strong>Exp:</strong> {job.experience}</span>
              <span>📍 <strong>Location:</strong> {job.location}</span>
            </div>
            <p className="text-gray-700 text-sm whitespace-pre-line">
              📝 <strong>Description:</strong>{" "}
              {isExpanded ? job.description : shortDesc}
            </p>
            {job.description.length > 100 && (
              <button
                onClick={() => toggleExpand(index)}
                className="text-blue-500 text-sm mt-1 underline"
              >
                {isExpanded ? "View Less" : "View More"}
              </button>
            )}
          </div>

          {/* Right side - Action button */}
          <div className="flex-shrink-0">
            {isPoster ? (
              <button
                onClick={() => handleEdit(index)}
                className=" bg-gradient-to-r from-yellow-400 to-blue-400   text-white px-4 py-2 rounded-full text-sm shadow-md hover:scale-105 transition"
              >
                ✏️ Edit
              </button>
            ) : (
              <button
                onClick={() => handleApply(job)}
                className="bg-gradient-to-r from-yellow-400 to-blue-400 text-white px-4 py-2 rounded-full text-sm shadow-md hover:scale-105 transition"
              >
                ✅ Apply
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white min-h-screen p-6 max-w-5xl mx-auto">
      {/* Header */}
      <h1 className="text-center text-4xl font-bold bg-blue-400 bg-clip-text text-transparent mb-6">
        <span>🚀</span> Job Portal
      </h1>

      {/* UI Switcher */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => setView("poster")}
          className={`px-6 py-2 rounded-full font-semibold shadow-md transition ${
            view === "poster"
              ? "bg-gradient-to-r from-yellow-400 to-blue-400 text-white"
              : "bg-yellow-400 text-white "
          }`}
        >
          Job Poster
        </button>
        <button
          onClick={() => setView("seeker")}
          className={`px-6 py-2 rounded-full font-semibold shadow-md transition ${
            view === "seeker"
              ? "bg-gradient-to-r from-yellow-400 to-blue-400 text-white"
              : "bg-blue-400 text-white "
          }`}
        >
          Job Seeker
        </button>
      </div>

      {/* Poster UI */}
      {view === "poster" && (
        <div>
          {!showForm && (
            <>
              <div className="flex items-center justify-between mb-4">
                <button
                  className="bg-gradient-to-r from-yellow-400 to-blue-400 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:scale-105 transition"
                  onClick={() => setShowForm(true)}
                >
                  + Post a Job
                </button>
                <p className="text-lg font-semibold text-gray-700">
                  Total Jobs Posted: {jobs.length}
                </p>
              </div>

              {jobs.length === 0 ? (
                <p className="text-gray-500">No jobs posted yet.</p>
              ) : (
                jobs.map((job, index) => (
                  <JobCard key={index} job={job} index={index} isPoster={true} />
                ))
              )}
            </>
          )}

          {showForm && (
            <form
              className="bg-gradient-to-r from-yellow-400 to-blue-400 p-6 rounded-xl shadow-lg text-gray-800"
              onSubmit={handleSubmit}
            >
              <h2 className="text-center text-2xl font-bold text-white mb-4">
                {editIndex !== null ? "Edit Job" : "Post a New Job"}
              </h2>

              <label className="font-medium">Job Role</label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full p-2 rounded-md bg-white shadow-sm focus:outline-none mb-1"
              />
              {errors.role && <span className="text-red-600 text-xs">{errors.role}</span>}

              <label className="font-medium mt-2">Package</label>
              <input
                type="text"
                name="package"
                value={formData.package}
                onChange={handleChange}
                className="w-full p-2 rounded-md bg-white shadow-sm focus:outline-none mb-1"
              />
              {errors.package && <span className="text-red-600 text-xs">{errors.package}</span>}

              <label className="font-medium mt-2">Experience</label>
              <input
                type="text"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                className="w-full p-2 rounded-md bg-white shadow-sm focus:outline-none mb-1"
              />
              {errors.experience && <span className="text-red-600 text-xs">{errors.experience}</span>}

              <label className="font-medium mt-2">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full p-2 rounded-md bg-white shadow-sm focus:outline-none mb-1"
              />
              {errors.location && <span className="text-red-600 text-xs">{errors.location}</span>}

              <label className="font-medium mt-2">Job Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-2 rounded-md bg-white shadow-sm focus:outline-none min-h-[80px]"
              ></textarea>
              {errors.description && (
                <span className="text-red-600 text-xs">{errors.description}</span>
              )}

              <div className="flex gap-3 mt-4">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-yellow-400 to-blue-400 text-white px-6 py-2 rounded-full font-semibold shadow-md hover:scale-105 transition"
                >
                  {editIndex !== null ? "Update" : "Submit"}
                </button>
                <button
                  type="button"
                  className="bg-gray-600 text-white px-6 py-2 rounded-full font-semibold shadow-md"
                  onClick={() => {
                    setShowForm(false);
                    setEditIndex(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Seeker UI */}
      {view === "seeker" && (
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Available Jobs ({jobs.length})
          </h2>
          {jobs.length === 0 ? (
            <p className="text-gray-500">No jobs available yet.</p>
          ) : (
            jobs.map((job, index) => (
              <JobCard key={index} job={job} index={index} isPoster={false} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
