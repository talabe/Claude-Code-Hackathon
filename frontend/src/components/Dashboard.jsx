/**
 * Dashboard.jsx - SlideRx Dashboard Component
 *
 * Displays all user projects with status indicators and navigation.
 * Users can see their presentation projects, current status, and take action.
 *
 * Integration Instructions:
 * 1. Import this component in your App.jsx:
 *    import Dashboard from './components/Dashboard';
 *
 * 2. Add to your React Router configuration:
 *    <Route path="/dashboard" element={<Dashboard />} />
 *
 * 3. Navigate to /dashboard to see all projects
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  // API Configuration
  // TODO: Replace 'test-user' with authenticated user ID when auth system is integrated
  const API_BASE_URL = 'https://f9yntj41f4.execute-api.eu-central-1.amazonaws.com/dev';
  const USER_ID = 'test-user';

  // State management
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nextToken, setNextToken] = useState(null);

  // Format timestamp to relative time
  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return 'Unknown date';

    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    // Format as "Oct 10, 2025"
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Get status badge configuration
  const getStatusBadge = (status) => {
    const statusConfig = {
      'uploading': {
        color: 'bg-[#3B82F6] text-white',
        icon: '🔵',
        text: 'Uploading...',
        animate: false
      },
      'processing': {
        color: 'bg-[#F59E0B] text-white',
        icon: '🟡',
        text: 'Analyzing...',
        animate: false
      },
      'needs_review': {
        color: 'bg-[#F97316] text-white',
        icon: '🟠',
        text: 'Action Required',
        animate: true
      },
      'generating presentation': {
        color: 'bg-[#8B5CF6] text-white',
        icon: '🟣',
        text: 'Finalizing...',
        animate: false
      },
      'completed': {
        color: 'bg-[#10B981] text-white',
        icon: '🟢',
        text: 'Ready to View',
        animate: false
      }
    };

    // Default to processing if status is unknown
    return statusConfig[status] || statusConfig['processing'];
  };

  // Get action button text based on status
  const getActionButtonText = (status) => {
    switch (status) {
      case 'needs_review':
        return 'Answer Questions →';
      case 'completed':
        return 'View Results →';
      case 'processing':
      case 'generating presentation':
        return 'View Status →';
      case 'uploading':
        return 'Processing...';
      default:
        return 'View Status →';
    }
  };

  // Handle card click - navigate based on status
  const handleCardClick = (project) => {
    const { projectId, status } = project;

    console.log(`Card clicked: ${projectId}, status: ${status}`);

    if (status === 'uploading') {
      console.log('Project is still uploading, showing toast message');
      // In production, show a toast notification
      alert('Project is still uploading. Please wait...');
      return;
    }

    if (status === 'needs_review') {
      console.log(`Navigating to /followup/${projectId}`);
      navigate(`/followup/${projectId}`);
    } else if (status === 'completed') {
      console.log(`Navigating to /results/${projectId}`);
      navigate(`/results/${projectId}`);
    } else if (status === 'processing' || status === 'generating presentation') {
      console.log(`Navigating to /processing/${projectId}`);
      navigate(`/processing/${projectId}`);
    }
  };

  // Handle new project button
  const handleNewProject = () => {
    console.log('New Project clicked');
    navigate('/upload');
  };

  // Handle logout button
  const handleLogout = () => {
    console.log('Logout clicked');
    navigate('/');
  };

  // Fetch projects from API
  const fetchProjects = async () => {
    try {
      console.log('Fetching projects...');
      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: 'GET',
        headers: {
          'x-user-id': USER_ID
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load projects. Please try again.');
      }

      const data = await response.json();
      console.log(`Fetched ${data.items?.length || 0} projects`);
      console.log('Projects data:', data);

      // Sort projects by createdAt (most recent first)
      const sortedProjects = (data.items || []).sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB - dateA;
      });

      setProjects(sortedProjects);
      setNextToken(data.nextToken || null);
      setError(null);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err.message || 'Unable to load projects. Please refresh the page.');
      setLoading(false);
    }
  };

  // Fetch projects on mount
  useEffect(() => {
    fetchProjects();
  }, []);

  // Auto-refresh every 30 seconds to update statuses
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      console.log('Auto-refreshing projects...');
      fetchProjects();
    }, 30000); // 30 seconds

    return () => clearInterval(refreshInterval);
  }, []);

  // Retry handler for error state
  const handleRetry = () => {
    setLoading(true);
    setError(null);
    fetchProjects();
  };

  // Extract business purpose from project
  const getBusinessPurpose = (project) => {
    return project.businessPurpose || project.projectBrief?.businessPurpose || 'Untitled Project';
  };

  // Get display name for project card
  const getDisplayName = (project) => {
    return project.projectName || project.projectId || 'Untitled Project';
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-[#2563EB]">SlideRx</h1>
            <button
              onClick={handleLogout}
              className="text-sm text-[#64748B] hover:text-[#EF4444] transition-colors font-medium"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Loading Spinner */}
        <main className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <svg
                className="w-12 h-12 text-[#2563EB] animate-spin mx-auto mb-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <p className="text-[#64748B]">Loading your projects...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-[#2563EB]">SlideRx</h1>
            <button
              onClick={handleLogout}
              className="text-sm text-[#64748B] hover:text-[#EF4444] transition-colors font-medium"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Error Message */}
        <main className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="max-w-md mx-auto text-center">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <svg className="w-16 h-16 text-[#EF4444] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
                <p className="text-[#64748B] mb-6">{error}</p>
                <button
                  onClick={handleRetry}
                  className="px-6 py-2 bg-[#2563EB] text-white rounded-lg hover:bg-[#1e40af] transition-colors font-medium"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Empty state
  if (projects.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-[#2563EB]">SlideRx</h1>
            <button
              onClick={handleLogout}
              className="text-sm text-[#64748B] hover:text-[#EF4444] transition-colors font-medium"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Empty State */}
        <main className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <svg className="w-24 h-24 text-[#64748B] mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No projects yet</h2>
              <p className="text-[#64748B] mb-8">Upload your first presentation to get started</p>
              <button
                onClick={handleNewProject}
                className="px-8 py-3 bg-[#2563EB] text-white rounded-lg hover:bg-[#1e40af] transition-colors font-semibold shadow-lg hover:shadow-xl"
              >
                Upload Presentation
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Main dashboard with projects
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-[#2563EB]">SlideRx</h1>
          <button
            onClick={handleLogout}
            className="text-sm text-[#64748B] hover:text-[#EF4444] transition-colors font-medium"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        {/* Page Title Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">My Projects</h2>
            <p className="text-[#64748B]">
              Manage your presentation transformations
              <span className="ml-2 text-sm font-medium">• {projects.length} Project{projects.length === 1 ? '' : 's'}</span>
            </p>
          </div>
          <button
            onClick={handleNewProject}
            className="mt-4 sm:mt-0 px-6 py-3 bg-[#2563EB] text-white rounded-lg hover:bg-[#1e40af] transition-colors font-semibold shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </button>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const statusBadge = getStatusBadge(project.status);
            const businessPurpose = getBusinessPurpose(project);
            const displayName = getDisplayName(project);
            const actionText = getActionButtonText(project.status);
            const isUploading = project.status === 'uploading';

            return (
              <article
                key={project.projectId}
                className="bg-white rounded-xl border border-gray-200 p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
                onClick={() => handleCardClick(project)}
                onKeyDown={(e) => e.key === 'Enter' && handleCardClick(project)}
                tabIndex={0}
                role="button"
                aria-label={`Open project: ${displayName}`}
              >
                {/* Status Badge */}
                <div className="mb-4">
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${statusBadge.color} ${statusBadge.animate ? 'animate-pulse' : ''}`}
                    aria-label={`Status: ${statusBadge.text}`}
                  >
                    <span className="text-xs">{statusBadge.icon}</span>
                    {statusBadge.text}
                  </span>
                </div>

                {/* Project Name (Card Title) */}
                <div className="mb-3">
                  <h3 className="text-xl font-semibold text-[#1F2937] leading-snug line-clamp-2">
                    {displayName}
                  </h3>
                  {project.businessPurpose && (
                    <p className="text-sm text-[#64748B] mt-1">
                      Presentation type: {project.businessPurpose}
                    </p>
                  )}
                </div>

                {/* Metadata */}
                <div className="text-sm text-[#64748B] mb-4">
                  <p>Created {formatRelativeTime(project.createdAt)}</p>
                  {project.projectName && project.projectName !== project.projectId && (
                    <p className="text-xs mt-1 truncate">ID: {project.projectName}</p>
                  )}
                </div>

                {/* Action Button */}
                <button
                  className={`w-full py-2.5 rounded-lg font-medium transition-colors ${
                    isUploading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-[#2563EB] text-white hover:bg-[#1e40af]'
                  }`}
                  disabled={isUploading}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCardClick(project);
                  }}
                  aria-label={actionText}
                >
                  {actionText}
                </button>

                {/* ⚠️⚠️⚠️ TEMPORARY DEBUG - DELETE THIS BEFORE PRODUCTION ⚠️⚠️⚠️ */}
                <p className="text-xs italic text-[#64748B] mt-2 text-center">
                  Project ID: {project.projectId}<br />
                  Status: {project.status}
                </p>
                {/* ⚠️⚠️⚠️ END TEMPORARY DEBUG ⚠️⚠️⚠️ */}
              </article>
            );
          })}
        </div>

        {/* Load More Button (if pagination token exists) */}
        {nextToken && (
          <div className="mt-8 text-center">
            <button
              onClick={() => {
                console.log('Load More clicked - pagination not yet implemented');
                // TODO: Implement pagination when backend supports it
              }}
              className="px-6 py-3 bg-white text-[#2563EB] border-2 border-[#2563EB] rounded-lg hover:bg-blue-50 transition-colors font-semibold"
            >
              Load More Projects
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
