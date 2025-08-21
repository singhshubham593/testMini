import React, { useState } from "react";
import { useApp } from "../context/AppContext";

export default function Login({ onLogin }) {
  const { users } = useApp();
  const [email, setEmail] = useState("");

  const handleLogin = () => {
    const foundUser = users.find(u => u.email === email);
    if (foundUser) {
      onLogin(foundUser);
    } else {
      alert("Unauthorized: Use company email");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96 text-center">
        <h1 className="text-2xl font-bold mb-6">Job Portal Login</h1>
        <input
          type="email"
          placeholder="Enter company email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border rounded mb-4"
        />
        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          Login
        </button>
      </div>
    </div>
  );
}
