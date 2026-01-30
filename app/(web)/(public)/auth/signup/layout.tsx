"use client";

import { Slider } from "@/components/auth/slider";
import Image from "next/image";

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex flex-col md:flex-row h-full min-h-[768px]">
      <div className="w-full hidden md:block md:w-1/2 h-full p-2 sm:p-4 md:p-6 lg:p-8">
        {/* <Slider
          images={["/images/auth-0.png", "/images/auth-1.png", "/images/auth-2.png"]}
          // title="Finally content you can control"
          subtitle="Lorem ipsum dolor sit amet"
        /> */}
        <div className="w-full h-full flex overflow-hidden rounded-[8px] relative">
          <Image
            src={"/images/auth.png"}
            alt="auth"
            fill
            className="object-cover"
          />
        </div>
      </div>
      <div className="relative w-full md:w-1/2 h-full p-4 sm:p-8 flex items-center justify-center">
        {children}
      </div>
    </main>
  );
}
