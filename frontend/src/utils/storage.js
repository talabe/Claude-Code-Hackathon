/**
 * Local storage utilities for BBM Planner
 * Provides safe localStorage access with error handling
 */

const STORAGE_KEYS = {
  TASKS: 'bbm-tasks',
  JOURNAL: 'bbm-journal',
  LANGUAGE: 'bbm-language',
  MOOD_HISTORY: 'bbm-mood-history',
  CUSTOM_COLOR: 'bbm-custom-color',
  THEME: 'bbm-theme',
};

/**
 * Safely get item from localStorage
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key doesn't exist or error occurs
 * @returns {*} Stored value or default
 */
export const getFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return defaultValue;
  }
};

/**
 * Safely set item in localStorage
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 * @returns {boolean} True if successful
 */
export const setInStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage (${key}):`, error);
    return false;
  }
};

/**
 * Remove item from localStorage
 * @param {string} key - Storage key
 * @returns {boolean} True if successful
 */
export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage (${key}):`, error);
    return false;
  }
};

/**
 * Clear all BBM Planner data from localStorage
 * @returns {boolean} True if successful
 */
export const clearAllStorage = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
};

// Specific storage functions for BBM Planner

export const loadTasks = () => getFromStorage(STORAGE_KEYS.TASKS, []);
export const saveTasks = (tasks) => setInStorage(STORAGE_KEYS.TASKS, tasks);

export const loadJournal = () => getFromStorage(STORAGE_KEYS.JOURNAL, '');
export const saveJournal = (entry) => setInStorage(STORAGE_KEYS.JOURNAL, entry);

export const loadLanguage = () => getFromStorage(STORAGE_KEYS.LANGUAGE, 'en');
export const saveLanguage = (lang) => setInStorage(STORAGE_KEYS.LANGUAGE, lang);

export const loadMoodHistory = () => getFromStorage(STORAGE_KEYS.MOOD_HISTORY, []);
export const saveMoodHistory = (history) => setInStorage(STORAGE_KEYS.MOOD_HISTORY, history);

export const loadCustomColor = () => getFromStorage(STORAGE_KEYS.CUSTOM_COLOR, '#A8DADC');
export const saveCustomColor = (color) => setInStorage(STORAGE_KEYS.CUSTOM_COLOR, color);

export { STORAGE_KEYS };
