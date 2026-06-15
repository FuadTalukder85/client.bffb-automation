import React, { useState, useEffect, useRef, useMemo } from 'react';
import { User } from 'lucide-react';

/**
 * MentionInput - A text input with mention autocomplete functionality
 * Shows user suggestions when typing @ followed by search text
 */
const MentionInput = ({ 
  value, 
  onChange, 
  onSubmit, 
  users = [], 
  placeholder = "Add a comment...",
  disabled = false,
  className = "",
  onFocus,
  onBlur,
  onKeyDown,
  onKeyUp
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [cursorPos, setCursorPos] = useState(0);
  const [forcedHide, setForcedHide] = useState(false);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

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
        case 'Enter':
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
    } else {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        onSubmit?.(e);
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
        ref={inputRef}
        value={value}
        onChange={handleInputChange}
        onSelect={handleInputSelect}
        onClick={handleInputSelect}
        onKeyDown={handleKeyDownInternal}
        onKeyUp={onKeyUp}
        onBlur={onBlur}
        onFocus={(e) => {
          e.stopPropagation();
          onFocus?.(e);
        }}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className={`resize-none overflow-y-hidden ${className}`}
        style={{ minHeight: '40px', maxHeight: '120px' }}
        onInput={(e) => {
          e.target.style.height = 'auto';
          e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
        }}
      />
      
      {/* Mention Suggestions Dropdown */}
      {showSuggestions && (
        <div 
          ref={suggestionsRef}
          className="absolute bottom-full left-0 right-0 mb-2 bg-background border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto z-50"
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
                className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                  index === selectedIndex 
                    ? 'bg-primary/10 text-foreground' 
                    : 'hover:bg-muted text-foreground'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{displayName}</div>
                  {email && (
                    <div className="text-xs text-muted-foreground truncate">{email}</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MentionInput;
