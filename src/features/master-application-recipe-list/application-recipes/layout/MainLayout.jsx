import React, { useState } from "react";
import { Link, Outlet, useLocation } from "react-router";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import PageHeader from "@/components/common/page-header";
import TextMarquee from "./components/TextMarquee";

export default function MainLayout() {
  const [search, setSearch] = useState("");
  const location = useLocation();

  // Check if we are at the root of the application recipes feature
  const isBaseRoute =
    location.pathname === "/application-recipes" ||
    location.pathname === "/application-recipes/";

  if (!isBaseRoute) return <Outlet />;

  return (
    <section className="relative flex flex-col pb-20 md:pb-0 md:h-full page-section-spacing">
      {/* Content outlet or Base Cards */}
      <main className="relative z-10 flex flex-col flex-1 w-full">
        {/* Header Section */}
        <header className="z-20 w-full">
          {/* Desktop Header */}
          <div className="items-center justify-between hidden md:flex">
            <PageHeader
              title="Application Recipes"
              className="text-heading text-base-color"
            />
            <div className="flex items-center gap-6">
              {/* <div className="w-64 lg:w-72">
                <SearchInput
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search.."
                  className="transition-all duration-300 bg-desktop-filter-bg/40 dark:bg-desktop-filter-bg/10 border-table-stroke focus:border-primary backdrop-blur-sm"
                />
              </div> */}
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile Header (Topbar handles this usually, but keep synced) */}
          <div className="flex flex-col gap-6 mb-3 md:hidden">
            <PageHeader
              title="Application Recipes"
              className="text-[2.7rem] font-bold text-base-color leading-[1.1]"
            />
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-[1400px] w-full mx-auto self-center md:mt-10">
          {/* Final Recipes Card */}
          <Link
            to="/application-recipes/final-recipes"
            className="group relative flex flex-col overflow-hidden rounded-[20px] md:rounded-[25px] border-4 md:border-3 border-primary bg-background shadow-xl transition-all duration-500 hover:scale-[1.02] hover:shadow-primary/20"
          >
            <div className="flex items-center justify-center flex-1 min-h-0 p-3 bg-white md:p-6 lg:p-8">
              <img
                src="/final-recipe.png"
                alt="Final Recipes"
                className="w-full h-full object-contain max-h-[24vh] md:max-h-[30vh] min-h-[120px] md:min-h-[150px]"
              />
            </div>
            <div className="py-0 text-center bg-primary md:py-5">
              <span className="text-sm font-medium tracking-wide text-white md:text-xl lg:text-2xl">
                Final Recipes
              </span>
            </div>
          </Link>

          {/* In-Development Recipes Card */}
          <Link
            to="/application-recipes/in-development-recipes"
            className="group relative flex flex-col overflow-hidden rounded-[20px] md:rounded-[25px] border-4 md:border-3 border-primary bg-background shadow-xl transition-all duration-500 hover:scale-[1.02] hover:shadow-primary/20"
          >
            <div className="flex items-center justify-center flex-1 min-h-0 p-3 bg-white md:p-6 lg:p-8">
              <img
                src="/in-development-recipe.png"
                alt="In-Development Recipes"
                className="w-full h-full object-contain max-h-[24vh] md:max-h-[30vh] min-h-[120px] md:min-h-[150px]"
              />
            </div>
            <div className="py-0 text-center bg-primary md:py-5">
              <span className="text-sm font-medium tracking-wide text-white md:text-xl lg:text-2xl">
                In-Development Recipes
              </span>
            </div>
          </Link>
        </div>
      </main>

      <TextMarquee />
    </section>
  );
}
