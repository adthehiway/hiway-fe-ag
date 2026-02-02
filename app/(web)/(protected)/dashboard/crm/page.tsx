"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const CRMPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to B2B CRM by default
    router.replace("/dashboard/crm/b2b");
  }, [router]);

  return null;
};

export default CRMPage;
