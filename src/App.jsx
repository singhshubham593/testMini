 import React, { useState } from "react";

export default function JobPortal() {
  const [showForm, setShowForm] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [formData, setFormData] = useState({
    role: "",
    package: "",
    experience: "",
    location: "",
    description: ""
  });
  const [errors, setErrors] = useState({});

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
    setJobs([...jobs, formData]);
    setFormData({ role: "", package: "", experience: "", location: "", description: "" });
    setShowForm(false);
  };

  return (
    <div className="bg-white min-h-screen p-6 max-w-4xl mx-auto">
      <h1 className="text-center text-4xl font-bold bg-blue-400 bg-clip-text text-transparent mb-6">
        🚀 Job Portal
      </h1>

      {!showForm && (
        <>
          <button
            className="bg-gradient-to-r from-yellow-400 to-blue-400 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:scale-105 transition"
            onClick={() => setShowForm(true)}
          >
            + Post a Job
          </button>

          <div className="mt-6">
            {jobs.length === 0 ? (
              <p className="text-gray-500 text-center">No jobs posted yet.</p>
            ) : (
              jobs.map((job, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 shadow-md rounded-lg p-4 mb-4"
                >
                  {/* Horizontal Info */}
                  <div className="flex flex-wrap justify-between text-blue-900 font-medium mb-2">
                    <span>🏢 <strong>Role:</strong> {job.role}</span>
                    <span>💰 <strong>Package:</strong> {job.package}</span>
                    <span>📅 <strong>Exp:</strong> {job.experience}</span>
                    <span>📍 <strong>Location:</strong> {job.location}</span>
                  </div>
                  {/* Description */}
                  <p className="text-gray-700 text-sm">
                    📝 <strong>Description:</strong> {job.description}
                  </p>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {showForm && (
        <form
          className="bg-gradient-to-r from-yellow-400 to-blue-400 p-6 rounded-xl shadow-lg text-gray-800"
          onSubmit={handleSubmit}
        >
          <h2 className="text-center text-2xl font-bold text-white mb-4">Post a New Job</h2>

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
              className="bg-blue-400 text-white px-6 py-2 rounded-full font-semibold shadow-md hover:scale-105 transition"
            >
              Submit
            </button>
            <button
              type="button"
              className="bg-gray-600 text-white px-6 py-2 rounded-full font-semibold  hover:scale-105 transition shadow-md"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
