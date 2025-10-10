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

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Mock data - In production, this would come from API/state management
const MOCK_RESULTS = {
  originalFileName: 'Q3_Project_StatusUpdate.pdf',
  originalSlideCount: 40,
  finalSlideCount: 3,
  businessPurpose: 'Status Update',
  contextAnswers: {
    projectPhase: 'Kickoff phase concluded',
    keyMetrics: '34 user stories created, all 7 involved departments participated',
    blockers: 'No'
  },
  slides: [
    {
      id: 1,
      title: 'THE PROGRESS',
      visualIcon: '📊',
      visualDescription: 'Timeline diagram showing kickoff phase completed (green checkmark), current phase "Requirements Gathering" at 60% (yellow), next phase "Development" at 0% (gray)',
      oneSentence: 'Kickoff phase complete with all 7 departments aligned on 34 user stories.'
    },
    {
      id: 2,
      title: 'THE MOMENTUM',
      visualIcon: '📈',
      visualDescription: 'Bar chart comparing planned vs. actual: Department participation (100% vs. 100%), User stories defined (30 planned vs. 34 actual), showing we exceeded targets',
      oneSentence: "We're ahead of schedule with 13% more user stories than planned."
    },
    {
      id: 3,
      title: 'THE NEXT STEP',
      visualIcon: '📅',
      visualDescription: 'Calendar showing next 2 weeks with milestone: "Requirements Review Meeting" on [Date + 5 days], decision point highlighted in red',
      oneSentence: 'Requirements review meeting scheduled for {{meetingDate}} - approval needed to start development.'
    }
  ],
  whyWeCut: [
    {
      id: 1,
      slidesAffected: 'Slides 1-4 (Title, Agenda, Team Intro, Project Background)',
      cutDescription: 'Removed all preamble slides',
      whyDescription: 'Executives start with outcomes, not setup',
      principle: 'Decision-first structure (Duarte)',
      location: 'Deleted (non-essential for status update)'
    },
    {
      id: 2,
      slidesAffected: 'Slides 7-15 (Detailed Timeline, Meeting Notes, Process Documentation)',
      cutDescription: '9 slides of historical process details',
      whyDescription: 'Executives care about current status and next steps, not how you got here',
      principle: 'Relevance over completeness',
      location: 'Moved to appendix (available if requested)'
    },
    {
      id: 3,
      slidesAffected: 'Slides 18-25 (Department-by-Department Breakdown)',
      cutDescription: 'Individual department status reports (8 slides)',
      whyDescription: 'Aggregated metric (100% participation) tells the story faster than 8 individual reports',
      principle: 'Signal-to-noise ratio (Roam)',
      location: 'Condensed to single bar chart on Slide 2'
    },
    {
      id: 4,
      slidesAffected: 'Slide 28 (Risk Analysis Table)',
      cutDescription: '12-row risk matrix with probabilities',
      whyDescription: 'User confirmed "No blockers" - no risks worth executive attention',
      principle: 'Only show what requires decision or action',
      location: 'Deleted (not relevant when no blockers exist)'
    },
    {
      id: 5,
      slidesAffected: 'Slides 32-38 (Next Phase Planning Details)',
      cutDescription: '7 slides of detailed development phase plans',
      whyDescription: 'For a status update, executives need the decision point (approval for next phase), not the full plan',
      principle: 'Appropriate detail level for audience',
      location: 'Moved to appendix (will be reviewed if phase approved)'
    }
  ]
};

const Results = () => {
  const navigate = useNavigate();
  const [reportExpanded, setReportExpanded] = useState(false);

  // Calculate meeting date (current date + 5 days)
  const getMeetingDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 5);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Replace {{meetingDate}} placeholder in slide 3
  const slides = MOCK_RESULTS.slides.map(slide => ({
    ...slide,
    oneSentence: slide.oneSentence.replace('{{meetingDate}}', getMeetingDate())
  }));

  // Handler functions
  const handleDownloadPDF = () => {
    console.log('=== Download PDF ===');
    console.log('Downloading executive summary as PDF...');
    console.log('File:', `${MOCK_RESULTS.originalFileName.replace('.pdf', '')}_ExecutiveSummary.pdf`);
    // In production, this would trigger actual PDF download
  };

  const handleAnalyzeAnother = () => {
    navigate('/upload');
  };

  const handleBackToDashboard = () => {
    console.log('=== Navigate to Dashboard ===');
    console.log('Dashboard not yet implemented');
    // In production: navigate('/dashboard');
  };

  const toggleReport = () => {
    setReportExpanded(!reportExpanded);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-[900px] mx-auto px-4 sm:px-8 py-4 flex justify-between items-center">
          <button
            className="flex items-center gap-2 text-[#64748B] hover:text-[#2563EB] transition-colors"
            onClick={handleBackToDashboard}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Back to Dashboard</span>
          </button>

          <button
            className="px-4 py-2 text-sm font-medium text-[#64748B] hover:text-[#EF4444] transition-colors"
            onClick={() => navigate('/logout')}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[900px] mx-auto px-4 sm:px-8 py-8 sm:py-12">
        {/* Title Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Your Executive Summary
          </h1>
          <div className="flex items-center gap-4 text-[#64748B]">
            <span className="text-sm">Original: {MOCK_RESULTS.originalFileName}</span>
            <span className="text-2xl font-bold text-[#10B981]">
              {MOCK_RESULTS.originalSlideCount} slides → {MOCK_RESULTS.finalSlideCount} slides
            </span>
          </div>
        </div>

        {/* Slide Cards */}
        <div className="space-y-6 mb-8">
          {slides.map((slide) => (
            <div
              key={slide.id}
              className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 sm:p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                SLIDE {slide.id}: {slide.title}
              </h2>

              <div className="mb-4">
                <div className="flex items-start gap-3 text-[#64748B]">
                  <span className="text-2xl flex-shrink-0">{slide.visualIcon}</span>
                  <p className="text-base leading-relaxed">
                    <span className="font-semibold">Visual: </span>
                    {slide.visualDescription}
                  </p>
                </div>
              </div>

              <p className="text-lg font-bold text-gray-900 leading-relaxed">
                "{slide.oneSentence}"
              </p>
            </div>
          ))}
        </div>

        {/* Why We Cut This Section */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden mb-8">
          <button
            onClick={toggleReport}
            onKeyDown={(e) => e.key === 'Enter' && toggleReport()}
            className="w-full px-6 sm:px-8 py-6 flex items-center justify-between hover:bg-[#F8FAFC] transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-inset"
            aria-expanded={reportExpanded}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">📚</span>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Why We Cut This
              </h2>
            </div>
            <svg
              className={`w-6 h-6 text-[#64748B] transition-transform duration-300 ${
                reportExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div
            className={`transition-all duration-300 ease-in-out ${
              reportExpanded ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'
            } overflow-hidden`}
          >
            <div className="px-6 sm:px-8 pb-8 space-y-6">
              {MOCK_RESULTS.whyWeCut.map((item, index) => (
                <div key={item.id}>
                  {index > 0 && (
                    <div className="border-t border-gray-200 my-6"></div>
                  )}
                  <div className="space-y-3">
                    <h3 className="font-bold text-gray-900 text-lg">
                      {item.slidesAffected}
                    </h3>

                    <div className="flex items-start gap-2">
                      <span className="text-lg flex-shrink-0">❌</span>
                      <p className="text-base text-gray-800">
                        <span className="font-semibold">CUT: </span>
                        {item.cutDescription}
                      </p>
                    </div>

                    <div className="flex items-start gap-2">
                      <span className="text-lg flex-shrink-0">✅</span>
                      <p className="text-base text-gray-800">
                        <span className="font-semibold">WHY: </span>
                        {item.whyDescription}
                      </p>
                    </div>

                    <div className="flex items-start gap-2">
                      <span className="text-lg flex-shrink-0">📚</span>
                      <p className="text-base text-gray-800">
                        <span className="font-semibold">PRINCIPLE: </span>
                        {item.principle}
                      </p>
                    </div>

                    <div className="flex items-start gap-2">
                      <span className="text-lg flex-shrink-0">📍</span>
                      <p className="text-base text-gray-800">
                        <span className="font-semibold">LOCATION: </span>
                        {item.location}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleDownloadPDF}
            className="px-8 py-4 bg-[#2563EB] text-white rounded-lg font-semibold text-lg hover:bg-[#1e40af] transition-colors shadow-lg hover:shadow-xl"
          >
            Download PDF
          </button>
          <button
            onClick={handleAnalyzeAnother}
            className="px-8 py-4 bg-white text-[#2563EB] border-2 border-[#2563EB] rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors shadow-lg hover:shadow-xl"
          >
            Analyze Another
          </button>
        </div>
      </main>
    </div>
  );
};

export default Results;
