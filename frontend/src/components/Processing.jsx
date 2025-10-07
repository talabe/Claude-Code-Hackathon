/**
 * Processing.jsx - SlideRx Processing Page Component
 *
 * Displays an engaging loading screen while AI analyzes the uploaded presentation.
 * Shows rotating educational content (presentation quotes and PowerPoint tips)
 * to keep users engaged during the 45-60 second processing time.
 *
 * Integration Instructions:
 * 1. Import this component in your App.jsx:
 *    import Processing from './components/Processing';
 *
 * 2. Add to your React Router configuration:
 *    <Route path="/processing" element={<Processing />} />
 *
 * 3. Navigate to this page after upload form submission
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Content arrays - parsed from markdown files
const CITATIONS = [
  "The most powerful person in the world is the storyteller. - Steve Jobs",
  "If you can't explain it simply, you don't understand it well enough. - Albert Einstein",
  "The audience only pays attention as long as you know where you are going. - Phil Crosby",
  "There are always three speeches for every one you actually gave: the one you practiced, the one you gave, and the one you wish you gave. - Dale Carnegie",
  "Make sure you have finished speaking before your audience has finished listening. - Dorothy Sarnoff",
  "Speak to one, speak to all. - Anonymous",
  "The brain starts working the moment you are born and never stops until you stand up to speak in public. - George Jessel",
  "Tell me and I forget. Teach me and I remember. Involve me and I learn. - Benjamin Franklin",
  "The success of your presentation will be judged not by the knowledge you send but by what the listener receives. - Lilly Walters",
  "Death by PowerPoint is a fate we've all suffered, but it doesn't have to be that way. - David JP Phillips"
];

const PPT_TRICKS = [
  "Press 'B' during a presentation to black out the screen and refocus attention on you",
  "Use the Format Painter (double-click it) to apply formatting to multiple objects quickly",
  "Hold Shift while drawing shapes to create perfect circles and squares",
  "Press Ctrl+D to duplicate selected objects instantly",
  "Use the eyedropper tool to match colors exactly across slides",
  "Align objects perfectly by selecting multiple items and using Align > Distribute",
  "Create custom slide sizes under Design > Slide Size for non-standard formats",
  "Use Selection Pane (Home > Select > Selection Pane) to manage overlapping objects",
  "Embed fonts (File > Options > Save) so your presentation looks the same on any computer",
  "Press Alt+F5 to start presenting from the current slide instead of the beginning"
];

// Helper function to shuffle array
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Prepare and shuffle content outside component to ensure it's ready immediately
const prepareContent = () => {
  const allContent = [
    ...CITATIONS.map(text => ({ text, type: 'citation' })),
    ...PPT_TRICKS.map(text => ({ text, type: 'tip' }))
  ];
  return shuffleArray(allContent);
};

const Processing = () => {
  const navigate = useNavigate();

  // Initialize with shuffled content immediately
  const [shuffledContent] = useState(() => prepareContent());
  const [currentContent, setCurrentContent] = useState(shuffledContent[0]);
  const [contentIndex, setContentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Content rotation logic
  useEffect(() => {
    if (shuffledContent.length === 0) return;

    const rotationInterval = setInterval(() => {
      handleNext();
    }, 8000); // Rotate every 8 seconds

    return () => clearInterval(rotationInterval);
  }, [shuffledContent, contentIndex]);

  // Navigation handlers
  const handleNext = () => {
    setIsVisible(false);
    setTimeout(() => {
      setContentIndex(prevIndex => {
        const nextIndex = (prevIndex + 1) % shuffledContent.length;
        setCurrentContent(shuffledContent[nextIndex]);
        return nextIndex;
      });
      setIsVisible(true);
    }, 300);
  };

  const handlePrevious = () => {
    setIsVisible(false);
    setTimeout(() => {
      setContentIndex(prevIndex => {
        const prevIndexValue = prevIndex === 0 ? shuffledContent.length - 1 : prevIndex - 1;
        setCurrentContent(shuffledContent[prevIndexValue]);
        return prevIndexValue;
      });
      setIsVisible(true);
    }, 300);
  };

  // Mock processing timer - simulates AI analysis
  useEffect(() => {
    const processingDuration = 52000; // 52 seconds (within 50-55 range)

    const processingTimer = setTimeout(() => {
      console.log('=== Processing Complete ===');
      console.log('AI analysis finished. Navigating to results page...');

      // Navigate to results page
      navigate('/results');
    }, processingDuration);

    return () => clearTimeout(processingTimer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header - matches Upload page structure */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-[800px] mx-auto px-4 sm:px-8 py-4">
          <div className="flex items-center justify-center">
            <h1 className="text-xl font-bold text-[#2563EB]">SlideRx</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[800px] mx-auto px-4 sm:px-8 py-8 sm:py-16">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">

          {/* Loading Spinner */}
          <div className="mb-8">
            <svg
              className="w-16 h-16 text-[#2563EB] animate-spin"
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
          </div>

          {/* Status Text */}
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 text-center">
            AI is analyzing your slides
          </h2>
          <p className="text-sm text-[#64748B] mb-12 text-center">
            This can take up to 60 seconds
          </p>

          {/* Rotating Content Box with Navigation */}
          <div className="w-full max-w-[800px] flex items-center gap-4">
            {/* Previous Button */}
            <button
              onClick={handlePrevious}
              className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full shadow-lg hover:shadow-xl hover:bg-[#F8FAFC] transition-all flex items-center justify-center group"
              aria-label="Previous content"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-[#64748B] group-hover:text-[#2563EB] transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Content Box */}
            <div className="flex-1 bg-white rounded-lg shadow-lg p-8 min-h-[200px] flex items-center justify-center">
              <div
                className="transition-opacity duration-300 ease-in-out"
                style={{ opacity: isVisible ? 1 : 0 }}
              >
              {currentContent.type === 'citation' ? (
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">💬</span>
                  <div>
                    <p className="text-sm font-semibold text-[#2563EB] mb-2">Presentation Wisdom:</p>
                    <p className="text-base sm:text-lg text-gray-800 italic leading-relaxed">
                      {currentContent.text}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">💡</span>
                  <div>
                    <p className="text-sm font-semibold text-[#2563EB] mb-2">PowerPoint Pro Tip:</p>
                    <p className="text-base sm:text-lg text-gray-800 leading-relaxed">
                      {currentContent.text}
                    </p>
                  </div>
                </div>
              )}
              </div>
            </div>

            {/* Next Button */}
            <button
              onClick={handleNext}
              className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full shadow-lg hover:shadow-xl hover:bg-[#F8FAFC] transition-all flex items-center justify-center group"
              aria-label="Next content"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-[#64748B] group-hover:text-[#2563EB] transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Progress Indicator Dots (optional visual enhancement) */}
          <div className="flex gap-2 mt-8">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-500 ${
                  i === contentIndex % 5
                    ? 'bg-[#2563EB] w-8'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Processing;
