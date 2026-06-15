/**
 * Number formatting utilities
 */

/**
 * Formats a number with commas as thousands separators
 * @param {string|number} value - The value to format
 * @returns {string} - The formatted number string
 */
export function formatNumberWithCommas(value) {
  if (!value) return '';

  // Remove any existing commas and non-numeric characters except decimal point
  const cleanValue = value.toString().replace(/,/g, '').replace(/[^0-9.]/g, '');

  // Split into integer and decimal parts
  const parts = cleanValue.split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1] || '';

  // Add commas to integer part
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  // Return formatted number
  return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
}

/**
 * Parses a formatted number string back to a plain number
 * @param {string} formattedValue - The formatted value with commas
 * @returns {string} - The plain number string
 */
export function parseFormattedNumber(formattedValue) {
  if (!formattedValue) return '';
  return formattedValue.toString().replace(/,/g, '');
}