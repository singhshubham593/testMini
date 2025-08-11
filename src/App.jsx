 import React, { useState, useEffect, useRef } from "react";

export default function JobPortal() {
  const [page, setPage] = useState("poster");
  const [jobs, setJobs] = useState([]);
  const [formData, setFormData] = useState({
    role: "",
    package: "",
    experience: "",
    location: "",
    description: ""
  });
  const [errors, setErrors] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  const [expandedPoster, setExpandedPoster] = useState({});
  const [expandedSeeker, setExpandedSeeker] = useState({});

  // Ref for focusing on first input
  const roleInputRef = useRef(null);

  useEffect(() => {
    const storedJobs = localStorage.getItem("jobsData");
    if (storedJobs) {
      setJobs(JSON.parse(storedJobs));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("jobsData", JSON.stringify(jobs));
  }, [jobs]);

  // Focus when form is shown
  useEffect(() => {
    if (showForm && roleInputRef.current) {
      roleInputRef.current.focus();
    }
  }, [showForm]);

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
      setJobs([formData, ...jobs]);
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

  const handleEdit = (index) => {
    setFormData(jobs[index]);
    setEditIndex(index);
    setShowForm(true);
  };

  const toggleExpandPoster = (index) => {
    setExpandedPoster((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const toggleExpandSeeker = (index) => {
    setExpandedSeeker((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="bg-white min-h-screen p-6 max-w-5xl mx-auto">
      {/* Header */}
      <h1 className="text-center text-4xl font-bold bg-blue-400 bg-clip-text text-transparent mb-6">
        Job Portal
      </h1>

      {/* Navigation */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => setPage("poster")}
          className={`px-6 py-2 rounded-full font-semibold shadow-md ${
            page === "poster"
              ? "bg-gradient-to-r from-yellow-400 to-blue-400 text-white"
              : "bg-yellow-400 text-white"
          }`}
        >
          Job Poster
        </button>
        <button
          onClick={() => setPage("seeker")}
          className={`px-6 py-2 rounded-full font-semibold shadow-md ${
            page === "seeker"
              ? "bg-gradient-to-r from-yellow-400 to-blue-400 text-white"
              : "bg-blue-400 text-white"
          }`}
        >
          Job Seeker
        </button>
      </div>

      {/* Job Poster Page */}
      {page === "poster" && (
        <>
          <div className="flex justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">
              Total Jobs Posted: {jobs.length}
            </h2>
            {!showForm && (
              <button
                onClick={() => {
                  setFormData({
                    role: "",
                    package: "",
                    experience: "",
                    location: "",
                    description: ""
                  });
                  setEditIndex(null);
                  setShowForm(true);
                }}
                className="bg-gradient-to-r from-yellow-400 to-blue-400 text-white px-6 py-2 rounded-full shadow-md"
              >
                + Post a Job
              </button>
            )}
          </div>

          {/* Form */}
          {showForm && (
            <form
              onSubmit={handleSubmit}
              className="bg-gradient-to-r from-yellow-400 to-blue-400 p-6 rounded-xl shadow-lg text-gray-800 mb-6"
            >
              <h2 className="text-center text-2xl font-bold text-white mb-4">
                {editIndex !== null ? "Edit Job" : "Post a New Job"}
              </h2>

              <label className="font-medium">Job Role</label>
              <input
                type="text"
                name="role"
                value={formData.role}
                ref={roleInputRef}
                onChange={handleChange}
                className="w-full p-2 rounded-md bg-white shadow-sm focus:outline-none mb-1"
              />
              {errors.role && <p className="text-red-600 text-xs">{errors.role}</p>}

              <label className="font-medium mt-2">Package</label>
              <input
                type="text"
                name="package"
                value={formData.package}
                onChange={handleChange}
                className="w-full p-2 rounded-md bg-white shadow-sm focus:outline-none mb-1"
              />
              {errors.package && <p className="text-red-600 text-xs">{errors.package}</p>}

              <label className="font-medium mt-2">Experience</label>
              <input
                type="text"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                className="w-full p-2 rounded-md bg-white shadow-sm focus:outline-none mb-1"
              />
              {errors.experience && <p className="text-red-600 text-xs">{errors.experience}</p>}

              <label className="font-medium mt-2">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full p-2 rounded-md bg-white shadow-sm focus:outline-none mb-1"
              />
              {errors.location && <p className="text-red-600 text-xs">{errors.location}</p>}

              <label className="font-medium mt-2">Job Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-2 rounded-md bg-white shadow-sm focus:outline-none min-h-[80px]"
              ></textarea>
              {errors.description && <p className="text-red-600 text-xs">{errors.description}</p>}

              <div className="flex gap-3 mt-4">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-yellow-400 to-blue-400 text-white px-6 py-2 rounded-full font-semibold shadow-md"
                >
                  {editIndex !== null ? "Update" : "Submit"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditIndex(null);
                  }}
                  className="bg-gray-600 text-white px-6 py-2 rounded-full font-semibold shadow-md"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Posted Jobs */}
          {jobs.map((job, index) => {
            const isExpanded = expandedPoster[index] || false;
            const shortDesc =
              job.description.length > 100
                ? job.description.substring(0, 100) + "..."
                : job.description;

            return (
              <div
                key={index}
                className="bg-white border border-gray-200 shadow-md rounded-lg p-4 mb-4"
              >
                <div className="flex flex-wrap justify-between text-blue-900 font-medium mb-2">
                  <span>🏢 <strong>Role:</strong> {job.role}</span>
                  <span>💰 <strong>Package:</strong> {job.package}</span>
                  <span>📅 <strong>Exp:</strong> {job.experience}</span>
                  <span>📍 <strong>Location:</strong> {job.location}</span>
                  <button
                    onClick={() => handleEdit(index)}
                    className="bg-gradient-to-r from-yellow-400 to-blue-400 text-white px-3 py-1 rounded-full text-sm"
                  >
                    Edit
                  </button>
                </div>
                <p className="text-gray-700 text-sm whitespace-pre-line">
                  📝 <strong>Description:</strong>{" "}
                  {isExpanded ? job.description : shortDesc}
                </p>
                {job.description.length > 100 && (
                  <button
                    onClick={() => toggleExpandPoster(index)}
                    className="text-blue-500 text-sm mt-1 underline"
                  >
                    {isExpanded ? "View Less" : "View More"}
                  </button>
                )}
              </div>
            );
          })}
        </>
      )}

      {/* Job Seeker Page */}
      {page === "seeker" && (
        <>
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Total Jobs Available: {jobs.length}
          </h2>
          {jobs.map((job, index) => {
            const isExpanded = expandedSeeker[index] || false;
            const shortDesc =
              job.description.length > 100
                ? job.description.substring(0, 100) + "..."
                : job.description;

            return (
              <div
                key={index}
                className="bg-white border border-gray-200 shadow-md rounded-lg p-4 mb-4"
              >
                <div className="flex flex-wrap justify-between text-blue-900 font-medium mb-2">
                  <span>🏢 <strong>Role:</strong> {job.role}</span>
                  <span>💰 <strong>Package:</strong> {job.package}</span>
                  <span>📅 <strong>Exp:</strong> {job.experience}</span>
                  <span>📍 <strong>Location:</strong> {job.location}</span>
                  <button
                    className="bg-gradient-to-r from-yellow-400 to-blue-400 text-white px-3 py-1 rounded-full text-sm"
                  >
                    Apply
                  </button>
                </div>
                <p className="text-gray-700 text-sm whitespace-pre-line">
                  📝 <strong>Description:</strong>{" "}
                  {isExpanded ? job.description : shortDesc}
                </p>
                {job.description.length > 100 && (
                  <button
                    onClick={() => toggleExpandSeeker(index)}
                    className="text-blue-500 text-sm mt-1 underline"
                  >
                    {isExpanded ? "View Less" : "View More"}
                  </button>
                )}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
