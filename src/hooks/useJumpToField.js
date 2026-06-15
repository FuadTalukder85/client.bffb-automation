import { useCallback, useRef } from 'react';

/**
 * Generic hook for managing field references and implementing jump-to-field functionality
 * Can be used with any form that needs field navigation
 * 
 * @param {Object} options - Configuration options
 * @param {number} options.highlightDuration - Duration of highlight animation in ms (default: 2000)
 * @param {number} options.scrollDelay - Delay before scrolling in ms (default: 100)
 * @param {number} options.focusDelay - Delay before focusing in ms (default: 400)
 * @param {string} options.highlightClass - CSS class for highlighting (default: 'field-highlight-active')
 * @param {string} options.scrollBehavior - Scroll behavior: 'smooth' or 'auto' (default: 'smooth')
 * @param {string} options.scrollBlock - Scroll block alignment: 'start', 'center', 'end', 'nearest' (default: 'center')
 * @returns {Object} Field management functions
 */
export const useJumpToField = (options = {}) => {
  const {
    highlightDuration = 2000,
    scrollDelay = 100,
    focusDelay = 400,
    highlightClass = 'field-highlight-active',
    scrollBehavior = 'smooth',
    scrollBlock = 'center',
  } = options;

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
   * @param {Object} customOptions - Override default options for this specific jump
   */
  const jumpToField = useCallback((fieldId, customOptions = {}) => {
    const fieldElement = fieldRefs.current[fieldId];
    
    if (!fieldElement) {
      console.warn(`[useJumpToField] Field with id "${fieldId}" not found in refs. Registered fields:`, Object.keys(fieldRefs.current));
      return;
    }

    const finalOptions = { ...options, ...customOptions };

    // Use requestAnimationFrame for smoother animation
    requestAnimationFrame(() => {
      setTimeout(() => {
        // Step 1: Smooth scroll to field
        try {
          fieldElement.scrollIntoView({
            behavior: finalOptions.scrollBehavior || scrollBehavior,
            block: finalOptions.scrollBlock || scrollBlock,
            inline: 'nearest',
          });
        } catch (error) {
          console.warn('[useJumpToField] Scroll failed:', error);
          // Fallback for browsers that don't support smooth scrolling
          fieldElement.scrollIntoView(false);
        }

        // Step 2: Focus and highlight after scroll completes
        setTimeout(() => {
          // Try to focus an input within the field container
          const input = fieldElement.querySelector(
            'input, textarea, select, button, [contenteditable="true"], [tabindex="0"]'
          );
          
          if (input && typeof input.focus === 'function') {
            try {
              input.focus({ preventScroll: true });
              
              // For text inputs, select the text
              if ((input.tagName === 'INPUT' || input.tagName === 'TEXTAREA') && !input.disabled) {
                if (typeof input.select === 'function') {
                  input.select();
                }
              }
            } catch (error) {
              // Silently fail if focus is not allowed (e.g., disabled field)
              console.debug('[useJumpToField] Could not focus field:', error);
            }
          }

          // Step 3: Add highlight animation class
          const finalHighlightClass = finalOptions.highlightClass || highlightClass;
          fieldElement.classList.add(finalHighlightClass);
          
          // Remove highlight after animation duration
          const finalDuration = finalOptions.highlightDuration || highlightDuration;
          setTimeout(() => {
            fieldElement.classList.remove(finalHighlightClass);
          }, finalDuration);
        }, finalOptions.focusDelay || focusDelay);
      }, finalOptions.scrollDelay || scrollDelay);
    });
  }, [highlightDuration, scrollDelay, focusDelay, highlightClass, scrollBehavior, scrollBlock, options]);

  /**
   * Check if a field is registered
   * @param {string} fieldId - The ID of the field to check
   * @returns {boolean} Whether the field is registered
   */
  const isFieldRegistered = useCallback((fieldId) => {
    return !!fieldRefs.current[fieldId];
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

  /**
   * Get count of registered fields
   * @returns {number} Number of registered fields
   */
  const getRegisteredFieldCount = useCallback(() => {
    return Object.keys(fieldRefs.current).length;
  }, []);

  return {
    registerField,
    jumpToField,
    isFieldRegistered,
    clearAllRefs,
    getRegisteredFieldIds,
    getRegisteredFieldCount,
  };
};
