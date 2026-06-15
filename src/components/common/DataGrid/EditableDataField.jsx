import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select/Select";
import { DatePicker } from "@/components/ui/DatePicker/DatePicker";
import { Button } from "@/components/ui/Button";
import { Pencil, Check, X, ChevronDown, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

// Simple Textarea if the UI component is missing/empty
const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-table-stroke bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export const EditableDataField = ({
  label,
  value,
  onSave,
  type = "text",
  options = [],
  editable = false,
  className,
  placeholder,
  icon: IconOverride,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  const handleSave = async () => {
    if (onSave) {
      setIsLoading(true);
      try {
        await onSave(currentValue);
        setIsEditing(false);
      } catch (error) {
        console.error("Failed to save", error);
        // Optionally handle error state
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setCurrentValue(value);
    setIsEditing(false);
  };

  const getDisplayValue = () => {
    if (type === "select") {
      const option = options.find((o) => o.value === value);
      return option ? option.label : value;
    }
    if (type === "date") {
      if (!value) return "";
      try {
        return format(new Date(value), "dd MMM yyyy");
      } catch (e) {
        return value;
      }
    }
    return value;
  };

  const renderInput = () => {
    switch (type) {
      case "textarea":
        return (
          <Textarea
            value={currentValue || ""}
            onChange={(e) => setCurrentValue(e.target.value)}
            placeholder={placeholder}
            className="min-h-[100px]"
          />
        );
      case "select":
        return (
          <Select
            value={currentValue}
            onChange={(val) => setCurrentValue(val)}
            options={options}
            placeholder={placeholder}
          />
        );
      case "date":
        return (
          <DatePicker
            value={currentValue}
            onChange={(date) => setCurrentValue(date)}
            placeholder={placeholder}
          />
        );
      default:
        return (
          <Input
            value={currentValue || ""}
            onChange={(e) => setCurrentValue(e.target.value)}
            placeholder={placeholder}
          />
        );
    }
  };

  const renderIcon = () => {
    if (IconOverride) return <IconOverride className="w-4 h-4 text-gray-400" />;
    if (type === "select") return <ChevronDown className="w-4 h-4 text-gray-400" />;
    if (type === "date") return <Calendar className="w-4 h-4 text-gray-400" />;
    return <Pencil className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label className="text-sm font-medium text-muted-foreground">
          {label}
        </label>
      )}
      
      {isEditing ? (
        <div className="flex items-start gap-2 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex-1">
            {renderInput()}
          </div>
          <div className="flex gap-1 shrink-0 mt-1">
            <Button
              size="icon"
              variant="ghost"
              className="w-8 h-8 text-green-600 hover:text-green-700 hover:bg-green-50"
              onClick={handleSave}
              disabled={isLoading}
            >
              <Check className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="w-8 h-8 text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={handleCancel}
              disabled={isLoading}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="group relative">
          <div 
            className={cn(
              "min-h-[40px] px-3 py-2 rounded-md border border-transparent bg-gray-50/50 text-sm",
              editable && "hover:bg-gray-100 cursor-pointer border-gray-200 transition-all duration-200"
            )}
            onClick={() => editable && setIsEditing(true)}
          >
            <div className="flex items-center justify-between gap-2">
              <span className={cn("whitespace-pre-wrap break-words", !getDisplayValue() && "text-gray-400 italic")}>
                {getDisplayValue() || "Empty"}
              </span>
              {editable && (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  {renderIcon()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
