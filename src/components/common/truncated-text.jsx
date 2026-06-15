import React, { useEffect, useRef, useState } from "react";

/**
 * TruncatedText - A component that shows tooltip only when text overflows
 * @param {string} text - Text to display
 * @param {string} className - Additional classes
 * @param {boolean} showTooltip - Whether to show tooltip on overflow (default: true)
 */
const TruncatedText = ({ text, className = "", showTooltip = true }) => {
  const textRef = useRef(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (textRef.current) {
        setIsOverflowing(textRef.current.scrollWidth > textRef.current.clientWidth);
      }
    };
    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [text]);

  return (
    <p
      ref={textRef}
      className={`truncate ${className}`}
      title={showTooltip && isOverflowing ? text : undefined}
    >
      {text}
    </p>
  );
};

export default TruncatedText;