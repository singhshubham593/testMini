const Button = ({ children, className = "", ...rest }) => (
  <button {...rest} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold shadow-sm ${className}`}>{children}</button>
);
export default Button;
