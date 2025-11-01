"use client";

// Reusable Badge Component (matching landing page)
function Badge({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="px-[14px] py-[6px] bg-card shadow-[0px_0px_0px_4px_hsl(var(--foreground)/0.05)] overflow-hidden rounded-[90px] flex justify-start items-center gap-[8px] border border-border/80 shadow-xs">
      <div className="w-[14px] h-[14px] relative overflow-hidden flex items-center justify-center">{icon}</div>
      <div className="text-center flex justify-center flex-col text-foreground text-xs font-medium leading-3 font-sans">
        {text}
      </div>
    </div>
  )
}

export default function CTASection() {
  return (
    <div className="w-full border-b border-border/40 flex flex-col justify-center items-center">
      <div className="self-stretch px-4 sm:px-6 md:px-24 py-8 sm:py-12 md:py-16 flex justify-center items-center gap-6">
        <div className="w-full max-w-[586px] px-4 sm:px-6 py-4 sm:py-5 flex flex-col justify-start items-center gap-3 sm:gap-4">
          <div className="w-full max-w-[472.55px] text-center flex justify-center flex-col text-foreground text-xl sm:text-2xl md:text-3xl lg:text-5xl font-semibold leading-tight md:leading-[60px] font-sans tracking-tight">
            Ready to track your brand?
          </div>
          <div className="self-stretch text-center text-muted-foreground text-sm sm:text-base font-normal leading-6 sm:leading-7 font-sans">
            Start monitoring your brand mentions today
            <br className="hidden sm:block" />
            and stay ahead of the competition.
          </div>
          <div className="mt-4">
            <div 
              onClick={() => window.location.href = '/auth'}
              className="h-10 sm:h-11 md:h-12 px-6 sm:px-8 md:px-10 lg:px-12 py-2 sm:py-[6px] relative bg-primary shadow-[0px_0px_0px_2.5px_hsl(var(--primary-foreground)/0.08)_inset] overflow-hidden rounded-full flex justify-center items-center cursor-pointer hover:bg-primary/90 transition-colors"
            >
              <div className="w-20 sm:w-24 md:w-28 lg:w-44 h-[41px] absolute left-0 top-[-0.5px] bg-gradient-to-b from-transparent to-black/10 dark:to-white/10 mix-blend-multiply dark:mix-blend-normal"></div>
              <div className="flex flex-col justify-center text-primary-foreground text-sm sm:text-base md:text-[15px] font-medium leading-5 font-sans">
                Get started free
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


