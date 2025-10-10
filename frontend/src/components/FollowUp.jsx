/**
 * FollowUp.jsx - SlideRx Follow-Up Questions Component
 *
 * Displays AI-generated follow-up questions to refine the presentation summary.
 * Collects user answers and submits them back to the API for refined analysis.
 *
 * Integration Instructions:
 * 1. Import this component in your App.jsx:
 *    import FollowUp from './components/FollowUp';
 *
 * 2. Add to your React Router configuration:
 *    <Route path="/followup/:projectId" element={<FollowUp />} />
 *
 * 3. Navigate from Processing page when reviewAndRefine is detected
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// Mock questions for testing (used if API doesn't return reviewAndRefine)
const mockQuestions = [
  {
    id: "targetAudience",
    type: "select",
    label: "Who is this presentation primarily aimed at?",
    options: ["Hackathon judges", "Team members", "Potential beta testers", "General community"],
    required: true,
    userAnswer: ""
  },
  {
    id: "coreMessage",
    type: "longText",
    label: "What is the key message or takeaway you want the audience to remember?",
    required: true,
    userAnswer: ""
  },
  {
    id: "urgencyLevel",
    type: "select",
    label: "What's the urgency level for your next steps?",
    options: ["Immediate - shipping within days", "This week - building incrementally", "This month - planning phase", "Flexible timeline"],
    required: true,
    userAnswer: ""
  }
];

const FollowUp = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const firstInputRef = useRef(null);

  // API Configuration
  const API_BASE_URL = 'https://f9yntj41f4.execute-api.eu-central-1.amazonaws.com/dev';
  const USER_ID = 'test-user';

  // State management
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [usingMockData, setUsingMockData] = useState(false);

  // Fetch questions on mount
  useEffect(() => {
    if (!projectId) {
      setError('Invalid project ID');
      setLoading(false);
      console.error('No projectId found in URL');
      return;
    }

    const fetchQuestions = async () => {
      try {
        console.log(`Fetching questions for project: ${projectId}`);
        const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
          method: 'GET',
          headers: {
            'x-user-id': USER_ID
          }
        });

        if (!response.ok) {
          throw new Error('Unable to load questions. Please try again.');
        }

        const data = await response.json();
        console.log('API response:', data);

        // Check if reviewAndRefine exists and has questions
        if (data.reviewAndRefine && Array.isArray(data.reviewAndRefine) && data.reviewAndRefine.length > 0) {
          console.log('Using real API questions:', data.reviewAndRefine);
          setQuestions(data.reviewAndRefine);
          setUsingMockData(false);

          // Initialize answers object with existing userAnswers or empty strings
          const initialAnswers = {};
          data.reviewAndRefine.forEach(q => {
            initialAnswers[q.id] = q.userAnswer || '';
          });
          setAnswers(initialAnswers);
        } else {
          // Use mock data if no questions returned
          console.log('No reviewAndRefine found in API response. Using mock data.');
          setQuestions(mockQuestions);
          setUsingMockData(true);

          // Initialize answers object
          const initialAnswers = {};
          mockQuestions.forEach(q => {
            initialAnswers[q.id] = '';
          });
          setAnswers(initialAnswers);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError(err.message || 'Unable to load questions. Please try again.');
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [projectId]);

  // Auto-focus first input field after questions load
  useEffect(() => {
    if (!loading && questions.length > 0 && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [loading, questions]);

  // Handle input changes
  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  // Form validation - check if all required questions are answered
  const isFormValid = () => {
    return questions.every(question => {
      if (question.required) {
        const answer = answers[question.id];
        return answer && answer.trim() !== '';
      }
      return true;
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      setError('Please answer all required questions.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      console.log('Submitting answers:', answers);

      // Build reviewAndRefine array with answers
      const reviewAndRefineWithAnswers = questions.map(q => ({
        id: q.id,
        type: q.type,
        label: q.label,
        options: q.options,
        required: q.required,
        userAnswer: answers[q.id]
      }));

      const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': USER_ID
        },
        body: JSON.stringify({
          reviewAndRefine: reviewAndRefineWithAnswers
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit answers. Please try again.');
      }

      console.log('Answers submitted successfully');

      // Show success message briefly before navigating
      setSuccessMessage('Answers submitted! Refining your summary...');

      // Navigate back to processing page after a brief delay
      setTimeout(() => {
        console.log(`Navigating to /processing/${projectId}`);
        navigate(`/processing/${projectId}`);
      }, 1500);

    } catch (err) {
      console.error('Error submitting answers:', err);
      setError(err.message || 'Failed to submit answers. Please try again.');
      setSubmitting(false);
    }
  };

  // Handle back button
  const handleBack = () => {
    navigate(`/processing/${projectId}`);
  };

  // Handle logout
  const handleLogout = () => {
    // TODO: Implement actual logout logic
    console.log('Logout clicked');
    navigate('/upload');
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
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
          <p className="text-[#64748B]">Loading questions...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <svg className="w-16 h-16 text-[#EF4444] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-[#64748B] mb-6">{error}</p>
            <button
              onClick={() => navigate('/upload')}
              className="px-6 py-2 bg-[#2563EB] text-white rounded-lg hover:bg-[#1e40af] transition-colors font-medium"
            >
              Back to Upload
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success state (shown briefly before navigation)
  if (successMessage) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 text-[#10B981] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-xl font-semibold text-gray-900">{successMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-[800px] mx-auto px-4 sm:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Back Button */}
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-[#64748B] hover:text-[#2563EB] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm font-medium">Back</span>
            </button>

            {/* Logo */}
            <h1 className="text-xl font-bold text-[#2563EB]">SlideRx</h1>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="text-sm text-[#64748B] hover:text-[#2563EB] transition-colors font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[800px] mx-auto px-4 sm:px-8 py-8 sm:py-12">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Our AI has a few more questions
          </h2>
          <p className="text-[#64748B]">
            This will help to tailor your presentation so that it has maximum impact
          </p>
          {usingMockData && (
            <p className="text-xs text-[#EF4444] mt-2">
              Using mock data for testing (API did not return questions)
            </p>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {questions.map((question, index) => (
            <div key={question.id} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              {/* Question Counter */}
              <div className="text-xs font-semibold text-[#2563EB] mb-2">
                Question {index + 1} of {questions.length}
              </div>

              {/* Question Label */}
              <label htmlFor={question.id} className="block text-base font-medium text-gray-900 mb-3">
                {question.label}
                {question.required && <span className="text-[#EF4444] ml-1">*</span>}
              </label>

              {/* Render input based on question type */}
              {question.type === 'select' ? (
                <select
                  id={question.id}
                  ref={index === 0 ? firstInputRef : null}
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  required={question.required}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
                >
                  <option value="">Select an option...</option>
                  {question.options.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : question.type === 'longText' ? (
                <div>
                  <textarea
                    id={question.id}
                    ref={index === 0 ? firstInputRef : null}
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    required={question.required}
                    rows={5}
                    maxLength={500}
                    placeholder="Type your answer here..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all resize-none"
                  />
                  {/* Character Counter */}
                  <div className="text-xs text-[#64748B] mt-2 text-right">
                    {(answers[question.id] || '').length}/500
                  </div>
                </div>
              ) : null}
            </div>
          ))}

          {/* Error Message */}
          {error && (
            <div className="bg-[#FEE2E2] border border-[#EF4444] rounded-lg p-4 flex items-start gap-3">
              <svg className="w-5 h-5 text-[#EF4444] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-[#EF4444]">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isFormValid() || submitting}
            className={`w-full py-4 rounded-lg font-semibold text-white transition-all ${
              !isFormValid() || submitting
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-[#2563EB] hover:bg-[#1e40af] hover:shadow-lg'
            }`}
          >
            {submitting ? 'Submitting...' : 'Submit Answers'}
          </button>

          {/* Helper Text */}
          <p className="text-xs text-[#64748B] text-center">
            Your answers will help us refine your presentation summary
          </p>
        </form>
      </main>
    </div>
  );
};

export default FollowUp;
