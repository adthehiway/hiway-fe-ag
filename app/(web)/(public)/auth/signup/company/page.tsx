"use client";

import { CreateCompanyWidget } from "@/components/auth/create-company.widget";
import { ProfileWidget } from "@/components/auth/profile.widget";

export default function CreateCompanyPage() {

  return (
    <>
      <CreateCompanyWidget />
      <div className="absolute top-[11px] right-[24px]">
        <ProfileWidget />
      </div>
    </>
  );
}
