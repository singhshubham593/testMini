import React from 'react';
import { useCurrentUser } from "../redux/hooks";
import { useDispatch } from "react-redux";
import { actions } from "../redux/appSlice";

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
              <p className="text-xs text-blue-500">{user?.name || "Guest"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-blue-600">Role: <span className="font-semibold">{user?.role}</span></span>
            {user && <button onClick={() => dispatch(actions.logout())} className="rounded-lg border px-3 py-2 text-sm">Logout</button>}
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-6 flex gap-6 items-start">{children}</div>
    </div>
  );
}
export default AppShell;
