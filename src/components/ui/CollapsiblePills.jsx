import React, { useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export function CollapsiblePills({
  items = [],
  renderItem,
  renderMore,
  maxLines = 2,
  className,
}) {
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let prevWidth = container.offsetWidth;

    const measure = () => {
      const children = Array.from(container.children);
      if (children.length === 0) return;

      const itemChildren = children.slice(0, -1);
      const morePill = children[children.length - 1];

      // Reset to all visible to measure properly
      itemChildren.forEach((child) => {
        child.style.display = "";
      });
      morePill.style.display = "none";

      // Group children by their offsetTop to detect lines
      const tops = [];
      itemChildren.forEach((child) => {
        const top = child.offsetTop;
        if (!tops.some((t) => Math.abs(t - top) < 4)) {
          tops.push(top);
        }
      });
      tops.sort((a, b) => a - b);

      if (tops.length <= maxLines) {
        // Everything fits within maxLines
        return;
      }

      // There are more lines than maxLines. Find overflow top line
      const overflowTop = tops[maxLines];
      let firstOverflowIdx = itemChildren.findIndex(
        (child) => child.offsetTop >= overflowTop - 4
      );

      if (firstOverflowIdx === -1) {
        firstOverflowIdx = items.length;
      }

      // Try showing up to firstOverflowIdx items
      let count = firstOverflowIdx;
      morePill.style.display = "";

      while (count >= 0) {
        // Hide items from count onwards
        for (let i = 0; i < itemChildren.length; i++) {
          itemChildren[i].style.display = i < count ? "" : "none";
        }

        // Update more pill text
        const currentMoreCount = items.length - count;
        const countSpan = morePill.querySelector("[data-more-count]");
        if (countSpan) {
          countSpan.textContent = `${currentMoreCount}+`;
        } else {
          morePill.textContent = `${currentMoreCount}+`;
        }

        // Measure line count
        const visibleTops = [];
        for (let i = 0; i < count; i++) {
          const t = itemChildren[i].offsetTop;
          if (!visibleTops.some((vt) => Math.abs(vt - t) < 4)) {
            visibleTops.push(t);
          }
        }

        const allTops = [...visibleTops];
        const moreTop = morePill.offsetTop;
        if (!allTops.some((vt) => Math.abs(vt - moreTop) < 4)) {
          allTops.push(moreTop);
        }
        allTops.sort((a, b) => a - b);

        if (allTops.length <= maxLines) {
          return;
        }

        count--;
      }

      // If nothing fits, hide all and show +N
      for (let i = 0; i < itemChildren.length; i++) {
        itemChildren[i].style.display = "none";
      }
      const countSpan = morePill.querySelector("[data-more-count]");
      if (countSpan) {
        countSpan.textContent = `${items.length}+`;
      } else {
        morePill.textContent = `${items.length}+`;
      }
    };

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        if (Math.abs(width - prevWidth) > 1) {
          prevWidth = width;
          measure();
        }
      }
    });
    resizeObserver.observe(container);

    measure();

    return () => {
      resizeObserver.disconnect();
    };
  }, [items, maxLines]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex flex-wrap items-center gap-1.5 max-h-[56px] overflow-hidden py-0.5",
        className
      )}
    >
      {items.map((item, idx) => {
        const element = renderItem(item, idx);
        return React.isValidElement(element)
          ? React.cloneElement(element, { key: element.key ?? idx })
          : <span key={idx}>{element}</span>;
      })}
      {renderMore("0+")}
    </div>
  );
}

export default CollapsiblePills;
