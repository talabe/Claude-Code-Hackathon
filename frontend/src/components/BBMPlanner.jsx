import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Calendar, Heart, Sparkles, Wind, BookOpen, Plus, Check, X, ChevronLeft, ChevronRight, Globe, Briefcase, User, Dumbbell, GraduationCap, Activity, Repeat, Palette } from 'lucide-react';

// Utilities
import { calculateDuration, generateTimeOptions, formatDate, getDayOfWeek, isToday } from '../utils/timeUtils';
import { loadTasks, saveTasks, loadJournal, saveJournal, loadLanguage, saveLanguage, loadCustomColor, saveCustomColor } from '../utils/storage';
import { sanitizeInput, validateTask, checkTaskOverlap, validateTaskBounds } from '../utils/validation';

// Constants
import { CALENDAR_CONFIG, COLOR_PALETTE, CATEGORIES, REPEAT_OPTIONS, SCREENS, VIEW_MODES, RELAXATION_OPTIONS, INSPIRATION_BACKGROUNDS, DEFAULT_TASK, DEFAULTS, RTL_LANGUAGES } from '../constants/bbmConstants';
import { translations } from '../constants/translations';

const BBMPlanner = () => {
  // Core state
  const [currentScreen, setCurrentScreen] = useState(SCREENS.HOME);
  const [viewMode, setViewMode] = useState(DEFAULTS.VIEW_MODE);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Language and UI
  const [language, setLanguage] = useState(() => loadLanguage());
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [customColor, setCustomColor] = useState(() => loadCustomColor());

  // Tasks
  const [tasks, setTasks] = useState(() => loadTasks());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [newTaskText, setNewTaskText] = useState('');
  const [selectedColor, setSelectedColor] = useState(DEFAULT_TASK.color);
  const [selectedStartTime, setSelectedStartTime] = useState(DEFAULT_TASK.startTime);
  const [selectedEndTime, setSelectedEndTime] = useState(DEFAULT_TASK.endTime);
  const [selectedCategory, setSelectedCategory] = useState(DEFAULT_TASK.category);
  const [selectedRepeat, setSelectedRepeat] = useState(DEFAULT_TASK.repeat);
  const [draggedTask, setDraggedTask] = useState(null);

  // Other features
  const [currentCard, setCurrentCard] = useState(0);
  const [mood, setMood] = useState(null);
  const [journalEntry, setJournalEntry] = useState(() => loadJournal());

  // Error handling
  const [error, setError] = useState(null);

  // Memoized values
  const t = useMemo(() => translations[language], [language]);
  const isRTL = useMemo(() => RTL_LANGUAGES.includes(language), [language]);
  const hours = useMemo(() => Array.from({ length: CALENDAR_CONFIG.END_HOUR - CALENDAR_CONFIG.START_HOUR + 1 }, (_, i) => i + CALENDAR_CONFIG.START_HOUR), []);
  const timeOptions = useMemo(() => generateTimeOptions(), []);
  const days = useMemo(() => t.days, [t.days]);

  // Categories with icons
  const categories = useMemo(() => [
    { ...CATEGORIES.WORK, label: t.work, icon: Briefcase },
    { ...CATEGORIES.PERSONAL, label: t.personal, icon: User },
    { ...CATEGORIES.SPORTS, label: t.sports, icon: Dumbbell },
    { ...CATEGORIES.STUDY, label: t.study, icon: GraduationCap },
    { ...CATEGORIES.HEALTH, label: t.health, icon: Activity }
  ], [t]);

  const inspirationCards = useMemo(() =>
    t.quotes.map((quote, idx) => ({
      quote,
      ...INSPIRATION_BACKGROUNDS[idx % INSPIRATION_BACKGROUNDS.length]
    })),
    [t.quotes]
  );

  const moods = useMemo(() => [
    { emoji: '☀️', label: t.happy, color: 'bg-orange-100', count: 7 },
    { emoji: '😊', label: t.calm, color: 'bg-teal-100', count: 16 },
    { emoji: '✓', label: t.productive, color: 'bg-green-100', count: 12 }
  ], [t]);

  const relaxationOptions = useMemo(() =>
    RELAXATION_OPTIONS.map(opt => ({
      ...opt,
      title: t[opt.titleKey]
    })),
    [t]
  );

  // Persist tasks to localStorage
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  // Persist language preference
  useEffect(() => {
    saveLanguage(language);
  }, [language]);

  // Persist custom color
  useEffect(() => {
    saveCustomColor(customColor);
  }, [customColor]);

  // Persist journal entry (debounced)
  useEffect(() => {
    const timeout = setTimeout(() => {
      saveJournal(journalEntry);
    }, 1000); // Debounce 1 second

    return () => clearTimeout(timeout);
  }, [journalEntry]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (selectedSlot) {
          closeModal();
        }
        if (showLanguageMenu) {
          setShowLanguageMenu(false);
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [selectedSlot, showLanguageMenu]);

  // Close modal helper
  const closeModal = useCallback(() => {
    setSelectedSlot(null);
    setEditingTask(null);
    setNewTaskText('');
    setSelectedStartTime(DEFAULT_TASK.startTime);
    setSelectedEndTime(DEFAULT_TASK.endTime);
    setSelectedCategory(DEFAULT_TASK.category);
    setSelectedRepeat(DEFAULT_TASK.repeat);
    setSelectedColor(DEFAULT_TASK.color);
    setShowColorPicker(false);
    setError(null);
  }, []);

  // Add or update task
  const addTask = useCallback((day, hour) => {
    const sanitizedText = sanitizeInput(newTaskText);

    if (!sanitizedText) {
      setError(t.errors.taskRequired);
      return;
    }

    const duration = calculateDuration(selectedStartTime, selectedEndTime);

    if (duration <= 0) {
      setError(t.errors.endBeforeStart);
      return;
    }

    const newTask = {
      id: editingTask ? editingTask.id : Date.now(),
      day,
      startTime: selectedStartTime,
      endTime: selectedEndTime,
      duration,
      text: sanitizedText,
      done: editingTask ? editingTask.done : false,
      color: selectedColor,
      category: selectedCategory,
      repeat: selectedRepeat
    };

    // Validate task
    const validation = validateTask(newTask);
    if (!validation.isValid) {
      setError(validation.errors[0]);
      return;
    }

    // Check bounds
    const boundsCheck = validateTaskBounds(selectedStartTime, selectedEndTime);
    if (!boundsCheck.isValid) {
      setError(boundsCheck.error);
      return;
    }

    // Check overlap (exclude current task if editing)
    const overlapCheck = checkTaskOverlap(newTask, tasks, editingTask?.id);
    if (overlapCheck.hasOverlap) {
      setError(t.errors.taskOverlap);
      return;
    }

    // Add or update task
    if (editingTask) {
      setTasks(tasks.map(task => task.id === editingTask.id ? newTask : task));
    } else {
      setTasks([...tasks, newTask]);
    }

    closeModal();
  }, [newTaskText, selectedStartTime, selectedEndTime, selectedColor, selectedCategory, selectedRepeat, editingTask, tasks, t.errors, closeModal]);

  // Toggle task completion
  const toggleTask = useCallback((id) => {
    setTasks(prevTasks => prevTasks.map(task =>
      task.id === id ? { ...task, done: !task.done } : task
    ));
  }, []);

  // Delete task with confirmation
  const deleteTask = useCallback((id) => {
    if (window.confirm(t.confirmDelete)) {
      setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
    }
  }, [t.confirmDelete]);

  // Get tasks for a specific slot
  const getTasksForSlot = useCallback((day, hour) => {
    return tasks.filter(task => {
      if (task.day !== day) return false;
      if (task.startTime) {
        const [startHour] = task.startTime.split(':').map(Number);
        return startHour === hour;
      }
      return task.hour === hour;
    });
  }, [tasks]);

  // Drag and drop handlers
  const handleDragStart = useCallback((e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e, day, hour) => {
    e.preventDefault();
    if (!draggedTask) return;

    const [oldStartHour, startMinutes] = draggedTask.startTime.split(':').map(Number);
    const [oldEndHour, endMinutes] = draggedTask.endTime.split(':').map(Number);

    const hourDiff = hour - oldStartHour;
    const newStartHour = hour;
    const newEndHour = oldEndHour + hourDiff;

    // Validate bounds
    if (newEndHour > CALENDAR_CONFIG.END_HOUR) {
      alert(t.errors.taskOutOfBounds);
      setDraggedTask(null);
      return;
    }

    const newStartTime = `${String(newStartHour).padStart(2, '0')}:${String(startMinutes).padStart(2, '0')}`;
    const newEndTime = `${String(newEndHour).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;

    const updatedTask = {
      ...draggedTask,
      day,
      startTime: newStartTime,
      endTime: newEndTime
    };

    // Check overlap
    const overlapCheck = checkTaskOverlap(updatedTask, tasks, draggedTask.id);
    if (overlapCheck.hasOverlap) {
      alert(t.errors.taskOverlap);
      setDraggedTask(null);
      return;
    }

    setTasks(prevTasks => prevTasks.map(task =>
      task.id === draggedTask.id ? updatedTask : task
    ));

    setDraggedTask(null);
  }, [draggedTask, tasks, t.errors]);

  // Date navigation
  const changeDate = useCallback((direction) => {
    const newDate = new Date(currentDate);
    if (viewMode === VIEW_MODES.DAY) {
      newDate.setDate(newDate.getDate() + direction);
    } else {
      newDate.setDate(newDate.getDate() + (direction * 7));
    }
    setCurrentDate(newDate);
  }, [currentDate, viewMode]);

  // Open modal for new task
  const openNewTaskModal = useCallback((day, hour) => {
    setSelectedSlot({ day, hour });
    setEditingTask(null);
    const startTime = `${String(hour).padStart(2, '0')}:00`;
    const endTime = `${String(hour + 1).padStart(2, '0')}:00`;
    setSelectedStartTime(startTime);
    setSelectedEndTime(endTime);
    setError(null);
  }, []);

  // Open modal for editing task
  const openEditTaskModal = useCallback((task) => {
    setSelectedSlot({ day: task.day, hour: parseInt(task.startTime.split(':')[0]) });
    setEditingTask(task);
    setNewTaskText(task.text);
    setSelectedStartTime(task.startTime);
    setSelectedEndTime(task.endTime);
    setSelectedCategory(task.category);
    setSelectedRepeat(task.repeat);
    setSelectedColor(task.color);
    setError(null);
  }, []);

  // Calculate task style for positioning
  const getTaskStyle = useCallback((task) => {
    const [startH, startM] = task.startTime.split(':').map(Number);
    const startMinutes = (startH - CALENDAR_CONFIG.START_HOUR) * 60 + startM;
    const top = (startMinutes / 60) * CALENDAR_CONFIG.HOUR_HEIGHT_PX;

    const durationMinutes = task.duration * 60;
    const height = (durationMinutes / 60) * CALENDAR_CONFIG.HOUR_HEIGHT_PX;

    return {
      position: 'absolute',
      top: `${top}px`,
      height: `${height - CALENDAR_CONFIG.TASK_BORDER_WIDTH}px`,
      left: '4px',
      right: '4px',
      zIndex: 20
    };
  }, []);

  // Components
  const LanguageSelector = () => (
    <div className="relative">
      <button
        onClick={() => setShowLanguageMenu(!showLanguageMenu)}
        className="flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-lg hover:scale-105 transition-transform"
        aria-label="Select language"
        aria-expanded={showLanguageMenu}
      >
        <Globe size={20} className="text-gray-600" aria-hidden="true" />
        <span className="text-sm font-medium text-gray-700">
          {language === 'en' ? 'EN' : language === 'he' ? 'עב' : 'ع'}
        </span>
      </button>

      {showLanguageMenu && (
        <div className="absolute top-12 left-0 bg-white rounded-2xl shadow-2xl p-2 z-50 min-w-[150px]" role="menu">
          <button
            onClick={() => { setLanguage('en'); setShowLanguageMenu(false); }}
            className={`w-full text-left px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors ${language === 'en' ? 'bg-teal-50 font-semibold' : ''}`}
            role="menuitem"
          >
            English
          </button>
          <button
            onClick={() => { setLanguage('he'); setShowLanguageMenu(false); }}
            className={`w-full text-right px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors ${language === 'he' ? 'bg-teal-50 font-semibold' : ''}`}
            role="menuitem"
          >
            עברית
          </button>
          <button
            onClick={() => { setLanguage('ar'); setShowLanguageMenu(false); }}
            className={`w-full text-right px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors ${language === 'ar' ? 'bg-teal-50 font-semibold' : ''}`}
            role="menuitem"
          >
            العربية
          </button>
        </div>
      )}
    </div>
  );

  const NavBar = () => (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur shadow-lg rounded-t-3xl p-4 z-50" role="navigation" aria-label="Main navigation">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {[
          { icon: Calendar, label: t.planner, screen: SCREENS.PLANNER },
          { icon: Sparkles, label: t.inspire, screen: SCREENS.INSPIRE },
          { icon: Wind, label: t.relax, screen: SCREENS.RELAX },
          { icon: Heart, label: t.mood, screen: SCREENS.MOOD },
          { icon: BookOpen, label: t.journal, screen: SCREENS.JOURNAL }
        ].map(({ icon: Icon, label, screen }) => (
          <button
            key={screen}
            onClick={() => setCurrentScreen(screen)}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
              currentScreen === screen
                ? 'bg-gradient-to-br from-teal-100 to-blue-100 scale-110'
                : 'hover:bg-gray-50'
            }`}
            aria-label={label}
            aria-current={currentScreen === screen ? 'page' : undefined}
          >
            <Icon size={20} className={currentScreen === screen ? 'text-teal-600' : 'text-gray-400'} aria-hidden="true" />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );

  const TaskModal = () => {
    if (!selectedSlot) return null;

    return (
      <div
        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
        onClick={closeModal}
        role="dialog"
        aria-labelledby="modal-title"
        aria-modal="true"
      >
        <div
          className={`bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl max-h-[85vh] overflow-y-auto ${isRTL ? 'text-right' : 'text-left'}`}
          dir={isRTL ? 'rtl' : 'ltr'}
          onClick={(e) => e.stopPropagation()}
          style={{ scrollbarWidth: 'thin' }}
        >
          <h3 id="modal-title" className="text-xl font-bold text-gray-700 mb-4">
            {editingTask ? t.editTask : t.addTask}
          </h3>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="text-sm text-gray-600 mb-2 block" htmlFor="task-description">
              {t.taskDesc}
            </label>
            <input
              id="task-description"
              type="text"
              placeholder={t.taskPlaceholder}
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTask(selectedSlot.day, selectedSlot.hour)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-200"
              autoFocus
              maxLength={200}
            />
          </div>

          <div className="mb-4">
            <label className="text-sm text-gray-600 mb-2 block" htmlFor="start-time">
              {t.startTime}
            </label>
            <select
              id="start-time"
              value={selectedStartTime}
              onChange={(e) => setSelectedStartTime(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-200"
            >
              {timeOptions.map(time => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="text-sm text-gray-600 mb-2 block" htmlFor="end-time">
              {t.endTime}
            </label>
            <select
              id="end-time"
              value={selectedEndTime}
              onChange={(e) => setSelectedEndTime(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-200"
            >
              {timeOptions.map(time => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {t.duration}: {calculateDuration(selectedStartTime, selectedEndTime).toFixed(2)} {t.hours}
            </p>
          </div>

          <div className="mb-4">
            <label className="text-sm text-gray-600 mb-2 block">{t.category}</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setSelectedColor(cat.color);
                    }}
                    className={`rounded-xl p-3 flex flex-col items-center gap-2 transition-all hover:scale-105 ${
                      selectedCategory === cat.id ? 'ring-4 ring-gray-600 scale-105' : ''
                    }`}
                    style={{ backgroundColor: cat.color + '66' }}
                    aria-label={cat.label}
                    aria-pressed={selectedCategory === cat.id}
                  >
                    <Icon size={20} className="text-gray-700" aria-hidden="true" />
                    <span className="text-xs font-medium text-gray-700">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-gray-600">{t.color}</label>
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="text-xs text-teal-600 hover:text-teal-700 flex items-center gap-1"
                aria-label={t.customColor}
                aria-expanded={showColorPicker}
              >
                <Palette size={14} aria-hidden="true" />
                {t.customColor}
              </button>
            </div>

            {showColorPicker && (
              <div className="mb-3 p-3 border-2 border-gray-200 rounded-2xl">
                <label htmlFor="custom-color" className="sr-only">{t.customColor}</label>
                <input
                  id="custom-color"
                  type="color"
                  value={customColor}
                  onChange={(e) => {
                    setCustomColor(e.target.value);
                    setSelectedColor(e.target.value);
                  }}
                  className="w-full h-12 rounded-xl cursor-pointer"
                />
                <p className="text-xs text-gray-500 mt-2 text-center">{customColor}</p>
              </div>
            )}

            <div className="grid grid-cols-5 gap-2">
              {COLOR_PALETTE.map((color) => (
                <button
                  key={color.hex}
                  onClick={() => setSelectedColor(color.hex)}
                  className={`w-full h-12 rounded-xl transition-all hover:scale-110 ${
                    selectedColor === color.hex ? 'ring-4 ring-gray-600 scale-110' : ''
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                  aria-label={color.name}
                  aria-pressed={selectedColor === color.hex}
                />
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="text-sm text-gray-600 mb-2 block">{t.repeat}</label>
            <div className="flex gap-2">
              {[
                { value: REPEAT_OPTIONS.NONE, label: t.repeatNone },
                { value: REPEAT_OPTIONS.DAILY, label: t.repeatDaily },
                { value: REPEAT_OPTIONS.WEEKLY, label: t.repeatWeekly }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedRepeat(option.value)}
                  className={`flex-1 px-4 py-2 rounded-xl font-medium transition-all ${
                    selectedRepeat === option.value
                      ? 'bg-teal-200 text-gray-700'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                  aria-label={option.label}
                  aria-pressed={selectedRepeat === option.value}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={closeModal}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-600 rounded-2xl font-semibold hover:bg-gray-200 transition-colors"
            >
              {t.cancel}
            </button>
            <button
              onClick={() => addTask(selectedSlot.day, selectedSlot.hour)}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-200 to-teal-200 text-gray-700 rounded-2xl font-semibold hover:scale-105 transition-transform"
            >
              {editingTask ? t.update : t.add}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Screens
  const HomeScreen = () => (
    <div className={`min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-teal-50 flex flex-col items-center justify-center p-6 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="absolute top-6 left-6">
        <LanguageSelector />
      </div>
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-6xl font-bold text-gray-700">
          {t.appName}
        </h1>
        <p className="text-lg text-gray-600">
          {t.tagline}
        </p>
        <div className="bg-white/70 backdrop-blur rounded-3xl p-8 shadow-xl">
          <p className="text-gray-600 mb-2">{t.welcome} ✨</p>
          <p className="text-sm text-gray-500">
            {t.welcomeMsg}
          </p>
        </div>
        <button
          onClick={() => setCurrentScreen(SCREENS.PLANNER)}
          className="bg-gradient-to-r from-orange-200 to-orange-100 text-gray-700 font-semibold px-10 py-4 rounded-full shadow-lg hover:scale-105 transition-transform"
        >
          {t.start}
        </button>
      </div>
    </div>
  );

  const PlannerScreen = () => (
    <div className={`min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-50 pb-24 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-white/80 backdrop-blur shadow-md p-4 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <button
                onClick={() => changeDate(-1)}
                className="p-2 hover:bg-orange-50 rounded-lg transition-colors"
                aria-label="Previous day"
              >
                {isRTL ? <ChevronRight size={20} className="text-gray-600" /> : <ChevronLeft size={20} className="text-gray-600" />}
              </button>
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-700">
                  {isToday(currentDate) ? t.today : getDayOfWeek(currentDate, language)}, {formatDate(currentDate, language)}
                </h2>
              </div>
              <button
                onClick={() => changeDate(1)}
                className="p-2 hover:bg-orange-50 rounded-lg transition-colors"
                aria-label="Next day"
              >
                {isRTL ? <ChevronLeft size={20} className="text-gray-600" /> : <ChevronRight size={20} className="text-gray-600" />}
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setViewMode(VIEW_MODES.DAY)}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  viewMode === VIEW_MODES.DAY
                    ? 'bg-orange-200 text-gray-700'
                    : 'bg-gray-100 text-gray-500'
                }`}
                aria-pressed={viewMode === VIEW_MODES.DAY}
              >
                {t.daily}
              </button>
              <button
                onClick={() => setViewMode(VIEW_MODES.WEEK)}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  viewMode === VIEW_MODES.WEEK
                    ? 'bg-orange-200 text-gray-700'
                    : 'bg-gray-100 text-gray-500'
                }`}
                aria-pressed={viewMode === VIEW_MODES.WEEK}
              >
                {t.weekly}
              </button>
              <LanguageSelector />
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-6xl mx-auto overflow-x-auto">
        <div className="bg-white/70 backdrop-blur rounded-3xl shadow-xl overflow-hidden">
          {viewMode === VIEW_MODES.DAY ? (
            <div className="min-w-[400px]">
              <div className="flex">
                <div className="w-20 flex-shrink-0"></div>
                <div className="flex-1 border-l border-gray-200">
                  <div className="h-12 border-b border-gray-200 flex items-center justify-center font-semibold text-gray-600">
                    {getDayOfWeek(currentDate, language)}
                  </div>
                </div>
              </div>

              <div className="relative">
                {hours.map((hour) => (
                  <div key={hour} className="flex border-b border-gray-200" style={{ height: `${CALENDAR_CONFIG.HOUR_HEIGHT_PX}px` }}>
                    <div className="w-20 flex-shrink-0 p-2 text-sm text-gray-500 font-medium">
                      {hour}:00
                    </div>
                    <div
                      onClick={() => openNewTaskModal(0, hour)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, 0, hour)}
                      className="flex-1 border-l border-gray-200 cursor-pointer hover:bg-orange-50/30 transition-colors relative"
                    ></div>
                  </div>
                ))}

                {/* Render tasks as overlays */}
                {tasks.filter(t => t.day === 0 && t.startTime).map(task => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task)}
                    onDoubleClick={() => openEditTaskModal(task)}
                    style={getTaskStyle(task)}
                    className={`rounded-xl p-3 shadow-lg border-l-4 cursor-move ${
                      task.done ? 'opacity-60' : ''
                    }`}
                    role="button"
                    tabIndex={0}
                    aria-label={`Task: ${task.text}`}
                  >
                    <div
                      className="h-full rounded-lg p-2"
                      style={{
                        backgroundColor: task.color + 'CC',
                        borderLeft: `4px solid ${task.color}`
                      }}
                    >
                      <div className="flex items-start gap-2 h-full">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTask(task.id);
                          }}
                          className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 bg-white ${
                            task.done ? 'border-gray-500' : 'border-white'
                          }`}
                          aria-label={task.done ? 'Mark as incomplete' : 'Mark as complete'}
                          aria-pressed={task.done}
                        >
                          {task.done && <Check size={14} className="text-gray-700" aria-hidden="true" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold text-gray-800 truncate ${
                            task.done ? 'line-through' : ''
                          }`}>
                            {task.text}
                          </p>
                          <p className="text-xs text-gray-700 mt-0.5">
                            {task.startTime} - {task.endTime}
                          </p>
                          {task.repeat !== REPEAT_OPTIONS.NONE && (
                            <span className="inline-flex items-center gap-1 text-xs text-gray-700 mt-1">
                              <Repeat size={10} aria-hidden="true" />
                              {task.repeat === REPEAT_OPTIONS.DAILY ? t.repeatDaily : t.repeatWeekly}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTask(task.id);
                          }}
                          className="text-gray-700 hover:text-red-600 transition-colors"
                          aria-label="Delete task"
                        >
                          <X size={16} aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="min-w-[800px]">
              <div className="flex">
                <div className="w-20 flex-shrink-0"></div>
                {days.map((day) => (
                  <div
                    key={day}
                    className="flex-1 border-l border-gray-200 h-12 flex items-center justify-center font-semibold text-gray-600"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {hours.map((hour) => (
                <div key={hour} className="flex border-b border-gray-200" style={{ minHeight: '60px' }}>
                  <div className="w-20 flex-shrink-0 p-2 text-sm text-gray-500 font-medium">
                    {hour}:00
                  </div>
                  {days.map((day, dayIdx) => (
                    <div
                      key={dayIdx}
                      onClick={() => openNewTaskModal(dayIdx, hour)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, dayIdx, hour)}
                      className="flex-1 border-l border-gray-200 p-1 cursor-pointer hover:bg-orange-50/50 transition-colors"
                    >
                      {getTasksForSlot(dayIdx, hour).map(task => (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task)}
                          onDoubleClick={() => openEditTaskModal(task)}
                          className="rounded-lg p-2 mb-1 shadow-sm text-xs border-l-2 cursor-move"
                          style={{
                            backgroundColor: task.color + 'CC',
                            borderLeftColor: task.color,
                            minHeight: `${task.duration * 60}px`
                          }}
                          role="button"
                          tabIndex={0}
                          aria-label={`Task: ${task.text}`}
                        >
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleTask(task.id);
                              }}
                              className="w-3 h-3 rounded border bg-white flex items-center justify-center flex-shrink-0"
                              aria-label={task.done ? 'Mark as incomplete' : 'Mark as complete'}
                            >
                              {task.done && <Check size={8} aria-hidden="true" />}
                            </button>
                            <span className={`flex-1 truncate font-medium text-gray-800 ${
                              task.done ? 'line-through' : ''
                            }`}>
                              {task.text}
                            </span>
                            {task.repeat !== REPEAT_OPTIONS.NONE && <Repeat size={10} className="text-gray-700" aria-hidden="true" />}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteTask(task.id);
                              }}
                              className="text-gray-700 hover:text-red-600"
                              aria-label="Delete task"
                            >
                              <X size={10} aria-hidden="true" />
                            </button>
                          </div>
                          <div className="text-[10px] text-gray-700 mt-0.5">
                            {task.startTime}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => openNewTaskModal(0, 9)}
          className={`fixed bottom-24 ${isRTL ? 'left-6' : 'right-6'} bg-gradient-to-br from-orange-200 to-orange-300 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform z-40`}
          aria-label={t.addTask}
        >
          <Plus size={24} aria-hidden="true" />
        </button>
      </div>

      <TaskModal />
    </div>
  );

  const InspireScreen = () => (
    <div className={`min-h-screen bg-gradient-to-br ${inspirationCards[currentCard].bg} p-6 pb-24 flex flex-col items-center justify-center ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="absolute top-6 left-6">
        <LanguageSelector />
      </div>
      <h2 className="text-3xl font-bold text-gray-700 mb-8">{t.dailyInspiration}</h2>

      <div className={`bg-gradient-to-br ${inspirationCards[currentCard].card} rounded-3xl p-12 shadow-2xl max-w-md w-full text-center`} role="region" aria-label="Inspiration card">
        <Sparkles className="mx-auto mb-6 text-pink-400" size={48} aria-hidden="true" />
        <p className="text-2xl font-bold text-gray-700 leading-relaxed">
          {inspirationCards[currentCard].quote}
        </p>
      </div>

      <div className="flex gap-4 mt-8">
        <button
          onClick={() => setCurrentCard((currentCard - 1 + inspirationCards.length) % inspirationCards.length)}
          className="bg-white/80 backdrop-blur px-6 py-3 rounded-full shadow-lg hover:scale-105 transition-transform font-semibold text-gray-700"
          aria-label={t.previous}
        >
          {isRTL ? `${t.next} ←` : `← ${t.previous}`}
        </button>
        <button
          onClick={() => setCurrentCard((currentCard + 1) % inspirationCards.length)}
          className="bg-white/80 backdrop-blur px-6 py-3 rounded-full shadow-lg hover:scale-105 transition-transform font-semibold text-gray-700"
          aria-label={t.next}
        >
          {isRTL ? `→ ${t.previous}` : `${t.next} →`}
        </button>
      </div>
    </div>
  );

  const RelaxScreen = () => (
    <div className={`min-h-screen bg-gradient-to-br from-blue-100 via-teal-50 to-blue-50 p-6 pb-24 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="absolute top-6 left-6">
        <LanguageSelector />
      </div>
      <h2 className="text-3xl font-bold text-gray-700 mb-8 text-center">{t.relaxationZone}</h2>

      <div className="max-w-md mx-auto space-y-4">
        {relaxationOptions.map((option, idx) => (
          <button
            key={idx}
            className={`w-full bg-gradient-to-r ${option.color} backdrop-blur rounded-3xl p-6 shadow-lg hover:scale-105 transition-transform flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}
            aria-label={option.title}
          >
            <div className="text-4xl" aria-hidden="true">{option.icon}</div>
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <h3 className="text-lg font-bold text-gray-700">{option.title}</h3>
            </div>
          </button>
        ))}
      </div>

      <div className="max-w-md mx-auto mt-8 bg-white/70 backdrop-blur rounded-3xl p-6 shadow-lg text-center">
        <p className="text-sm text-gray-600 italic">
          {t.relaxMsg} 🌙
        </p>
        <button className="mt-4 bg-gradient-to-r from-teal-100 to-blue-100 px-6 py-3 rounded-full font-semibold text-gray-700 hover:scale-105 transition-transform">
          {t.startRelax}
        </button>
      </div>
    </div>
  );

  const MoodScreen = () => (
    <div className={`min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 p-6 pb-24 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="absolute top-6 left-6">
        <LanguageSelector />
      </div>
      <h2 className="text-3xl font-bold text-gray-700 mb-6">{t.moodTracker}</h2>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {moods.map((m, idx) => (
          <button
            key={idx}
            onClick={() => setMood(m.label)}
            className={`${m.color} rounded-3xl p-6 shadow-lg hover:scale-105 transition-transform ${
              mood === m.label ? 'ring-4 ring-purple-300' : ''
            }`}
            aria-label={m.label}
            aria-pressed={mood === m.label}
          >
            <div className="text-3xl mb-2" aria-hidden="true">{m.emoji}</div>
            <div className="text-2xl font-bold text-gray-700">{m.count}</div>
          </button>
        ))}
      </div>

      <div className="bg-white/70 backdrop-blur rounded-3xl p-6 shadow-lg mb-6">
        <h3 className="text-lg font-bold text-gray-700 mb-4">{t.weeklyProgress}</h3>
        <div className="h-40 flex items-end justify-between gap-2" role="img" aria-label="Weekly progress chart">
          {[40, 60, 80, 55, 70, 85, 65].map((height, idx) => (
            <div
              key={idx}
              className="flex-1 bg-gradient-to-t from-teal-200 to-teal-100 rounded-t-lg transition-all hover:scale-105"
              style={{ height: `${height}%` }}
              aria-label={`Day ${idx + 1}: ${height}%`}
            ></div>
          ))}
        </div>
      </div>

      {mood && (
        <div className="bg-white/70 backdrop-blur rounded-3xl p-6 shadow-lg">
          <p className="text-lg text-gray-700">
            {t.feelingMsg} <span className="font-bold text-purple-600">{mood}</span> {language === 'en' ? 'today' : language === 'he' ? 'היום' : 'اليوم'}.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {t.emotionMsg} 💜
          </p>
        </div>
      )}
    </div>
  );

  const JournalScreen = () => (
    <div className={`min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 p-6 pb-24 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="absolute top-6 left-6">
        <LanguageSelector />
      </div>
      <h2 className="text-3xl font-bold text-gray-700 mb-6">{t.personalJournal}</h2>

      <div className="bg-white/70 backdrop-blur rounded-3xl p-6 shadow-lg">
        <label htmlFor="journal-entry" className="sr-only">{t.personalJournal}</label>
        <textarea
          id="journal-entry"
          value={journalEntry}
          onChange={(e) => setJournalEntry(e.target.value)}
          placeholder={t.journalPlaceholder}
          className="w-full h-96 p-4 bg-transparent border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-200 resize-none text-gray-700"
          dir={isRTL ? 'rtl' : 'ltr'}
        />
        <p className="text-sm text-gray-500 mt-4 italic">
          {t.journalMsg} ✍️
        </p>
      </div>

      <button
        onClick={() => saveJournal(journalEntry)}
        className="mt-4 w-full bg-gradient-to-r from-orange-100 to-teal-100 text-gray-700 font-semibold py-3 rounded-2xl shadow-lg hover:scale-105 transition-transform"
      >
        {t.saveEntry}
      </button>
    </div>
  );

  // Main render
  return (
    <div className="font-sans">
      {currentScreen === SCREENS.HOME && <HomeScreen />}
      {currentScreen === SCREENS.PLANNER && <PlannerScreen />}
      {currentScreen === SCREENS.INSPIRE && <InspireScreen />}
      {currentScreen === SCREENS.RELAX && <RelaxScreen />}
      {currentScreen === SCREENS.MOOD && <MoodScreen />}
      {currentScreen === SCREENS.JOURNAL && <JournalScreen />}

      {currentScreen !== SCREENS.HOME && <NavBar />}
    </div>
  );
};

export default BBMPlanner;
