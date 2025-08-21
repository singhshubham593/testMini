import React, { useState } from 'react';
import { useDispatch } from "react-redux";
import { useApp } from "../redux/hooks";
import { actions, detectRole } from "../redux/appSlice";
import Card from '../components/Card';
import Button from '../components/Button';

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
            <Button onClick={() => setMethod('email')} className={method === "email" ? "bg-blue-600 text-white" : "border"}>Email</Button>
            <Button onClick={() => setMethod('whatsapp')} className={method === "whatsapp" ? "bg-green-500 text-white" : "border"}>WhatsApp</Button>
            <Button onClick={() => setMethod('google')} className={method === "google" ? "bg-red-500 text-white" : "border"}>Google</Button>
          </div>
          <form onSubmit={e => { e.preventDefault(); handleLogin(); }} className="space-y-3">
            <label className="block text-sm">
              <div className="flex items-center gap-1 font-medium text-blue-700">{method === "whatsapp" ? "WhatsApp-linked Email" : "Email"}</div>
              <input value={email} onChange={e => setEmail(e.target.value)} className="mt-1 w-full rounded-lg border border-yellow-200 px-3 py-2" placeholder="you@company.com" />
            </label>
            {error && <div className="text-xs text-rose-600">{error}</div>}
            <div className="flex gap-3 flex-wrap">
              <Button type="submit" className="bg-blue-600 text-white">Sign in</Button>
              <Button type="button" className="border" onClick={() => handleLogin("admin@company.com")}>Demo Admin</Button>
              <Button type="button" className="border" onClick={() => handleLogin("manager@company.com")}>Demo Manager</Button>
              <Button type="button" className="border" onClick={() => handleLogin("recruiter@company.com")}>Demo Recruiter</Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
export default Login;
