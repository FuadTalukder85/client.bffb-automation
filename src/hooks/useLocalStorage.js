import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing localStorage with React state
 * @param {string} key - The localStorage key
 * @param {any} defaultValue - Default value if key doesn't exist
 * @returns {[any, function, function]} - [value, setValue, removeValue]
 */
export function useLocalStorage(key, defaultValue) {
  // If key is null or undefined, don't use localStorage
  if (!key) {
    return [defaultValue, () => {}, () => {}];
  }

  // Initialize state with value from localStorage or default
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  // Update localStorage whenever value changes
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Error writing to localStorage key "${key}":`, error);
    }
  }, [key, value]);

  // Function to remove the key from localStorage and reset to default
  const removeValue = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setValue(defaultValue);
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, defaultValue]);

  return [value, setValue, removeValue];
}

/**
 * Custom hook for managing boolean localStorage state
 * @param {string} key - The localStorage key
 * @param {boolean} defaultValue - Default boolean value
 * @returns {[boolean, function, function]} - [value, toggleValue, removeValue]
 */
export function useLocalStorageBoolean(key, defaultValue = false) {
  const [value, setValue, removeValue] = useLocalStorage(key, defaultValue);

  const toggleValue = useCallback(() => {
    setValue(prev => !prev);
  }, [setValue]);

  return [value, toggleValue, removeValue];
}

/**
 * Custom hook for managing string localStorage state
 * @param {string} key - The localStorage key
 * @param {string} defaultValue - Default string value
 * @returns {[string, function, function]} - [value, setValue, removeValue]
 */
export function useLocalStorageString(key, defaultValue = '') {
  return useLocalStorage(key, defaultValue);
}