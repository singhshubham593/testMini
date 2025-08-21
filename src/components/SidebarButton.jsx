const SidebarButton = ({ active, onClick, left, right, children }) => (
  <button
    onClick={onClick}
    className={`w-full text-left rounded-xl px-3 py-2 text-sm font-medium flex items-center justify-between ${
      active ? "bg-blue-400 text-yellow-100" : "hover:bg-yellow-50 text-blue-700"
    }`}
  >
    <span className="flex items-center gap-2">{left}{children}</span>
    {right}
  </button>
);
export default SidebarButton;
