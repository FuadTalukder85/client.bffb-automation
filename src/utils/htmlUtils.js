/**
 * HTML utility functions
 */

/**
 * Decodes HTML entities in a string
 * @param {string} str - The string containing HTML entities
 * @returns {string} - The decoded string
 */
export const decodeHtmlEntities = (str) => {
  if (!str || typeof str !== 'string') return str;

  // Create a temporary DOM element to decode entities
  const textarea = document.createElement('textarea');
  textarea.innerHTML = str;
  return textarea.value;
};

/**
 * Safely decodes HTML entities, handling potential errors
 * @param {string} str - The string containing HTML entities
 * @returns {string} - The decoded string or original if decoding fails
 */
export const safeDecodeHtmlEntities = (str) => {
  try {
    return decodeHtmlEntities(str);
  } catch (error) {
    console.warn('Failed to decode HTML entities:', error);
    return str;
  }
};

/**
 * Recursively decodes HTML entities in all string values within an object or array
 * @param {*} data - The data to process (object, array, or primitive)
 * @returns {*} - The processed data with HTML entities decoded
 */
export const decodeHtmlEntitiesInData = (data) => {
  if (typeof data === 'string') {
    return safeDecodeHtmlEntities(data);
  }

  if (Array.isArray(data)) {
    return data.map(decodeHtmlEntitiesInData);
  }

  if (data !== null && typeof data === 'object') {
    const decoded = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        decoded[key] = decodeHtmlEntitiesInData(data[key]);
      }
    }
    return decoded;
  }

  return data;
};