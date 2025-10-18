/**
 * App.jsx - Main SlideRx Application Component
 *
 * This is the root component that sets up React Router for the application.
 * Currently includes:
 * - Upload page route
 * - Home/landing page (placeholder)
 *
 * All data is mock/client-side only - no backend integration yet.
 */

import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Upload from "./components/Upload";
import Logout from "./components/Logout";
import Processing from "./components/Processing";
import FollowUp from "./components/FollowUp";
import Results from "./components/Results";
import Dashboard from "./components/Dashboard";

// Main App component with routing
const App = () => {
  return (
    <Router>
      <Routes>
        {/* Redirect root to dashboard - users must be authenticated to see this */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/processing/:projectId" element={<Processing />} />
        <Route path="/followup/:projectId" element={<FollowUp />} />
        <Route path="/results/:projectId" element={<Results />} />
        <Route path="/logout" element={<Logout />} />
      </Routes>
    </Router>
  );
};

export default App;
