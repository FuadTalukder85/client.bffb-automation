export default function TextMarquee() {
  return (
    <>
      {/* Background Animated Text - Desktop */}
      <div className="fixed bottom-0 left-0 right-0 z-0 hidden h-24 overflow-hidden duration-700 pointer-events-none md:h-32 lg:h-48 md:block">
        <div className="flex items-center h-full gap-20 animate-marquee-horizontal whitespace-nowrap">
          <img
            src="/auth/marquee.png"
            alt=""
            className="object-contain w-auto h-full"
          />
          <img
            src="/auth/marquee.png"
            alt=""
            className="object-contain w-auto h-full "
          />
          <img
            src="/auth/marquee.png"
            alt=""
            className="object-contain w-auto h-full "
          />
        </div>
      </div>

      {/* Background Animated Text - Mobile (Vertical) */}
      <div className="fixed top-24 bottom-20 right-[-20px] w-24 overflow-hidden pointer-events-none md:hidden duration-700">
        <div className="flex flex-col items-center h-full gap-10 animate-marquee-vertical">
          {[...Array(6)].map((_, i) => (
            <img
              key={i}
              src="/auth/marquee-mobile.png"
              alt=""
              className="object-contain w-full h-auto mb-8 -rotate-180"
            />
          ))}
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes marquee-horizontal {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-vertical {
          0% { transform: translateY(-50%); }
          100% { transform: translateY(0); }
        }
        .animate-marquee-horizontal {
          animation: marquee-horizontal 4s linear infinite;
        }
        .animate-marquee-vertical {
          animation: marquee-vertical 5s linear infinite;
        }
      `,
        }}
      />
    </>
  );
}
