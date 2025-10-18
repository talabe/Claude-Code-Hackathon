/**
 * Upload.jsx - SlideRx Upload Page Component
 *
 * Integration Instructions:
 * 1. Import this component in your main App.jsx or routes file:
 *    import Upload from './components/Upload';
 *
 * 2. Add to your React Router configuration:
 *    <Route path="/upload" element={<Upload />} />
 *
 * 3. Ensure Tailwind CSS is configured in your project
 * 4. This component uses mock data - all form submissions log to console
 */

import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { getCurrentUser } from "aws-amplify/auth";
import * as pdfjsLib from "pdfjs-dist";

// Follow-up questions configuration for each business purpose
const FOLLOW_UP_QUESTIONS = {
  "Status Update": [
    {
      id: "project-phase",
      label: "What project phase are you reporting on?",
      type: "text",
    },
    {
      id: "key-metrics",
      label: "What are the key metrics to highlight?",
      type: "text",
    },
    {
      id: "blockers",
      label: "Are there any current blockers?",
      type: "select",
      options: ["Yes", "No"],
    },
  ],
  Pitch: [
    {
      id: "audience-level",
      label: "Who is your primary audience?",
      type: "select",
      options: ["C-Suite", "VPs/Directors", "Team Leads", "External Investors"],
    },
    { id: "ask-amount", label: "What are you asking for?", type: "text" },
    { id: "timeline", label: "What is your proposed timeline?", type: "text" },
  ],
  "Budget Request": [
    {
      id: "budget-amount",
      label: "What is the requested budget amount?",
      type: "text",
    },
    {
      id: "duration",
      label: "Budget duration/period?",
      type: "select",
      options: ["Q1", "Q2", "Q3", "Q4", "Annual", "Multi-year"],
    },
    { id: "roi-expected", label: "Expected ROI or impact?", type: "text" },
  ],
  "Hiring Request": [
    { id: "headcount", label: "How many positions?", type: "text" },
    {
      id: "role-type",
      label: "Role type/seniority?",
      type: "select",
      options: ["Entry Level", "Mid-Level", "Senior", "Leadership"],
    },
    {
      id: "urgency",
      label: "Hiring urgency?",
      type: "select",
      options: ["Immediate", "This Quarter", "Next Quarter", "Flexible"],
    },
  ],
  "Project Report": [
    {
      id: "report-type",
      label: "Report type?",
      type: "select",
      options: [
        "Progress Update",
        "Final Report",
        "Milestone Review",
        "Post-Mortem",
      ],
    },
    { id: "stakeholders", label: "Key stakeholders?", type: "text" },
    { id: "next-steps", label: "What are the next steps?", type: "text" },
  ],
  "Use Case Presentation": [
    { id: "industry", label: "Which industry/vertical?", type: "text" },
    {
      id: "problem-solved",
      label: "What problem does this solve?",
      type: "text",
    },
    { id: "success-metric", label: "How is success measured?", type: "text" },
  ],
};

const Upload = () => {
  // State management
  const [selectedFile, setSelectedFile] = useState(null);
  const [businessPurpose, setBusinessPurpose] = useState("");
  const [projectName, setProjectName] = useState("");
  const [followUpAnswers, setFollowUpAnswers] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [pdfPageCount, setPdfPageCount] = useState(null);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // API Configuration
  const API_BASE_URL =
    "https://f9yntj41f4.execute-api.eu-central-1.amazonaws.com/dev";
  const [userId, setUserId] = useState(null);

  // Configure PDF.js worker
  useEffect(() => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url
    ).toString();
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const user = await getCurrentUser();
        if (mounted) setUserId(user?.userId);
      } catch (e) {
        console.error("Failed to get current user", e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // File validation
  const validateFile = (file) => {
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes

    if (!file.type.includes("pdf")) {
      return "Please upload a PDF file only.";
    }

    if (file.size > maxSize) {
      return "File size exceeds 10MB limit.";
    }

    return null;
  };

  // File selection handler
  const handleFileSelect = async (file) => {
    const validationError = validateFile(file);

    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      setPdfPageCount(null);
      return;
    }

    setError("");
    setSelectedFile(file);

    // Count PDF pages
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const pageCount = pdf.numPages;
      setPdfPageCount(pageCount);
      console.log(`PDF has ${pageCount} pages`);
    } catch (err) {
      console.error("Error counting PDF pages:", err);
      setPdfPageCount(null);
    }
  };

  // Drag and drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // File input change handler
  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Browse button click handler
  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  // Business purpose change handler
  const handlePurposeChange = (e) => {
    setBusinessPurpose(e.target.value);
    setFollowUpAnswers({}); // Reset follow-up answers when purpose changes
  };

  // Follow-up answer change handler
  const handleFollowUpChange = (questionId, value) => {
    setFollowUpAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  // Form submission handler
  const handleSubmit = async () => {
    setIsUploading(true);
    setError("");

    try {
      if (!userId) {
        throw new Error("Authentication not ready. Please try again.");
      }
      // Step 1: Start Project
      const projectData = {
        businessPurpose,
        projectName: projectName.trim() || undefined,
        projectBrief: followUpAnswers,
        fileName: selectedFile.name,
        originalSlidesCount: pdfPageCount ? String(pdfPageCount) : undefined,
      };

      console.log("followUpAnswers:", followUpAnswers);
      console.log("PDF Page Count:", pdfPageCount);
      console.log("Starting project with data:", projectData);

      console.log("Starting project with x-user-id:", userId);
      const projectResponse = await fetch(`${API_BASE_URL}/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify(projectData),
      });

      if (!projectResponse.ok) {
        const errText = await projectResponse.text().catch(() => "");
        throw new Error(
          `Failed to start project (${projectResponse.status}). ${errText}`
        );
      }

      const { projectId, uploadUrl } = await projectResponse.json();
      console.log("Project created with ID:", projectId);

      // Step 2: Upload PDF to S3
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/pdf",
        },
        body: selectedFile,
      });

      if (!uploadResponse.ok) {
        const errText = await uploadResponse.text().catch(() => "");
        throw new Error(
          `Failed to upload file (${uploadResponse.status}). ${errText}`
        );
      }

      console.log("File uploaded successfully");

      // Step 3: Navigate to processing page
      navigate(`/processing/${projectId}`);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message || "An error occurred. Please try again.");
      setIsUploading(false);
    }
  };

  // Get current follow-up questions based on selected purpose
  const currentQuestions = businessPurpose
    ? FOLLOW_UP_QUESTIONS[businessPurpose] || []
    : [];

  // Check if all follow-up questions are answered
  const allFollowUpsAnswered =
    currentQuestions.length > 0
      ? currentQuestions.every(
          (q) => followUpAnswers[q.id] && followUpAnswers[q.id].trim() !== ""
        )
      : false;

  // Determine if file upload section should be shown
  const showFileUpload =
    businessPurpose && (currentQuestions.length === 0 || allFollowUpsAnswered);

  return (
    <div className="min-h-screen bg-background-light">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="max-w-[800px] mx-auto px-4 sm:px-8 py-4 flex justify-between items-center">
          <button
            className="flex items-center gap-2 text-neutral-light hover:text-[#c7e565] transition-colors font-sans"
            onClick={() => navigate("/dashboard")}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="text-sm font-medium">Back</span>
          </button>

          <button
            className="px-4 py-2 text-sm font-medium text-neutral-light hover:text-[#EF4444] transition-colors font-sans"
            onClick={() => navigate("/logout")}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[800px] mx-auto px-4 sm:px-8 py-8 sm:py-16">
        {/* Page Title */}
        <h1 className="text-4xl font-bold font-mono text-heading mb-8 sm:mb-12">
          Transform Your Deck - Make An Impact
        </h1>

        {/* Business Purpose Section */}
        <section className="mb-8">
          <div className="flex flex-col items-center mb-4">
            <div className="w-12 h-12 bg-[#c7e565] rounded-full flex items-center justify-center mb-3">
              <span className="text-black font-bold text-lg font-mono">1</span>
            </div>
            <h2 className="text-2xl font-semibold font-mono text-heading text-center">
              Business Purpose
            </h2>
            <p className="text-sm text-neutral-light italic text-center mt-2 font-sans">
              This helps our AI tailor the analysis to your specific
              presentation goals and executive expectations.
            </p>
          </div>
          <label className="block text-base font-bold font-mono text-heading mb-2">
            What's the business purpose?
          </label>
          <select
            value={businessPurpose}
            onChange={handlePurposeChange}
            className="w-full px-4 py-3 border border-border rounded-lg bg-white text-base text-neutral-dark font-sans focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">Select a purpose</option>
            <option value="Status Update">Status Update</option>
            <option value="Pitch">Pitch</option>
            <option value="Budget Request">Budget Request</option>
            <option value="Hiring Request">Hiring Request</option>
            <option value="Project Report">Project Report</option>
            <option value="Use Case Presentation">Use Case Presentation</option>
          </select>
        </section>

        {/* Project Name Section */}
        {businessPurpose && (
          <section className="mb-8 fade-in-section">
            <div className="flex flex-col items-center mb-4">
              <div className="w-12 h-12 bg-[#c7e565] rounded-full flex items-center justify-center mb-3">
                <span className="text-black font-bold text-lg font-mono">2</span>
              </div>
              <h2 className="text-2xl font-semibold font-mono text-heading text-center">
                Project Name (optional)
              </h2>
              <p className="text-sm text-neutral-light italic text-center mt-2 font-sans">
                Give your project a memorable name for easy reference
              </p>
            </div>
            <label className="block text-base font-bold font-mono text-heading mb-2">
              Project Name
            </label>
            <div>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                maxLength={100}
                placeholder="e.g., Q4 Budget Review, Client Pitch Deck, Team Update"
                className="w-full px-4 py-3 border border-border rounded-lg bg-white text-base text-neutral-dark font-sans focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <div className="text-right mt-1">
                <span
                  className={`text-xs italic font-sans ${
                    projectName.length > 85
                      ? "text-[#EF4444] font-semibold"
                      : "text-neutral-light"
                  }`}
                >
                  {projectName.length}/100
                </span>
              </div>
            </div>
          </section>
        )}

        {/* Dynamic Follow-up Questions Section */}
        {currentQuestions.length > 0 && (
          <section className="mb-8 space-y-6 fade-in-section">
            <div className="flex flex-col items-center mb-4">
              <div className="w-12 h-12 bg-[#c7e565] rounded-full flex items-center justify-center mb-3">
                <span className="text-black font-bold text-lg font-mono">3</span>
              </div>
              <h2 className="text-2xl font-semibold font-mono text-heading text-center">
                Additional Details
              </h2>
              <p className="text-sm text-neutral-light italic text-center mt-2 font-sans">
                These details help the AI understand your purpose and provide
                tailor-made recommendations.
              </p>
            </div>

            {currentQuestions.map((question) => (
              <div key={question.id}>
                <label className="block text-base font-bold font-mono text-heading mb-2">
                  {question.label}
                </label>

                {question.type === "text" ? (
                  <div>
                    <input
                      type="text"
                      value={followUpAnswers[question.id] || ""}
                      onChange={(e) =>
                        handleFollowUpChange(question.id, e.target.value)
                      }
                      maxLength={100}
                      className="w-full px-4 py-3 border border-border rounded-lg bg-white text-base text-neutral-dark font-sans focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter your answer..."
                    />
                    <div className="text-right mt-1">
                      <span
                        className={`text-xs italic font-sans ${
                          (followUpAnswers[question.id]?.length || 0) > 85
                            ? "text-[#EF4444] font-semibold"
                            : "text-neutral-light"
                        }`}
                      >
                        {followUpAnswers[question.id]?.length || 0}/100
                      </span>
                    </div>
                  </div>
                ) : (
                  <select
                    value={followUpAnswers[question.id] || ""}
                    onChange={(e) =>
                      handleFollowUpChange(question.id, e.target.value)
                    }
                    className="w-full px-4 py-3 border border-border rounded-lg bg-white text-base text-neutral-dark font-sans focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Select an option</option>
                    {question.options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </section>
        )}

        {/* File Upload Section - Only show when conditions are met */}
        {showFileUpload && (
          <section className="mb-8 fade-in-section">
            <div className="flex flex-col items-center mb-4">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                  currentQuestions.length > 0 ? "bg-[#c7e565]" : "bg-[#10B981]"
                }`}
              >
                <span className="text-black font-bold text-lg font-mono">
                  {currentQuestions.length > 0 ? "4" : "3"}
                </span>
              </div>
              <h2 className="text-2xl font-semibold font-mono text-heading text-center">
                File Upload
              </h2>
              <p className="text-sm text-neutral-light italic text-center mt-2 font-sans">
                Upload your PDF presentation so our AI can analyze and condense
                it into an executive-ready summary.
              </p>
            </div>
            <div
              className={`
              relative border-2 border-dashed rounded-lg p-8 sm:p-12 text-center transition-all
              ${
                isDragging
                  ? "border-[#c7e565] bg-background-light"
                  : "border-border bg-white"
              }
              ${error ? "border-[#EF4444] bg-red-50" : ""}
            `}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileInputChange}
                className="hidden"
              />

              {selectedFile ? (
                <div className="flex flex-col items-center gap-4">
                  <svg
                    className="w-12 h-12 text-[#10B981]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="text-base font-medium font-mono text-heading">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-neutral-light font-sans mt-1">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      {pdfPageCount && ` • ${pdfPageCount} pages`}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <svg
                    className="w-12 h-12 text-neutral-light"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <div>
                    <p className="text-base text-neutral-dark font-sans mb-2">
                      Drag and drop your PDF here, or
                    </p>
                    <button
                      onClick={handleBrowseClick}
                      className="px-6 py-2 bg-[#c7e565] text-black rounded-lg hover:bg-[#90BC00] transition-colors font-medium font-mono"
                    >
                      Browse Files
                    </button>
                  </div>
                </div>
              )}

              <p className="text-sm text-neutral-light font-sans mt-4">
                Max 15 slides, 10MB, PDF format
              </p>

              {error && (
                <div className="mt-4 p-3 bg-[#FEE2E2] border border-[#EF4444] rounded-lg">
                  <p className="text-sm text-[#EF4444] font-medium font-sans">{error}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Submit Button */}
        <div className="flex justify-center mt-12">
          <button
            onClick={handleSubmit}
            disabled={!selectedFile || !businessPurpose || isUploading}
            className={`
              px-12 py-4 rounded-lg font-semibold text-lg transition-all font-mono
              ${
                selectedFile && businessPurpose && !isUploading
                  ? "bg-[#c7e565] text-black hover:bg-[#90BC00] cursor-pointer shadow-lg hover:shadow-xl"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }
            `}
          >
            {isUploading ? "Uploading..." : "Analyze Deck"}
          </button>
        </div>
      </main>
    </div>
  );
};

Upload.propTypes = {
  // Add any props here if needed in the future
};

export default Upload;
