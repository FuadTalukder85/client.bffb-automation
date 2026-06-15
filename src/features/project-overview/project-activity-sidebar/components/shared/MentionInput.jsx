import React, { useState, useEffect, useRef, useMemo } from 'react';
import { User } from 'lucide-react';

/**
 * MentionInput - A text input with mention autocomplete functionality
 * Shows user suggestions when typing @ followed by search text
 */
const MentionInput = React.forwardRef(({
  value,
  onChange,
  onSubmit,
  users = [],
  placeholder = "Add a comment...",
  disabled = false,
  className = "",
  renderButton,
  onFocus,
  onBlur,
  onKeyDown,
  onKeyUp
}, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [cursorPos, setCursorPos] = useState(0);
  const [forcedHide, setForcedHide] = useState(false);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  const setInputRef = (element) => {
    inputRef.current = element;
    if (!ref) return;
    if (typeof ref === 'function') {
      ref(element);
    } else {
      ref.current = element;
    }
  };

  // Track cursor position on input change
  const handleInputChange = (e) => {
    onChange(e);
    const newCursorPos = e.target.selectionStart || 0;
    setCursorPos(newCursorPos);
    setForcedHide(false); // Reset forced hide on input change
    setSelectedIndex(0); // Reset selection when typing
  };

  // Track cursor position on click/selection
  const handleInputSelect = (e) => {
    setCursorPos(e.target.selectionStart || 0);
  };

  // Calculate mention search and filtered users using useMemo
  const mentionData = useMemo(() => {
    const textBeforeCursor = value.substring(0, cursorPos);
    
    // Find last @ before cursor
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex === -1) {
      return { shouldShow: false, filteredUsers: [], mentionSearch: '', cursorPosition: 0 };
    }
    
    const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
    
    // Check if there's a space after @ (which would close the mention)
    if (textAfterAt.includes(' ')) {
      return { shouldShow: false, filteredUsers: [], mentionSearch: '', cursorPosition: lastAtIndex };
    }
    
    // Filter users by name or email
    const searchTerm = textAfterAt.toLowerCase();
    const filtered = users.filter(user => {
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim().toLowerCase();
      const email = (user.email || '').toLowerCase();
      const name = (user.name || '').toLowerCase();
      
      return fullName.includes(searchTerm) || 
             email.includes(searchTerm) || 
             name.includes(searchTerm);
    }).slice(0, 5); // Limit to 5 suggestions
    
    return {
      shouldShow: filtered.length > 0,
      filteredUsers: filtered,
      mentionSearch: textAfterAt,
      cursorPosition: lastAtIndex
    };
  }, [value, users, cursorPos]);

  // Derive showSuggestions from mentionData
  const showSuggestions = mentionData.shouldShow && !forcedHide;

  const handleKeyDownInternal = (e) => {
    // Handle mention suggestion navigation only when suggestions are showing
    if (showSuggestions) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev =>
            prev < mentionData.filteredUsers.length - 1 ? prev + 1 : prev
          );
          return;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
          return;
        case 'Tab':
          e.preventDefault();
          if (mentionData.filteredUsers[selectedIndex]) {
            selectUser(mentionData.filteredUsers[selectedIndex]);
          }
          return;
        case 'Escape':
          setForcedHide(true);
          return;
        default:
          break;
      }
    }

    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  const selectUser = (user) => {
    const displayName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || user.email;
    const beforeMention = value.substring(0, mentionData.cursorPosition);
    const afterMention = value.substring(mentionData.cursorPosition + mentionData.mentionSearch.length + 1);
    
    const newValue = `${beforeMention}@${displayName} ${afterMention}`;
    onChange({ target: { value: newValue } });
    
    setForcedHide(true); // Hide suggestions after selection
    
    // Set cursor position after the mention
    setTimeout(() => {
      const newCursorPos = beforeMention.length + displayName.length + 2; // +2 for @ and space
      inputRef.current?.setSelectionRange(newCursorPos, newCursorPos);
      inputRef.current?.focus();
      setCursorPos(newCursorPos);
    }, 0);
  };

  // Reset selected index when filtered users change
  useEffect(() => {
    setSelectedIndex(0);
  }, [mentionData.filteredUsers.length]);

  // Scroll selected item into view
  useEffect(() => {
    if (showSuggestions && suggestionsRef.current) {
      const selectedElement = suggestionsRef.current.children[selectedIndex];
      selectedElement?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex, showSuggestions]);

  return (
    <div className="relative">
      <textarea
        ref={setInputRef}
        rows={1}
        value={value}
        onChange={handleInputChange}
        onSelect={handleInputSelect}
        onKeyDown={handleKeyDownInternal}
        onKeyUp={onKeyUp}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={`resize-none overflow-y-auto custom-scrollbar min-h-[40px] max-h-[120px] lg:min-h-[21.33px] lg:max-h-[64px] xl:min-h-[28.46px] xl:max-h-[85.37px] 2xl:min-h-[32px] 2xl:max-h-[96px] 3xl:min-h-[40px] 3xl:max-h-[120px] ${className}`}
        onInput={(e) => {
          e.target.style.height = 'auto';
          const maxHeight = parseFloat(getComputedStyle(e.target).maxHeight) || 120;
          e.target.style.height = Math.min(e.target.scrollHeight, maxHeight) + 'px';
        }}
        onFocus={(e) => {
          e.stopPropagation();
          onFocus?.(e);
        }}
        onClick={(e) => {
          e.stopPropagation();
          handleInputSelect();
        }}
      />
      {renderButton && renderButton()}
      
      {/* Mention Suggestions Dropdown */}
      {showSuggestions && (
        <div 
          ref={suggestionsRef}
          className="absolute bottom-full left-0 right-0 mb-2 bg-background border border-border rounded-lg shadow-lg max-h-20 lg:max-h-25 xl:max-h-34 2xl:max-h-38 3xl:max-h-48 overflow-y-auto custom-scrollbar z-50"
        >
          {mentionData.filteredUsers.map((user, index) => {
            const displayName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name;
            const email = user.email;
            
            return (
              <button
                key={user._id || user.id}
                type="button"
                onClick={() => selectUser(user)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`w-full flex items-center gap-3 lg:gap-1.5 xl:gap-2 2xl:gap-2.5 3xl:gap-3 px-2 lg:px-2.5 xl:px-3 2xl:px-3.5 3xl:px-4 py-1 lg:py-1 xl:py-[5px] 2xl:py-1.5 3xl:py-2 text-left transition-colors ${
                  index === selectedIndex 
                    ? 'bg-primary/10 text-foreground' 
                    : 'hover:bg-muted text-foreground'
                }`}
              >
                <div className="w-8 lg:w-4.5 xl:w-5.5 2xl:w-6.5 3xl:w-8 h-8 lg:h-4.5 xl:h-5.5 2xl:h-6.5 3xl:h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <User className="w-3 lg:w-3 xl:w-3.5 2xl:w-4 3xl:w-5 h-3 lg:h-3 xl:h-3.5 2xl:h-4 3xl:h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm truncate">{displayName}</div>
                  {email && (
                    <div className="text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs text-muted-foreground truncate">{email}</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
});

export default MentionInput;
