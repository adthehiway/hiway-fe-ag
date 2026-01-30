'use client';

import LogoutButton from "@/components/auth/logout-button";
import { ProfileWidget } from "@/components/auth/profile.widget";


export default function CompanyPackageLayout({ children }: { children: React.ReactNode }) {
	return (
    <>
      {children}
      <div className="absolute top-[11px] right-[24px]">
        <ProfileWidget />
      </div>
    </>
  );
}
