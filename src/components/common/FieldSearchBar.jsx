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
      <mark className="bg-nav-highlight/20 dark:bg-nav-highlight text-primary font-medium rounded px-0.5">
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
    email: 'Email',
    tel: 'Phone',
    url: 'URL',
    time: 'Time',
    datetime: 'Date & Time',
    radio: 'Radio',
    file: 'File',
  };
  return typeLabels[type] || type;
};

/**
 * FieldSearchBar Component - Generic reusable search component for any form
 * 
 * @param {Object} props - Component props
 * @param {string} props.query - Current search query
 * @param {Array} props.results - Array of search results
 * @param {boolean} props.isOpen - Whether the dropdown is open
 * @param {number} props.selectedIndex - Currently selected result index
 * @param {Function} props.onQueryChange - Handler for query changes
 * @param {Function} props.onClear - Handler to clear search
 * @param {Function} props.onMoveSelection - Handler for keyboard navigation
 * @param {Function} props.onSelect - Handler when a result is selected
 * @param {Function} props.setSelectedIndex - Function to set selected index
 * @param {Function} props.setIsOpen - Function to toggle dropdown
 * @param {Object} props.config - Optional configuration
 * @param {string} props.config.placeholder - Custom placeholder text
 * @param {string} props.config.label - Custom label text
 * @param {string} props.config.shortcutKey - Keyboard shortcut key (default: 'k')
 * @param {boolean} props.config.showMetadata - Show field metadata in results (default: true)
 * @param {boolean} props.config.showShortcutHint - Show keyboard shortcut hint (default: true)
 * @param {string} props.config.emptyMessage - Message when no results found
 * @param {string} props.config.emptyHint - Hint when no results found
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
  config = {},
}) => {
  const {
    placeholder = "Search by field name (e.g., Project Brief, Status)",
    label = "",
    shortcutKey = 'k',
    showMetadata = true,
    showShortcutHint = false,
    emptyMessage = "No fields found",
    emptyHint = "Try a different search term",
  } = config;

  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  // Global keyboard shortcut (Ctrl/Cmd + K by default)
  useEffect(() => {
    const handleGlobalKeydown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === shortcutKey.toLowerCase()) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleGlobalKeydown);
    return () => document.removeEventListener('keydown', handleGlobalKeydown);
  }, [shortcutKey]);

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
    <div className="w-full lg:max-w-xs xl:max-w-md 2xl:max-w-lg 3xl:max-w-xl mx-auto field-search-bar">
    <div className="w-full lg:max-w-md xl:max-w-lg 2xl:max-w-xl 3xl:max-w-2xl field-search-bar">
      <div className="relative">
        {label && (
          <label 
            htmlFor="field-search" 
            className="block text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-medium text-foreground mb-1.5"
          >
            {label}
          </label>
        )}
        
        <div className="relative flex items-center">
          <Search className="absolute w-4 lg:w-2.5 xl:w-3 2xl:w-3.5 3xl:w-4 h-4 lg:h-2.5 xl:h-3 2xl:h-3.5 3xl:h-4 -translate-y-1/2 pointer-events-none left-3 top-1/2  text-base-color" />
          
          <input
            ref={inputRef}
            id="field-search"
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => results.length > 0 && setIsOpen(true)}
            onBlur={handleBlur}
            placeholder={placeholder}
            className="w-full h-8 lg:h-4.5 xl:h-5.5 2xl:h-6.5 3xl:h-8 px-10 lg:px-5 lg:px-6.5 2xl:px-8 3xl:px-10 text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm transition-all border rounded-md bg-primary-shade-2 border-nav-highlight/30 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary placeholder:text-gray-400"
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
              className="absolute transition-colors -translate-y-1/2 right-3 top-1/2 text-base-color hover:text-primary"
              aria-label="Clear search"
            >
              <X className="w-4 lg:w-2.5 xl:w-3 2xl:w-3.5 3xl:w-4 h-4 lg:h-2.5 xl:h-3 2xl:h-3.5 3xl:h-4" />
            </button>
          )}
        </div>
        
        {showShortcutHint && (
          <p className="text-xs text-muted-foreground mt-1.5">
            Type a keyword to quickly jump to a field • Press{' '}
            <kbd className="px-1.5 py-0.5 text-xs font-semibold text-foreground bg-muted border border-border rounded">
              Ctrl
            </kbd>
            {' + '}
            <kbd className="px-1.5 py-0.5 text-xs font-semibold text-foreground bg-muted border border-border rounded">
              {shortcutKey.toUpperCase()}
            </kbd>
          </p>
        )}

        {/* Results Dropdown */}
        {isOpen && (
          <div
            ref={resultsRef}
            id="search-results"
            role="listbox"
            className="absolute z-50 w-full mt-2 overflow-hidden border rounded-lg shadow-lg bg-background border-border max-h-[40vh] md:max-h-100 "
          >
            {results.length > 0 ? (
              <ul className="overflow-y-auto custom-scrollbar max-h-[calc(40vh-2rem)] md:max-h-92">
                {results.map((result, index) => (
                  <li
                    key={result.field.id}
                    role="option"
                    aria-selected={index === selectedIndex}
                    className={`px-4 py-3 cursor-pointer transition-colors flex items-center justify-between gap-3 ${
                      index === selectedIndex
                        ? 'bg-primary/10 text-nav-highlight'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => onSelect(result)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {highlightMatch(result.field.label, query)}
                      </p>
                      {showMetadata && (
                        <div className="flex items-center gap-2 gap-[4.5px] xl:gap-[5.5px] 2xl:gap-[6.5px] 3xl:gap-2 mt-1 mt-[1px] xl:mt-[2px] 2xl:mt-[3px] 3xl:mt-1">
                          <p className="text-xs truncate text-muted-foreground">
                            {getFieldTypeLabel(result.field.type)}
                          </p>
                          {result.matchedOn === 'placeholder' && result.field.placeholder && (
                            <>
                              <span className="text-muted-foreground">•</span>
                              <p className="text-xs truncate text-muted-foreground">
                                {result.field.placeholder}
                              </p>
                            </>
                          )}
                          {result.field.section && (
                            <>
                              <span className="text-muted-foreground">•</span>
                              <p className="text-xs capitalize truncate text-muted-foreground">
                                {result.field.section}
                              </p>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </li>
                ))}
              </ul>
            ) : query.length >= 2 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-muted-foreground">{emptyMessage}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {emptyHint}
                </p>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default FieldSearchBar;
