import React, { useEffect, useRef } from 'react';
import { Search, X, ChevronRight } from 'lucide-react';

/**
 * Highlight matching text in search results
 */
const highlightMatch = (text, query) => {
  if (!query || query.length < 2 || !text) return text;
  
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);
  
  if (index === -1) return text;
  
  return (
    <>
      {text.slice(0, index)}
      <mark className="bg-primary/20 text-primary font-medium rounded px-0.5">
        {text.slice(index, index + query.length)}
      </mark>
      {text.slice(index + query.length)}
    </>
  );
};

/**
 * Get display text for field type
 */
const getFieldTypeLabel = (type) => {
  const typeLabels = {
    text: 'Text',
    textarea: 'Text Area',
    number: 'Number',
    date: 'Date',
    select: 'Dropdown',
    checkbox: 'Checkbox',
    userselect: 'User',
  };
  return typeLabels[type] || type;
};

/**
 * FieldSearchBar Component
 * Provides search functionality for form fields with keyboard navigation
 */
export const FieldSearchBar = ({
  query,
  results,
  isOpen,
  selectedIndex,
  onQueryChange,
  onClear,
  onMoveSelection,
  onSelect,
  setSelectedIndex,
  setIsOpen,
}) => {
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  // Global keyboard shortcut (Ctrl/Cmd + K)
  useEffect(() => {
    const handleGlobalKeydown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleGlobalKeydown);
    return () => document.removeEventListener('keydown', handleGlobalKeydown);
  }, []);

  /**
   * Handle keyboard navigation within search
   */
  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        onMoveSelection('down');
        break;
      case 'ArrowUp':
        e.preventDefault();
        onMoveSelection('up');
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          onSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClear();
        inputRef.current?.blur();
        break;
      default:
        break;
    }
  };

  /**
   * Handle blur event with delay to allow clicking on results
   */
  const handleBlur = () => {
    setTimeout(() => {
      if (!resultsRef.current?.contains(document.activeElement)) {
        setIsOpen(false);
      }
    }, 150);
  };

  return (
    <div className="w-full">
      <div className="relative">
        <label 
          htmlFor="field-search" 
          className="block text-sm font-medium text-foreground mb-1.5"
        >
          Find a field
        </label>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          
          <input
            ref={inputRef}
            id="field-search"
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => results.length > 0 && setIsOpen(true)}
            onBlur={handleBlur}
            placeholder="Search by field name (e.g., Project Brief, Status)"
            className="w-full pl-10 pr-10 h-11 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            aria-label="Search for a form field"
            aria-expanded={isOpen}
            aria-controls="search-results"
            aria-autocomplete="list"
            autoComplete="off"
          />
          
          {query && (
            <button
              type="button"
              onClick={onClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        <p className="text-xs text-muted-foreground mt-1.5">
          Type a keyword to quickly jump to a field • Press{' '}
          <kbd className="px-1.5 py-0.5 text-xs font-semibold text-foreground bg-muted border border-border rounded">
            Ctrl
          </kbd>
          {' + '}
          <kbd className="px-1.5 py-0.5 text-xs font-semibold text-foreground bg-muted border border-border rounded">
            K
          </kbd>
        </p>

        {/* Results Dropdown */}
        {isOpen && (
          <div
            ref={resultsRef}
            id="search-results"
            role="listbox"
            className="absolute z-50 w-full mt-2 bg-background border border-border rounded-lg shadow-lg overflow-hidden"
          >
            {results.length > 0 ? (
              <ul className="py-1 max-h-[400px] overflow-y-auto">
                {results.map((result, index) => (
                  <li
                    key={result.field.id}
                    role="option"
                    aria-selected={index === selectedIndex}
                    className={`px-4 py-3 cursor-pointer transition-colors flex items-center justify-between gap-3 ${
                      index === selectedIndex
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => onSelect(result)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {highlightMatch(result.field.label, query)}
                      </p>
                      <div className="flex items-center gap-2 gap-[4.5px] xl:gap-[5.5px] 2xl:gap-[6.5px] 3xl:gap-2 mt-1 mt-[1px] xl:mt-[2px] 2xl:mt-[3px] 3xl:mt-1">
                        <p className="text-xs text-muted-foreground truncate">
                          {getFieldTypeLabel(result.field.type)}
                        </p>
                        {result.matchedOn === 'placeholder' && result.field.placeholder && (
                          <>
                            <span className="text-muted-foreground">•</span>
                            <p className="text-xs text-muted-foreground truncate">
                              {result.field.placeholder}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </li>
                ))}
              </ul>
            ) : query.length >= 2 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-muted-foreground">No fields found</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Try a different search term
                </p>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default FieldSearchBar;
