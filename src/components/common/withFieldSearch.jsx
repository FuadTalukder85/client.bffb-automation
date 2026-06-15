import React from 'react';
import { FieldSearchBar } from '@/components/common/FieldSearchBar';
import { useFieldSearch } from '@/hooks/useFieldSearch';
import { useJumpToField } from '@/hooks/useJumpToField';

/**
 * Higher-Order Component that adds field search functionality to any detail form
 * 
 * Usage:
 * const MyDetailsWithSearch = withFieldSearch(MyDetailsComponent, {
 *   fieldGroups: myFieldGroups,
 *   searchConfig: { placeholder: 'Search fields...' }
 * });
 * 
 * @param {React.Component} WrappedComponent - The component to wrap
 * @param {Object} config - Configuration object
 * @param {Array} config.fieldGroups - Array of field groups to search
 * @param {Object} config.searchConfig - Search bar configuration
 * @param {Object} config.searchOptions - useFieldSearch options
 * @param {Object} config.jumpOptions - useJumpToField options
 * @param {boolean} config.showSearchBar - Whether to show search bar (default: true)
 * @param {string} config.searchBarPosition - 'top' or 'bottom' (default: 'top')
 * @returns {React.Component} Enhanced component with search functionality
 */
export const withFieldSearch = (WrappedComponent, config = {}) => {
  const {
    fieldGroups = [],
    searchConfig = {},
    searchOptions = {},
    jumpOptions = {},
    showSearchBar = true,
    searchBarPosition = 'top',
  } = config;

  return function FieldSearchableComponent(props) {
    const {
      query,
      results,
      isOpen,
      selectedIndex,
      handleQueryChange,
      clearSearch,
      moveSelection,
      setSelectedIndex,
      setIsOpen,
    } = useFieldSearch(fieldGroups, searchOptions);

    const { registerField, jumpToField } = useJumpToField(jumpOptions);

    const handleSelectSearchResult = (result) => {
      clearSearch();
      jumpToField(result.field.id);
    };

    const searchBar = showSearchBar && (
      <div className="px-5 pt-6 pb-2">
        <FieldSearchBar
          query={query}
          results={results}
          isOpen={isOpen}
          selectedIndex={selectedIndex}
          onQueryChange={handleQueryChange}
          onClear={clearSearch}
          onMoveSelection={moveSelection}
          onSelect={handleSelectSearchResult}
          setSelectedIndex={setSelectedIndex}
          setIsOpen={setIsOpen}
          config={searchConfig}
        />
      </div>
    );

    return (
      <>
        {searchBarPosition === 'top' && searchBar}
        <WrappedComponent
          {...props}
          registerField={registerField}
          jumpToField={jumpToField}
          fieldSearch={{
            query,
            results,
            isOpen,
            clearSearch,
          }}
        />
        {searchBarPosition === 'bottom' && searchBar}
      </>
    );
  };
};

/**
 * Hook-based approach for field search integration
 * Use this when you want more control over the search UI and behavior
 * 
 * @param {Array} fieldGroups - Array of field groups to search
 * @param {Object} options - Configuration options
 * @returns {Object} Search state, handlers, and field management functions
 */
export const useFieldSearchIntegration = (fieldGroups, options = {}) => {
  const {
    searchOptions = {},
    jumpOptions = {},
  } = options;

  const searchState = useFieldSearch(fieldGroups, searchOptions);
  const fieldManagement = useJumpToField(jumpOptions);

  const handleSelectSearchResult = (result) => {
    searchState.clearSearch();
    fieldManagement.jumpToField(result.field.id);
  };

  return {
    // Search state
    ...searchState,
    
    // Field management
    ...fieldManagement,
    
    // Convenience handlers
    handleSelectSearchResult,
    
    // Combined state info
    isReady: searchState.searchIndexSize > 0,
    stats: {
      totalFields: searchState.searchIndexSize,
      registeredFields: fieldManagement.getRegisteredFieldCount(),
    },
  };
};

export default withFieldSearch;
