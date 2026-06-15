import { useTheme } from "@/context/ThemeContext";
import { ThemeToggle } from "../ThemeToggle";
import { cn } from "@/lib/utils";
import BangaLogoWhite from "@/assets/icons/BFF-Logo-White.svg?react";
import BangaLogoPurple from "@/assets/icons/BFF-Logo-Purple.svg?react";

export function Topbar({ className }) {
  const { theme } = useTheme();

  return (
    <header
      className={cn(
        "flex items-center justify-between h-16 px-0 md:px-6 md:hidden bg-background",
        className
      )}
    >
      {/* <p className="p-2 bg-logo">hahaha</p> */}
      <div className="flex items-center gap-4 lg:gap-2.5 xl:gap-3 2xl:gap-3.5 3xl:gap-4">
        {theme === "dark" ? (
          <BangaLogoWhite className="object-contain w-28 md:w-40" />
        ) : (
          <BangaLogoPurple className="object-contain w-28 md:w-40" />
        )}
      </div>
      <ThemeToggle />
    </header>
  );
}
