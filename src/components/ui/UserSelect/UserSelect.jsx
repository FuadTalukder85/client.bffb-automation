"use client"

import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, ChevronUp, Search, User } from "lucide-react";
import { useUsers } from "@/hooks/useUsers";

const UserSelect = ({ value, onChange, disabled, placeholder, transparent = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const selectRef = useRef(null);
  const inputRef = useRef(null);

  const { data: users = [], isLoading } = useUsers({ activeOnly: true, search: searchTerm });

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    const term = searchTerm.toLowerCase();
    return users.filter(
      user =>
        user.name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.firstName?.toLowerCase().includes(term)
    );
  }, [users, searchTerm]);

  const selectedUser = useMemo(() => {
    return users.find(u => u._id === value || u.id === value);
  }, [users, value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (user) => {
    onChange(user._id || user.id);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const displayValue = selectedUser
    ? `${selectedUser.firstName || selectedUser.name || selectedUser.email} ${selectedUser.lastName || ""}`.trim()
    : value || placeholder || "Select user...";

  return (
    <div className="relative w-full" ref={selectRef}>   
      <button
        type="button"
        onClick={() => !disabled && !isLoading && setIsOpen(!isOpen)}
        disabled={disabled || isLoading}
        className={`w-full text-foreground placeholder-lighter-text focus:outline-none text-left flex items-center justify-between ${
          transparent 
            ? 'bg-transparent border-0 p-0 text-sm md:text-body' 
            : 'px-3 py-2 bg-background border border-border rounded focus:ring-2 focus:ring-primary'
        } ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span className="flex items-center gap-2">
          <User size={16} className="text-lighter-text" />
          <span className={!selectedUser && placeholder ? "text-lighter-text" : ""}>
            {displayValue}
          </span>
        </span>
        {!disabled && !isLoading && (
          isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />
        )}
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded shadow-lg max-h-64 overflow-hidden">
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lighter-text" />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search users..."
                className="w-full pl-9 pr-3 py-2 border border-border rounded text-sm bg-background text-foreground placeholder-lighter-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto">
             {isLoading ? (
               <div className="p-3 text-center text-lighter-text">Loading...</div>
             ) : filteredUsers.length === 0 ? (
               <div className="p-3 text-center text-lighter-text">No users found</div>
             ) : (
              filteredUsers.map((user) => (
                <button
                  key={user._id || user.id}
                  type="button"
                  onClick={() => handleSelect(user)}
                  className={`w-full px-3 py-2 text-left hover:bg-primary/5 transition-colors flex items-center gap-2 ${(user._id || user.id) === value ? 'bg-primary/10 text-primary' : 'text-foreground'}`}
                >
                  <User size={16} className="text-lighter-text flex-shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="truncate">
                      {user.firstName || user.name || "Unknown"} {user.lastName || ""}
                    </span>
                    {user.email && <span className="text-xs text-lighter-text truncate">{user.email}</span>}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSelect;
