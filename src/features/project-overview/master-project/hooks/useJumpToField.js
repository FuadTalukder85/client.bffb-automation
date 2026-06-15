import { useCallback, useRef } from 'react';

/**
 * Custom hook for managing field references and implementing jump-to-field functionality
 * Provides smooth scrolling and highlighting for form field navigation
 */
export const useJumpToField = () => {
  const fieldRefs = useRef({});

  /**
   * Register a field element with its ID
   * @param {string} fieldId - The unique identifier for the field
   * @param {HTMLElement|null} element - The DOM element reference
   */
  const registerField = useCallback((fieldId, element) => {
    if (element) {
      fieldRefs.current[fieldId] = element;
    } else {
      delete fieldRefs.current[fieldId];
    }
  }, []);

  /**
   * Jump to a specific field with smooth scrolling and highlighting
   * @param {string} fieldId - The ID of the field to jump to
   */
  const jumpToField = useCallback((fieldId) => {
    const fieldElement = fieldRefs.current[fieldId];
    
    if (!fieldElement) {
      console.warn(`Field with id "${fieldId}" not found in refs`);
      return;
    }

    // Use requestAnimationFrame for smoother animation
    requestAnimationFrame(() => {
      // Step 1: Smooth scroll to field
      fieldElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
      });

      // Step 2: Focus and highlight after scroll completes
      setTimeout(() => {
        // Try to focus an input within the field container
        const input = fieldElement.querySelector(
          'input, textarea, select, button, [contenteditable="true"]'
        );
        
        if (input && typeof input.focus === 'function') {
          try {
            input.focus();
            
            // For text inputs, select the text
            if (input.tagName === 'INPUT' || input.tagName === 'TEXTAREA') {
              if (typeof input.select === 'function') {
                input.select();
              }
            }
          } catch (error) {
            // Silently fail if focus is not allowed
            console.debug('Could not focus field:', error);
          }
        }

        // Step 3: Add highlight animation class
        fieldElement.classList.add('field-highlight-active');
        
        // Remove highlight after animation duration
        setTimeout(() => {
          fieldElement.classList.remove('field-highlight-active');
        }, 2000);
      }, 400); // Wait for smooth scroll to mostly complete
    });
  }, []);

  /**
   * Clear all registered field references
   */
  const clearAllRefs = useCallback(() => {
    fieldRefs.current = {};
  }, []);

  /**
   * Get all registered field IDs
   * @returns {string[]} Array of registered field IDs
   */
  const getRegisteredFieldIds = useCallback(() => {
    return Object.keys(fieldRefs.current);
  }, []);

  return {
    registerField,
    jumpToField,
    clearAllRefs,
    getRegisteredFieldIds,
  };
};
