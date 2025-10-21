/**
 * Validation utilities for BBM Planner
 */

import { timeToMinutes, timeRangesOverlap } from './timeUtils';

/**
 * Sanitizes user input text
 * @param {string} input - Raw input string
 * @param {number} maxLength - Maximum allowed length
 * @returns {string} Sanitized string
 */
export const sanitizeInput = (input, maxLength = 200) => {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, maxLength);
};

/**
 * Validates hex color format
 * @param {string} hex - Hex color string
 * @returns {boolean} True if valid
 */
export const isValidHex = (hex) => {
  return /^#[0-9A-F]{6}$/i.test(hex);
};

/**
 * Validates task data
 * @param {Object} task - Task object
 * @returns {Object} {isValid: boolean, errors: string[]}
 */
export const validateTask = (task) => {
  const errors = [];

  if (!task.text || task.text.trim().length === 0) {
    errors.push('Task description is required');
  }

  if (task.text && task.text.length > 200) {
    errors.push('Task description is too long (max 200 characters)');
  }

  if (!task.startTime) {
    errors.push('Start time is required');
  }

  if (!task.endTime) {
    errors.push('End time is required');
  }

  if (task.startTime && task.endTime) {
    const startMinutes = timeToMinutes(task.startTime);
    const endMinutes = timeToMinutes(task.endTime);

    if (endMinutes <= startMinutes) {
      errors.push('End time must be after start time');
    }

    if (endMinutes - startMinutes > 12 * 60) {
      errors.push('Task duration cannot exceed 12 hours');
    }
  }

  if (task.color && !isValidHex(task.color)) {
    errors.push('Invalid color format');
  }

  const validCategories = ['work', 'personal', 'sports', 'study', 'health'];
  if (task.category && !validCategories.includes(task.category)) {
    errors.push('Invalid category');
  }

  const validRepeat = ['none', 'daily', 'weekly'];
  if (task.repeat && !validRepeat.includes(task.repeat)) {
    errors.push('Invalid repeat option');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Checks if a new task overlaps with existing tasks
 * @param {Object} newTask - New task to check
 * @param {Array} existingTasks - Array of existing tasks
 * @param {number|null} excludeId - ID of task to exclude from check (for editing)
 * @returns {Object} {hasOverlap: boolean, overlappingTask: Object|null}
 */
export const checkTaskOverlap = (newTask, existingTasks, excludeId = null) => {
  const overlappingTask = existingTasks.find(task => {
    // Skip if it's the same task (when editing)
    if (excludeId !== null && task.id === excludeId) return false;

    // Only check tasks on the same day
    if (task.day !== newTask.day) return false;

    // Check if time ranges overlap
    return timeRangesOverlap(
      { start: newTask.startTime, end: newTask.endTime },
      { start: task.startTime, end: task.endTime }
    );
  });

  return {
    hasOverlap: !!overlappingTask,
    overlappingTask: overlappingTask || null
  };
};

/**
 * Validates that task times are within allowed hours
 * @param {string} startTime - Start time
 * @param {string} endTime - End time
 * @param {number} minHour - Minimum allowed hour (default: 6)
 * @param {number} maxHour - Maximum allowed hour (default: 22)
 * @returns {Object} {isValid: boolean, error: string|null}
 */
export const validateTaskBounds = (startTime, endTime, minHour = 6, maxHour = 22) => {
  const [startHour] = startTime.split(':').map(Number);
  const [endHour] = endTime.split(':').map(Number);

  if (startHour < minHour) {
    return {
      isValid: false,
      error: `Task cannot start before ${minHour}:00`
    };
  }

  if (endHour > maxHour) {
    return {
      isValid: false,
      error: `Task cannot end after ${maxHour}:00`
    };
  }

  return { isValid: true, error: null };
};
