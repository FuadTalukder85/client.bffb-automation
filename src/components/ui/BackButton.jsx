import React from "react";
import { useNavigate } from "react-router";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export function BackButton({ className, onClick, ...props }) {
  const navigate = useNavigate();

  const handleBack = (e) => {
    if (onClick) {
      onClick(e);
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleBack}
      className={cn(
        "flex items-center justify-center w-6 lg:w-5 xl:w-7 2xl:w-8 3xl:w-10 h-6 lg:h-5 xl:h-7 2xl:h-8 3xl:h-10 rounded-sm xl:rounded-lg bg-primary-shade-2 hover:bg-primary-shade-1 transition-colors",
        className
      )}
      {...props}
    >
      <ChevronLeft className="w-5 lg:w-4.5 xl:w-5.5 2xl:w-6.5 3xl:w-8 h-5 lg:h-3 xl:h-4 2xl:h-4.5 3xl:h-6 text-nav-highlight" />
    </button>
  );
}
