// AppProvider.js
// This file handles the global state management for the application.
// It uses React's Context API to make data available to any component
// without prop drilling.
import React, { useState, createContext } from 'react';

// Create a new context object to hold the application state.
export const AppContext = createContext();

// The AppProvider component will hold all the state variables
// and the functions to update them.
const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('login');
  const [jobs, setJobs] = useState([]);
  const [users, setUsers] = useState([
    { email: 'admin@company.com', role: 'admin' },
    { email: 'manager@company.com', role: 'manager' },
    { email: 'recruiter@company.com', role: 'recruiter' },
  ]);
  const [applications, setApplications] = useState([]);

  // Login function to simulate authentication.
  const login = (email) => {
    const authenticatedUser = users.find(u => u.email === email);
    if (authenticatedUser) {
      setUser(authenticatedUser);
      setPage('dashboard');
    } else {
      // Log an error instead of using alert() for a better user experience
      console.error('Invalid company email. Please try again.');
    }
  };

  // Logout function to reset the user state.
  const logout = () => {
    setUser(null);
    setPage('login');
  };

  // The state object to be shared with all consuming components.
  const state = {
    user,
    page,
    jobs,
    users,
    applications,
    setPage,
    setJobs,
    setUsers,
    setApplications,
    login,
    logout,
  };

  // We wrap the `children` in the Context Provider to make the `state` available
  // to all components nested inside it.
  return <AppContext.Provider value={state}>{children}</AppContext.Provider>;
};

export default AppProvider;
