import { useState, useCallback, useMemo, useRef, useEffect } from 'react';

/**
 * Generic field search hook that can be used with any field configuration
 * 
 * @param {Array} fieldGroups - Array of field groups (can be nested arrays or flat array)
 * @param {Object} options - Configuration options
 * @param {number} options.debounceMs - Debounce delay in milliseconds (default: 200)
 * @param {number} options.maxResults - Maximum number of results to return (default: 10)
 * @param {number} options.minQueryLength - Minimum query length to trigger search (default: 2)
 * @returns {Object} Search state and handlers
 */
export const useFieldSearch = (fieldGroups = [], options = {}) => {
  const {
    debounceMs = 200,
    maxResults = 10,
    minQueryLength = 2,
  } = options;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const debounceRef = useRef(null);

  /**
   * Build search index from field groups
   * Supports both nested arrays and flat arrays
   */
  const searchIndex = useMemo(() => {
    const fields = [];
    
    const processField = (field, groupIndex) => {
      if (!field || !field.id) return;
      
      fields.push({
        id: field.id,
        label: field.label || '',
        path: field.path || '',
        type: field.type || 'text',
        placeholder: field.placeholder || '',
        section: field.section || '',
        groupIndex,
        searchableTexts: [
          { text: (field.label || '').toLowerCase(), type: 'label' },
          { text: (field.placeholder || '').toLowerCase(), type: 'placeholder' },
          { text: (field.path || '').toLowerCase(), type: 'path' },
          { text: field.id.toLowerCase(), type: 'id' },
          // Support for custom searchable fields
          ...(field.searchTerms || []).map(term => ({
            text: term.toLowerCase(),
            type: 'custom'
          })),
        ],
      });
    };

    // Handle nested array structure (groups of fields)
    if (Array.isArray(fieldGroups)) {
      fieldGroups.forEach((group, groupIndex) => {
        if (Array.isArray(group)) {
          // Nested array structure
          group.forEach(field => processField(field, groupIndex));
        } else {
          // Flat array structure
          processField(group, groupIndex);
        }
      });
    }
    
    return fields;
  }, [fieldGroups]);

  /**
   * Perform the actual search operation
   */
  const performSearch = useCallback(
    (searchQuery) => {
      if (searchQuery.length < minQueryLength) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      const normalizedQuery = searchQuery.toLowerCase().trim();
      const matchedResults = [];

      for (const field of searchIndex) {
        let matchFound = false;
        let matchedOn = 'label';
        let matchScore = 0;
        
        // Check each searchable text
        for (const searchable of field.searchableTexts) {
          if (searchable.text.includes(normalizedQuery)) {
            matchedOn = searchable.type;
            matchFound = true;
            
            // Calculate match score (higher is better)
            if (searchable.text === normalizedQuery) {
              matchScore = 100; // Exact match
            } else if (searchable.text.startsWith(normalizedQuery)) {
              matchScore = 50; // Starts with query
            } else if (searchable.type === 'label') {
              matchScore = 30; // Label match
            } else {
              matchScore = 10; // Other match
            }
            break;
          }
        }
        
        if (matchFound) {
          matchedResults.push({
            field,
            matchedOn,
            score: matchScore,
          });
        }
        
        // Limit results to improve performance
        if (matchedResults.length >= maxResults) break;
      }

      // Sort results by score (exact matches first)
      matchedResults.sort((a, b) => b.score - a.score);

      setResults(matchedResults);
      setIsOpen(matchedResults.length > 0);
      setSelectedIndex(0);
    },
    [searchIndex, minQueryLength, maxResults]
  );

  /**
   * Handle query change with debouncing
   */
  const handleQueryChange = useCallback(
    (newQuery) => {
      setQuery(newQuery);

      // Clear existing timeout
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      // Debounce search for better performance
      debounceRef.current = setTimeout(() => {
        performSearch(newQuery);
      }, debounceMs);
    },
    [performSearch, debounceMs]
  );

  /**
   * Clear search state
   */
  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(0);
    
    // Clear any pending debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  }, []);

  /**
   * Move selection up or down in results
   */
  const moveSelection = useCallback(
    (direction) => {
      if (!isOpen || results.length === 0) return;

      setSelectedIndex((prev) => {
        if (direction === 'down') {
          return prev < results.length - 1 ? prev + 1 : 0;
        } else {
          return prev > 0 ? prev - 1 : results.length - 1;
        }
      });
    },
    [isOpen, results.length]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    query,
    results,
    isOpen,
    selectedIndex,
    searchIndexSize: searchIndex.length,
    handleQueryChange,
    clearSearch,
    moveSelection,
    setSelectedIndex,
    setIsOpen,
  };
};
