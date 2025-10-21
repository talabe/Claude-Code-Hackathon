/**
 * Constants for BBM Planner
 */

// Calendar Configuration
export const CALENDAR_CONFIG = {
  START_HOUR: 6,
  END_HOUR: 22,
  HOUR_HEIGHT_PX: 80,
  TASK_BORDER_WIDTH: 4,
  SLOT_INTERVALS: 15, // minutes
  MAX_TASK_DURATION_HOURS: 12,
};

// Color Palette (20+ colors)
export const COLOR_PALETTE = [
  { name: 'Peach', hex: '#F4A261' },
  { name: 'Teal', hex: '#2A9D8F' },
  { name: 'Sky Blue', hex: '#A8DADC' },
  { name: 'Lavender', hex: '#9D8DF1' },
  { name: 'Pink', hex: '#F2A8B8' },
  { name: 'Coral', hex: '#FF6B6B' },
  { name: 'Mint', hex: '#95E1D3' },
  { name: 'Lemon', hex: '#F9ED69' },
  { name: 'Lilac', hex: '#C5A3FF' },
  { name: 'Rose', hex: '#FF9AA2' },
  { name: 'Sage', hex: '#B5EAD7' },
  { name: 'Apricot', hex: '#FFD3B6' },
  { name: 'Periwinkle', hex: '#B4A7D6' },
  { name: 'Cream', hex: '#FFDAC1' },
  { name: 'Aqua', hex: '#9AECDB' },
  { name: 'Mauve', hex: '#DDA4E0' },
  { name: 'Vanilla', hex: '#FFF9E6' },
  { name: 'Ocean', hex: '#5DADE2' },
  { name: 'Sunset', hex: '#F8B500' },
  { name: 'Plum', hex: '#B39BC8' }
];

// Task Categories
export const CATEGORIES = {
  WORK: {
    id: 'work',
    labelKey: 'work',
    color: '#2A9D8F'
  },
  PERSONAL: {
    id: 'personal',
    labelKey: 'personal',
    color: '#F4A261'
  },
  SPORTS: {
    id: 'sports',
    labelKey: 'sports',
    color: '#95E1D3'
  },
  STUDY: {
    id: 'study',
    labelKey: 'study',
    color: '#9D8DF1'
  },
  HEALTH: {
    id: 'health',
    labelKey: 'health',
    color: '#F2A8B8'
  }
};

// Repeat Options
export const REPEAT_OPTIONS = {
  NONE: 'none',
  DAILY: 'daily',
  WEEKLY: 'weekly'
};

// Screens
export const SCREENS = {
  HOME: 'home',
  PLANNER: 'planner',
  INSPIRE: 'inspire',
  RELAX: 'relax',
  MOOD: 'mood',
  JOURNAL: 'journal'
};

// View Modes
export const VIEW_MODES = {
  DAY: 'day',
  WEEK: 'week'
};

// Supported Languages
export const LANGUAGES = {
  ENGLISH: 'en',
  HEBREW: 'he',
  ARABIC: 'ar'
};

// RTL Languages
export const RTL_LANGUAGES = [LANGUAGES.HEBREW, LANGUAGES.ARABIC];

// Inspiration Cards (backgrounds)
export const INSPIRATION_BACKGROUNDS = [
  { bg: "from-orange-50 to-pink-100", card: "from-pink-100 to-pink-200" },
  { bg: "from-pink-50 to-orange-100", card: "from-orange-100 to-yellow-100" },
  { bg: "from-yellow-50 to-pink-100", card: "from-pink-100 to-pink-200" },
  { bg: "from-pink-50 to-yellow-100", card: "from-yellow-100 to-orange-100" },
  { bg: "from-orange-50 to-pink-100", card: "from-pink-100 to-orange-100" }
];

// Relaxation Options
export const RELAXATION_OPTIONS = [
  {
    icon: '🌟',
    titleKey: 'deepBreathing',
    color: 'from-orange-50 to-orange-100'
  },
  {
    icon: '🕯️',
    titleKey: 'candleBreathing',
    color: 'from-blue-50 to-blue-100'
  },
  {
    icon: '💎',
    titleKey: 'concentration',
    color: 'from-teal-50 to-teal-100'
  },
  {
    icon: '🌙',
    titleKey: 'relaxMeditation',
    color: 'from-purple-50 to-purple-100'
  }
];

// Default Task Values
export const DEFAULT_TASK = {
  startTime: '09:00',
  endTime: '10:00',
  category: 'personal',
  repeat: 'none',
  color: '#F4A261',
  done: false
};

// Default Values
export const DEFAULTS = {
  LANGUAGE: LANGUAGES.ENGLISH,
  CUSTOM_COLOR: '#A8DADC',
  VIEW_MODE: VIEW_MODES.DAY
};
