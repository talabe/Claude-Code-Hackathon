/**
 * Time utility functions for BBM Planner
 */

/**
 * Converts time string (HH:MM) to total minutes
 * @param {string} timeString - Time in format "HH:MM"
 * @returns {number} Total minutes
 */
export const timeToMinutes = (timeString) => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Calculates duration in hours between two times
 * @param {string} start - Start time in format "HH:MM"
 * @param {string} end - End time in format "HH:MM"
 * @returns {number} Duration in hours
 */
export const calculateDuration = (start, end) => {
  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);
  return (endMinutes - startMinutes) / 60;
};

/**
 * Generates time options in specified intervals
 * @param {number} startHour - Starting hour (default: 6)
 * @param {number} endHour - Ending hour (default: 22)
 * @param {number} interval - Interval in minutes (default: 15)
 * @returns {string[]} Array of time strings
 */
export const generateTimeOptions = (startHour = 6, endHour = 22, interval = 15) => {
  const times = [];
  for (let h = startHour; h <= endHour; h++) {
    for (let m = 0; m < 60; m += interval) {
      if (h === endHour && m > 0) break; // Don't go past end hour
      times.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }
  return times;
};

/**
 * Formats date according to language
 * @param {Date} date - Date to format
 * @param {string} language - Language code ('en', 'he', 'ar')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, language) => {
  const locales = {
    en: 'en-US',
    he: 'he-IL',
    ar: 'ar-SA',
  };
  return date.toLocaleDateString(locales[language] || 'en-US', {
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Gets day of week according to language
 * @param {Date} date - Date to format
 * @param {string} language - Language code ('en', 'he', 'ar')
 * @returns {string} Day of week
 */
export const getDayOfWeek = (date, language) => {
  const locales = {
    en: 'en-US',
    he: 'he-IL',
    ar: 'ar-SA',
  };
  return date.toLocaleDateString(locales[language] || 'en-US', {
    weekday: 'long'
  });
};

/**
 * Checks if a date is today
 * @param {Date} date - Date to check
 * @returns {boolean} True if date is today
 */
export const isToday = (date) => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

/**
 * Validates time format (HH:MM)
 * @param {string} time - Time string to validate
 * @returns {boolean} True if valid
 */
export const isValidTime = (time) => {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
};

/**
 * Checks if two time ranges overlap
 * @param {Object} range1 - First time range {start, end}
 * @param {Object} range2 - Second time range {start, end}
 * @returns {boolean} True if ranges overlap
 */
export const timeRangesOverlap = (range1, range2) => {
  const start1 = timeToMinutes(range1.start);
  const end1 = timeToMinutes(range1.end);
  const start2 = timeToMinutes(range2.start);
  const end2 = timeToMinutes(range2.end);

  return start1 < end2 && end1 > start2;
};
