"use client";

import Image from "next/image";

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Outer light background
    <div className="h-screen w-screen bg-slate-100 p-3 md:p-4 overflow-hidden">
      {/* Navy frame */}
      <div className="h-full w-full bg-[#0f172a] rounded-[2rem] p-3 md:p-4 flex gap-3 md:gap-4">
        {/* Left side - Image card */}
        <div className="hidden md:block w-1/2">
          <div className="h-full w-full overflow-hidden rounded-[1.5rem] relative">
            <Image
              src={"/images/auth.png"}
              alt="auth"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Right side - Form card */}
        <div className="flex-1 bg-white rounded-[1.5rem] shadow-xl flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
