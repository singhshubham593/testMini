import React from 'react';
import { useApp } from "../redux/hooks";
import Login from "./Login";
import AdminView from "./AdminView";
import ManagerView from "./ManagerView";
import RecruiterView from "./RecruiterView";

function Router() {
  const app = useApp();
  if (!app.currentUser) return <Login />;
  if (app.currentUser.role === 'admin') return <AdminView />;
  if (app.currentUser.role === 'manager') return <ManagerView />;
  if (app.currentUser.role === 'recruiter') return <RecruiterView />;
  return <div className="p-10">Unknown role</div>;
}
export default Router;
