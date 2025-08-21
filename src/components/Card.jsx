const Card = ({ title, subtitle, right, children }) => (
  <div className="rounded-2xl border border-yellow-200 bg-white shadow-sm">
    <div className="flex items-start justify-between gap-4 border-b border-yellow-100 p-4">
      <div>
        <h3 className="text-base font-semibold text-blue-500">{title}</h3>
        {subtitle && <p className="text-xs text-blue-500 mt-0.5">{subtitle}</p>}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
    <div className="p-4">{children}</div>
  </div>
);
export default Card;
