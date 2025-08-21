import { useSelector } from "react-redux";

export const useApp = () => useSelector((s) => s.app);
export const useCurrentUser = () => useSelector((s) => s.app.currentUser);
