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
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Upload from "./components/Upload";
import Logout from "./components/Logout";
import Processing from "./components/Processing";
import FollowUp from "./components/FollowUp";
import Results from "./components/Results";
import Dashboard from "./components/Dashboard";

// Simple Home/Landing page component
const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2563EB] to-[#1e40af] flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-white mb-4">SlideRx</h1>
          <p className="text-2xl text-blue-100 mb-2">
            Transform bloated decks into executive-ready summaries
          </p>
          <p className="text-lg text-blue-200">
            AI-powered presentation analysis that teaches you best practices
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="p-6 bg-[#F8FAFC] rounded-lg">
              <div className="w-12 h-12 bg-[#2563EB] rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Upload
              </h3>
              <p className="text-[#64748B]">
                Upload your presentation (max 15 slides, PDF format)
              </p>
            </div>

            <div className="p-6 bg-[#F8FAFC] rounded-lg">
              <div className="w-12 h-12 bg-[#10B981] rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Analyze
              </h3>
              <p className="text-[#64748B]">
                AI analyzes your deck using time-tested presentation principles
              </p>
            </div>

            <div className="p-6 bg-[#F8FAFC] rounded-lg">
              <div className="w-12 h-12 bg-[#F59E0B] rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Learn
              </h3>
              <p className="text-[#64748B]">
                Get a 3-slide summary with educational feedback on improvements
              </p>
            </div>
          </div>
        </div>

        <Link
          to="/dashboard"
          className="inline-block px-12 py-4 bg-white text-[#2563EB] rounded-lg font-bold text-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl"
        >
          Get Started
        </Link>

        <div className="mt-12 text-blue-100 text-sm">
          <p>Hackathon MVP Demo • Mock Data Only</p>
        </div>
      </div>
    </div>
  );
};

// Main App component with routing
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
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
