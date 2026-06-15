import { Outlet } from "react-router";
import { Sidebar } from "../components/Sidebar/Sidebar";
import { Topbar } from "../components/Topbar/Topbar";
import { BottomNavbar } from "@/components/BottomNavbar/BottomNavbar";
import { useIsMobile } from "@/hooks/useIsMobile";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { subscribeUserToPush } from "@/utils/push-notifications";

export function DashboardLayout() {
  const isMobile = useIsMobile();

  useEffect(() => {
    // Attempt to subscribe user to push notifications when they enter the dashboard
    const initPush = async () => {
      // Small delay to ensure everything is loaded
      setTimeout(async () => {
        await subscribeUserToPush();
      }, 2000);
    };
    initPush();
  }, []);

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* 1. Fixed Sidebar */}
      <Sidebar />

      {/* 2. Main scrollable content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* 2b. Page Content (scrollable) */}
        <main
          className="flex-1 3xl:p-5 2xl:p-4 xl:p-3 lg:p-2 p-5 flex flex-col overflow-y-auto bg-linear-to-t 
         from-gradient-bottom via-gradient-middle to-gradient-top
         from-0% via-70% md:via-50% to-100%"
        >
          <Topbar className={""} />
          {isMobile ? (
            <div className="pb-20">
              <Outlet />
            </div>
          ) : (
            <Outlet />
          )}
        </main>

        {/* 3. Bottom Navbar - Visible only on mobile */}
        <BottomNavbar />
      </div>
    </div>
  );
}






// probable fix if padding issue cant be fixed on another way

// import { Outlet } from "react-router";
// import { Sidebar } from "../components/Sidebar/Sidebar";
// import { Topbar } from "../components/Topbar/Topbar";
// import { BottomNavbar } from "@/components/BottomNavbar/BottomNavbar";

// export function DashboardLayout() {
//   return (
//     <div className="flex h-screen bg-background text-foreground">
//       {/* 1. Fixed Sidebar */}
//       <Sidebar />

//       {/* 2. Main scrollable content area */}
//       <div className="flex flex-col flex-1 overflow-hidden">
//         {/* 2b. Page Content (scrollable) */}
//         <main
//           className="flex-1 p-5 flex flex-col overflow-hidden bg-linear-to-t 
//          from-gradient-bottom via-gradient-middle to-gradient-top
//          from-0% via-70% md:via-50% to-100%"
//         >
//           <Topbar className={""} />
//           <div className="flex flex-col flex-1 pb-20 overflow-y-auto md:pb-0">
//             <Outlet />
//           </div>
//         </main>

//         {/* 3. Bottom Navbar - Visible only on mobile */}
//         <BottomNavbar />
//       </div>
//     </div>
//   );
// }

