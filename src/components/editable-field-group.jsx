"use client"

import React from "react";

export const EditableFieldGroup = React.forwardRef(({ children, gridClassName }, ref) => {
  const defaultGridClassName = "grid grid-cols-1 lg:grid-cols-3 lg:gap-10 xl:gap-14 2xl:gap-16 3xl:gap-20";

  return (
    <div ref={ref} className={gridClassName || defaultGridClassName}>
      {children}
    </div>
  );
});

EditableFieldGroup.displayName = "EditableFieldGroup";

export default EditableFieldGroup;
