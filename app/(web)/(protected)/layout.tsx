import AuthLoader from "@/components/auth/Loader";
import React from "react";

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  return <AuthLoader>{children}</AuthLoader>;
};

export default ProtectedLayout;
