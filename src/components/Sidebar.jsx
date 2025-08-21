const Sidebar = ({ children }) => (
  <aside className="rounded-2xl border border-yellow-200 bg-white p-3 shadow-sm h-fit w-64 shrink-0">
    <div className="px-2 pb-1">
      <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Dashboard</p>
    </div>
    <nav className="mt-1 space-y-1">{children}</nav>
  </aside>
);
export default Sidebar;
