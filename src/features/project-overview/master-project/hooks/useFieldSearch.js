import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { projectFieldGroups } from '../constants/projectFieldGroups';

/**
 * Custom hook for searching and filtering form fields
 * Provides debounced search, keyboard navigation, and result management
 */
export const useFieldSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const debounceRef = useRef(null);

  // Pre-build search index from projectFieldGroups for performance
  const searchIndex = useMemo(() => {
    const fields = [];
    
    projectFieldGroups.forEach((group, groupIndex) => {
      group.forEach((field) => {
        if (!field || !field.id) return;
        
        fields.push({
          id: field.id,
          label: field.label,
          path: field.path,
          type: field.type,
          placeholder: field.placeholder || '',
          groupIndex,
          searchableTexts: [
            { text: (field.label || '').toLowerCase(), type: 'label' },
            { text: (field.placeholder || '').toLowerCase(), type: 'placeholder' },
            { text: (field.path || '').toLowerCase(), type: 'path' },
            { text: field.id.toLowerCase(), type: 'id' },
          ],
        });
      });
    });
    
    return fields;
  }, []);

  /**
   * Perform the actual search operation
   * @param {string} searchQuery - The search query string
   */
  const performSearch = useCallback(
    (searchQuery) => {
      if (searchQuery.length < 2) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      const normalizedQuery = searchQuery.toLowerCase().trim();
      const matchedResults = [];

      for (const field of searchIndex) {
        let matchFound = false;
        let matchedOn = 'label';
        
        // Check each searchable text
        for (const searchable of field.searchableTexts) {
          if (searchable.text.includes(normalizedQuery)) {
            matchedOn = searchable.type;
            matchFound = true;
            break;
          }
        }
        
        if (matchFound) {
          matchedResults.push({
            field,
            matchedOn,
            score: field.label.toLowerCase().startsWith(normalizedQuery) ? 1 : 0,
          });
        }
        
        // Limit results to improve performance
        if (matchedResults.length >= 10) break;
      }

      // Sort results by score (exact matches first)
      matchedResults.sort((a, b) => b.score - a.score);

      setResults(matchedResults);
      setIsOpen(matchedResults.length > 0);
      setSelectedIndex(0);
    },
    [searchIndex]
  );

  /**
   * Handle query change with debouncing
   * @param {string} newQuery - The new search query
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
      }, 200);
    },
    [performSearch]
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
   * @param {string} direction - 'up' or 'down'
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
    handleQueryChange,
    clearSearch,
    moveSelection,
    setSelectedIndex,
    setIsOpen,
  };
};
