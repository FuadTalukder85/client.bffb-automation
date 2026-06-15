import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { Pencil, Save } from "lucide-react";
import { cn } from "@/lib/utils";

export default function EditablePageHeader({ title, onSave, className }) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(title);
  const inputRef = useRef(null);
  const mirrorRef = useRef(null);
  const [inputWidth, setInputWidth] = useState("auto");

  useEffect(() => {
    setCurrentTitle(title);
  }, [title]);

  useLayoutEffect(() => {
    if (isEditing && mirrorRef.current) {
      // Measure the natural width of the text
      const scrollWidth = mirrorRef.current.scrollWidth;
      // Add a larger buffer (24px) to account for scrollbar width and sub-pixel rendering
      setInputWidth(`${scrollWidth + 24}px`);
    }
  }, [currentTitle, isEditing]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      adjustHeight(inputRef.current);
    }
  }, [isEditing]);

  const adjustHeight = (element) => {
    element.style.height = "auto";
    element.style.height = element.scrollHeight + "px";
  };

  const handleSave = () => {
    if (currentTitle.trim() !== "") {
      onSave(currentTitle);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setCurrentTitle(title);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const commonStyles =
    "text-heading font-semibold xl:font-bold max-w-[225px] sm:max-w-md xl:max-w-xl leading-tight p-0 m-0";

  // Styles for the mirror element: must match font/text properties of commonStyles but without layout constraints
  const mirrorStyles =
    "text-heading font-semibold xl:font-bold leading-tight p-0 m-0";

  return (
    <div className="flex items-center gap-2 lg:gap-1 xl:gap-2 2xl:gap-3 3xl:gap-4">
      {isEditing ? (
        <div className="relative">
          {/* Mirror element to measure width */}
          <div
            ref={mirrorRef}
            className={cn(
              mirrorStyles,
              "invisible absolute top-0 left-0 h-0 overflow-hidden whitespace-pre"
            )}
            aria-hidden="true"
          >
            {currentTitle || " "}
          </div>

          <textarea
            ref={inputRef}
            style={{ width: inputWidth }}
            value={currentTitle}
            onChange={(e) => {
              setCurrentTitle(e.target.value);
              adjustHeight(e.target);
            }}
            onKeyDown={handleKeyDown}
            onBlur={handleCancel}
            rows={1}
            className={cn(
              commonStyles,
              "min-w-0 border-none bg-transparent focus:outline-none focus:bg-primary-shade-2 resize-none rounded-lg block",
              // Max height approx 2 lines (leading-tight = 1.25 * 2 = 2.5em) + small buffer
              "max-h-[2.6em] overflow-y-auto",
              className
            )}
          />
        </div>
      ) : (
        <h1
          className={cn(commonStyles, "w-fit line-clamp-2 block", className)}
        >
          {currentTitle}
        </h1>
      )}

      <button
        onClick={() => (isEditing ? handleSave() : handleEdit())}
        onMouseDown={(e) => e.preventDefault()}
        className="flex items-center justify-center w-8 lg:w-5 xl:w-7 2xl:w-8 3xl:w-10 h-8 lg:h-5 xl:h-7 2xl:h-8 3xl:h-10 transition-colors rounded-lg lg:rounded-xs xl:rounded-sm 2xl:rounded-md 3xl:rounded-lg bg-primary-shade-2 hover:bg-primary-shade-1 shrink-0"
      >
        {isEditing ? (
          <Save className="w-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4 text-nav-highlight" />
        ) : (
          <svg className="action-button-icon text-nav-highlight" xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 16 16"><path fill="currentColor" fillRule="evenodd" d="M12.238 3.64a1.854 1.854 0 0 0-1.629-1.628l-.8.8a3.37 3.37 0 0 1 1.63 1.628zM4.74 7.88l3.87-3.868a1.854 1.854 0 0 1 1.628 1.629L6.369 9.51a1.5 1.5 0 0 1-.814.418l-1.48.247l.247-1.48a1.5 1.5 0 0 1 .418-.814M9.72.78l-2 2l-4.04 4.04a3 3 0 0 0-.838 1.628L2.48 10.62a1 1 0 0 0 1.151 1.15l2.17-.36a3 3 0 0 0 1.629-.839l4.04-4.04l2-2c.18-.18.28-.423.28-.677A3.353 3.353 0 0 0 10.397.5c-.254 0-.498.1-.678.28M2.75 13a.75.75 0 0 0 0 1.5h10.5a.75.75 0 0 0 0-1.5z" clipRule="evenodd"/></svg>
        )}
      </button>
    </div>
  );
}
