import React from 'react';
import { cn } from '@/lib/utils';
import { EditableDataField } from './EditableDataField';

const DataGrid = ({ children, className }) => {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", className)}>
      {children}
    </div>
  );
};

const Item = ({ className, span, ...props }) => {
    const spanClasses = {
        1: "",
        2: "md:col-span-2",
        3: "md:col-span-2 lg:col-span-3",
        full: "col-span-full"
    };

    return (
        <div className={cn(spanClasses[span] || "", className)}>
            <EditableDataField {...props} />
        </div>
    );
};

DataGrid.Item = Item;

export { DataGrid };
