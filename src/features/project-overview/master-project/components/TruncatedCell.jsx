import React, { useRef, useState, useEffect } from "react";

/**
 * TruncatedCell - A component that displays text with max 2 lines,
 * truncates overflow, and shows full text in tooltip on hover
 */
export function TruncatedCell({ value, className = "" }) {
    const textRef = useRef(null);
    const [isTruncated, setIsTruncated] = useState(false);

    useEffect(() => {
        const element = textRef.current;
        if (element) {
            // Check if text is truncated by comparing scroll height with client height
            setIsTruncated(element.scrollHeight > element.clientHeight);
        }
    }, [value]);

    return (
        <span
            ref={textRef}
            className={`font-semibold line-clamp-2 w-full ${className}`}
            title={isTruncated ? value : ""}
            style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                wordBreak: "break-word"
            }}
        >
            {value || ""}
        </span>
    );
}
