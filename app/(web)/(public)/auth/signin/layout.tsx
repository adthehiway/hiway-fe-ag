"use client";

import Image from "next/image";

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#F5F3EE] p-4 md:p-8 flex items-center justify-center">
      {/* Outer Floating Container */}
      <div className="w-full max-w-7xl bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[700px]">

        {/* Form Side - Left */}
        <div className="relative w-full md:w-1/2 p-8 sm:p-12 lg:p-16 flex items-center justify-center">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>

        {/* Image Side - Right */}
        <div className="w-full hidden md:block md:w-1/2 p-4 relative">
          {/* Image container */}
          <div className="w-full h-full overflow-hidden rounded-2xl relative">
            <Image
              src={"/images/auth.png"}
              alt="auth"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
