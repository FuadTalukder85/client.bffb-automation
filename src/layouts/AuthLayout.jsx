import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "../store/useAuthStore";
import { Container } from "@/components/ui/Container";
import BangaLogo from "@/assets/icons/banga-logo.svg?react";

export function AuthLayout() {
  const token = useAuthStore((state) => state.token);

  // If user is already authenticated, redirect to dashboard
  if (token) {
    return <Navigate to="/profile" replace />;
  }

  return (
    <Container
      // px-[clamp(1.5rem,6.2vw,11rem)]
      className={
        "flex flex-col min-h-screen pb-20 md:pb-0 bg-[#3d2266] relative px-6 2xl:px-40"
      }
    >
      <div className="absolute top-0 left-6 2xl:left-40 z-50 pt-[clamp(28px,calc(20.39px+1.56vw),70px)] w-[clamp(155.23px,calc(152.03px+0.89vw),169.09px)]">
        <BangaLogo className="w-full h-auto text-white" />
      </div>
      {/* Left Section - Desktop */}
      <div className="flex items-center flex-1 w-full min-h-screen">
        {/* Heading */}

        {/* Marquee Animation - Desktop (Bottom) - Full Width */}
        <div className="absolute bottom-0 left-0 right-0 z-0 hidden h-32 overflow-hidden lg:block xl:h-48 opacity-30">
          <div className="animate-marquee-horizontal whitespace-nowrap">
            <img
              src="/auth/marquee.png"
              alt=""
              className="inline-block w-auto h-32 xl:h-48"
            />
            <img
              src="/auth/marquee.png"
              alt=""
              className="inline-block w-auto h-32 xl:h-48"
            />
          </div>
        </div>

        {/* Marquee Animation - Mobile (Right Side) */}
        <div className="absolute top-0 bottom-0 right-0 z-0 w-24 overflow-hidden lg:hidden opacity-30">
          <div className="animate-marquee-vertical">
            <img
              src="/auth/marquee-mobile.png"
              alt=""
              className="block w-24 h-auto"
            />
            <img
              src="/auth/marquee-mobile.png"
              alt=""
              className="block w-24 h-auto"
            />
            <img
              src="/auth/marquee-mobile.png"
              alt=""
              className="block w-24 h-auto"
            />
            <img
              src="/auth/marquee-mobile.png"
              alt=""
              className="block w-24 h-auto"
            />
            <img
              src="/auth/marquee-mobile.png"
              alt=""
              className="block w-24 h-auto"
            />
            <img
              src="/auth/marquee-mobile.png"
              alt=""
              className="block w-24 h-auto"
            />
          </div>
        </div>

        {/* Right Section - Form Container */}
        <div className="relative z-10 flex items-center justify-center w-full h-full">
          <Outlet />
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee-horizontal {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-100%);
          }
        }

        @keyframes marquee-vertical {
          0% {
            transform: translateY(-50%);
          }
          100% {
            transform: translateY(0);
          }
        }

        .animate-marquee-horizontal {
          animation: marquee-horizontal 10s linear infinite;
        }

        .animate-marquee-vertical {
          animation: marquee-vertical 20s linear infinite;
        }
      `}</style>
    </Container>
  );
}
