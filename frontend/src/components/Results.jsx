/**
 * Results.jsx - SlideRx Results Page Component
 *
 * Displays the AI-generated 3-slide executive summary and educational
 * "Why We Cut This" report showing what was removed and why.
 *
 * Integration Instructions:
 * 1. Import this component in your App.jsx:
 *    import Results from './components/Results';
 *
 * 2. Add to your React Router configuration:
 *    <Route path="/results" element={<Results />} />
 *
 * 3. Navigate to this page after processing completes
 */

import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../logo.jpg";

// Mock data - Used as fallback if no project data is passed
const MOCK_RESULTS = {
  originalFileName: "Q3_Project_StatusUpdate.pdf",
  originalSlideCount: 40,
  finalSlideCount: 3,
  businessPurpose: "Status Update",
  contextAnswers: {
    projectPhase: "Kickoff phase concluded",
    keyMetrics:
      "34 user stories created, all 7 involved departments participated",
    blockers: "No",
  },
  slides: [
    {
      id: 1,
      title: "THE PROGRESS",
      visualIcon: "📊",
      visualDescription:
        'Timeline diagram showing kickoff phase completed (green checkmark), current phase "Requirements Gathering" at 60% (yellow), next phase "Development" at 0% (gray)',
      oneSentence:
        "Kickoff phase complete with all 7 departments aligned on 34 user stories.",
    },
    {
      id: 2,
      title: "THE MOMENTUM",
      visualIcon: "📈",
      visualDescription:
        "Bar chart comparing planned vs. actual: Department participation (100% vs. 100%), User stories defined (30 planned vs. 34 actual), showing we exceeded targets",
      oneSentence:
        "We're ahead of schedule with 13% more user stories than planned.",
    },
    {
      id: 3,
      title: "THE NEXT STEP",
      visualIcon: "📅",
      visualDescription:
        'Calendar showing next 2 weeks with milestone: "Requirements Review Meeting" on [Date + 5 days], decision point highlighted in red',
      oneSentence:
        "Requirements review meeting scheduled for {{meetingDate}} - approval needed to start development.",
    },
  ],
  whyWeCut: [
    {
      id: 1,
      slidesAffected:
        "Slides 1-4 (Title, Agenda, Team Intro, Project Background)",
      cutDescription: "Removed all preamble slides",
      whyDescription: "Executives start with outcomes, not setup",
      principle: "Decision-first structure (Duarte)",
      location: "Deleted (non-essential for status update)",
    },
    {
      id: 2,
      slidesAffected:
        "Slides 7-15 (Detailed Timeline, Meeting Notes, Process Documentation)",
      cutDescription: "9 slides of historical process details",
      whyDescription:
        "Executives care about current status and next steps, not how you got here",
      principle: "Relevance over completeness",
      location: "Moved to appendix (available if requested)",
    },
    {
      id: 3,
      slidesAffected: "Slides 18-25 (Department-by-Department Breakdown)",
      cutDescription: "Individual department status reports (8 slides)",
      whyDescription:
        "Aggregated metric (100% participation) tells the story faster than 8 individual reports",
      principle: "Signal-to-noise ratio (Roam)",
      location: "Condensed to single bar chart on Slide 2",
    },
    {
      id: 4,
      slidesAffected: "Slide 28 (Risk Analysis Table)",
      cutDescription: "12-row risk matrix with probabilities",
      whyDescription:
        'User confirmed "No blockers" - no risks worth executive attention',
      principle: "Only show what requires decision or action",
      location: "Deleted (not relevant when no blockers exist)",
    },
    {
      id: 5,
      slidesAffected: "Slides 32-38 (Next Phase Planning Details)",
      cutDescription: "7 slides of detailed development phase plans",
      whyDescription:
        "For a status update, executives need the decision point (approval for next phase), not the full plan",
      principle: "Appropriate detail level for audience",
      location: "Moved to appendix (will be reviewed if phase approved)",
    },
  ],
};

const Results = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [reportExpanded, setReportExpanded] = useState(false);

  // Get project data from route state, fallback to mock data
  const projectData = location.state?.project || null;
  // console.log("Results - Project Data:", projectData);

  // Helper function to convert camelCase to Title Case
  const camelToTitle = (str) => {
    return str
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (s) => s.toUpperCase())
      .trim();
  };

  // Helper function to convert summary.executiveSummaryRecommendation to slides format
  const convertSummaryToSlides = (summary) => {
    if (!summary?.executiveSummaryRecommendation) return null;

    const recommendation = summary.executiveSummaryRecommendation;
    const slides = [];

    // Define slide configurations
    const slideConfigs = [
      {
        key: "slide1_problem",
        id: 1,
        defaultTitle: "THE PROBLEM",
        icon: "⚠️",
      },
      {
        key: "slide2_solution",
        id: 2,
        defaultTitle: "THE SOLUTION",
        icon: "💡",
      },
      { key: "slide3_ask", id: 3, defaultTitle: "THE ASK", icon: "🎯" },
    ];

    slideConfigs.forEach((config) => {
      const slideData = recommendation[config.key];
      if (!slideData) return;

      // Build the slide object dynamically
      const slide = {
        id: config.id,
        title: slideData.title?.toUpperCase() || config.defaultTitle,
        visualIcon: config.icon,
        fields: [], // Dynamic fields to render
      };

      // Process all fields in the slide data
      Object.entries(slideData).forEach(([key, value]) => {
        if (key === "title") return; // Already handled

        const fieldLabel = camelToTitle(key);
        let fieldContent;

        if (Array.isArray(value)) {
          // If it's an array, join with bullet points
          fieldContent = value.join(" • ");
        } else if (typeof value === "string") {
          // If it's a string, use as is
          fieldContent = value;
        } else {
          // For other types, convert to string
          fieldContent = String(value);
        }

        slide.fields.push({
          label: fieldLabel,
          content: fieldContent,
        });
      });

      slides.push(slide);
    });

    return slides.length > 0 ? slides : null;
  };

  // Use project data if available, otherwise use mock data
  const results = projectData
    ? {
        originalFileName:
          projectData.projectName || projectData.projectId || "Unknown File",
        originalSlideCount:
          projectData.originalSlideCount ||
          projectData.originalSlidesCount ||
          projectData.projectBrief?.slideCount ||
          40,
        finalSlideCount:
          projectData.finalSlideCount ||
          convertSummaryToSlides(projectData.summary)?.length ||
          projectData.executiveSummary?.slides?.length ||
          3,
        businessPurpose:
          projectData.businessPurpose ||
          projectData.projectBrief?.businessPurpose ||
          "Unknown Purpose",
        contextAnswers:
          projectData.contextAnswers ||
          projectData.projectBrief?.contextAnswers ||
          MOCK_RESULTS.contextAnswers,
        slides:
          convertSummaryToSlides(projectData.summary) ||
          projectData.executiveSummary?.slides ||
          MOCK_RESULTS.slides,
        whyWeCut:
          projectData.executiveSummary?.whyWeCut || MOCK_RESULTS.whyWeCut,
      }
    : MOCK_RESULTS;

  // Calculate meeting date (current date + 5 days)
  const getMeetingDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 5);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Replace {{meetingDate}} placeholder in slides
  const slides = results.slides.map((slide) => {
    const updatedSlide = { ...slide };

    // Replace in oneSentence if it exists (old structure)
    if (updatedSlide.oneSentence) {
      updatedSlide.oneSentence = updatedSlide.oneSentence.replace(
        "{{meetingDate}}",
        getMeetingDate()
      );
    }

    // Replace in fields if they exist (new structure)
    if (updatedSlide.fields) {
      updatedSlide.fields = updatedSlide.fields.map((field) => ({
        ...field,
        content: field.content.replace("{{meetingDate}}", getMeetingDate()),
      }));
    }

    return updatedSlide;
  });

  // Handler functions
  const handleDownloadPDF = async () => {
    // console.log("=== Download PDF ===");

    // Check if we have a downloadUrl from the project data
    if (projectData?.downloadUrl) {
      try {
        // console.log("Downloading from:", projectData.downloadUrl);

        // Open the URL in a new window to trigger download
        // This bypasses CORS issues since it's a direct navigation
        const link = document.createElement("a");
        link.href = projectData.downloadUrl;
        link.target = "_blank";
        link.download = `${results.originalFileName.replace(
          ".pdf",
          ""
        )}_ExecutiveSummary.pdf`;

        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log("Download initiated successfully");
      } catch (error) {
        console.error("Download failed:", error);
        alert("Failed to download the PDF. Please try again.");
      }
    } else {
      console.log("No downloadUrl available");
      console.log(
        "File:",
        `${results.originalFileName.replace(".pdf", "")}_ExecutiveSummary.pdf`
      );
      alert("Download URL not available. This feature requires project data.");
    }
  };

  const handleAnalyzeAnother = () => {
    navigate("/upload");
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  const toggleReport = () => {
    setReportExpanded(!reportExpanded);
  };

  return (
    <div className="min-h-screen bg-background-light">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="max-w-[900px] mx-auto px-4 sm:px-8 py-4 flex justify-between items-center">
          <button
            className="flex items-center gap-2 text-neutral-light hover:text-[#c7e565] transition-colors font-sans"
            onClick={handleBackToDashboard}
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
            <span className="text-sm font-medium">Back to Dashboard</span>
          </button>
          <img src={logo} alt="SlideRx" className="h-8" />
          <button
            className="px-4 py-2 text-sm font-medium text-neutral-light hover:text-[#EF4444] transition-colors font-sans"
            onClick={() => navigate("/logout")}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[900px] mx-auto px-4 sm:px-8 py-8 sm:py-12">
        {/* Warning banner if using mock data */}
        {!projectData && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-yellow-600 text-xl">⚠️</span>
              <div>
                <p className="text-sm text-yellow-800 font-medium">
                  Displaying mock data
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  No project data was passed. This may happen if you accessed
                  this page directly.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Title Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-mono text-heading mb-4">
            Your Executive Summary
          </h1>
          <div className="flex items-center gap-4 text-neutral-light font-sans">
            <span className="text-sm">
              Original: {results.originalFileName}
            </span>
            <span className="text-2xl font-bold text-[#10B981]">
              {results.originalSlideCount} slides → {results.finalSlideCount}{" "}
              slides
            </span>
          </div>
        </div>

        {/* Slide Cards */}
        <div className="space-y-6 mb-8">
          {slides.map((slide) => (
            <div
              key={slide.id}
              className="bg-white rounded-lg shadow-lg border border-border p-6 sm:p-8"
            >
              <h2 className="text-2xl font-bold font-mono text-heading mb-4">
                SLIDE {slide.id}: {slide.title}
              </h2>

              {/* Render dynamic fields if available, otherwise use old structure */}
              {slide.fields && slide.fields.length > 0 ? (
                <div className="space-y-4">
                  {slide.fields.map((field, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0">
                        {slide.visualIcon}
                      </span>
                      <div className="flex-1">
                        <p className="text-base leading-relaxed text-neutral-dark font-sans">
                          <span className="font-semibold font-mono text-heading">
                            {field.label}:{" "}
                          </span>
                          {field.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {/* Old structure fallback */}
                  {slide.visualDescription && (
                    <div className="mb-4">
                      <div className="flex items-start gap-3 text-neutral-light">
                        <span className="text-2xl flex-shrink-0">
                          {slide.visualIcon}
                        </span>
                        <p className="text-base leading-relaxed font-sans">
                          <span className="font-semibold font-mono">
                            Visual:{" "}
                          </span>
                          {slide.visualDescription}
                        </p>
                      </div>
                    </div>
                  )}

                  {slide.oneSentence && (
                    <p className="text-lg font-bold font-mono text-heading leading-relaxed">
                      "{slide.oneSentence}"
                    </p>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        {/* Why We Cut This Section */}
        {/* <div className="bg-white rounded-lg shadow-lg border border-border overflow-hidden mb-8">
          <button
            onClick={toggleReport}
            onKeyDown={(e) => e.key === "Enter" && toggleReport()}
            className="w-full px-6 sm:px-8 py-6 flex items-center justify-between hover:bg-background-light transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset"
            aria-expanded={reportExpanded}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">📚</span>
              <h2 className="text-xl sm:text-2xl font-bold font-mono text-heading">
                Why We Cut This
              </h2>
            </div>
            <svg
              className={`w-6 h-6 text-neutral-light transition-transform duration-300 ${
                reportExpanded ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          <div
            className={`transition-all duration-300 ease-in-out ${
              reportExpanded
                ? "max-h-[3000px] opacity-100"
                : "max-h-0 opacity-0"
            } overflow-hidden`}
          >
            <div className="px-6 sm:px-8 pb-8 space-y-6">
              {results.whyWeCut.map((item, index) => (
                <div key={item.id}>
                  {index > 0 && (
                    <div className="border-t border-border my-6"></div>
                  )}
                  <div className="space-y-3">
                    <h3 className="font-bold font-mono text-heading text-lg">
                      {item.slidesAffected}
                    </h3>

                    <div className="flex items-start gap-2">
                      <span className="text-lg flex-shrink-0">❌</span>
                      <p className="text-base text-neutral-dark font-sans">
                        <span className="font-semibold font-mono">CUT: </span>
                        {item.cutDescription}
                      </p>
                    </div>

                    <div className="flex items-start gap-2">
                      <span className="text-lg flex-shrink-0">✅</span>
                      <p className="text-base text-neutral-dark font-sans">
                        <span className="font-semibold font-mono">WHY: </span>
                        {item.whyDescription}
                      </p>
                    </div>

                    <div className="flex items-start gap-2">
                      <span className="text-lg flex-shrink-0">📚</span>
                      <p className="text-base text-neutral-dark font-sans">
                        <span className="font-semibold font-mono">PRINCIPLE: </span>
                        {item.principle}
                      </p>
                    </div>

                    <div className="flex items-start gap-2">
                      <span className="text-lg flex-shrink-0">📍</span>
                      <p className="text-base text-neutral-dark font-sans">
                        <span className="font-semibold font-mono">LOCATION: </span>
                        {item.location}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div> */}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleDownloadPDF}
            className="px-8 py-4 bg-[#c7e565] text-black rounded-lg font-semibold text-lg font-mono hover:bg-[#90BC00] transition-colors shadow-lg hover:shadow-xl"
          >
            Download PDF
          </button>
          <button
            onClick={handleAnalyzeAnother}
            className="px-8 py-4 bg-white text-black border-2 border-[#c7e565] rounded-lg font-semibold text-lg font-mono hover:bg-background-light transition-colors shadow-lg hover:shadow-xl"
          >
            Analyze Another
          </button>
        </div>
      </main>
    </div>
  );
};

export default Results;
