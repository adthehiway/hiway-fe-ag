"use client";
import { useUser } from "@/hooks/useUser";
import React, { useEffect, useState } from "react";
import { Loader } from "../ui/loader";
import LogoutButton from "./logout-button";
import AuthService from "@/services/auth";

const AuthLoader = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const { data: user, error, isError, isLoading: isUserLoading } = useUser();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // Only check for errors/missing user after the initial loading is complete
        if (!isUserLoading) {
          if (isError || error) {
            console.log("Error fetching user data, logging out...");
            await signout();
            return;
          }

          if (!user) {
            console.log(
              "User not found after loading complete, logging out..."
            );
            await signout();
            return;
          }

          // If user exists and is valid
          if (user) {
            setIsLoading(false);
          }
        }
      } catch (err) {
        console.error("Error in auth handling:", err);
        await signout();
      }
    };

    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (!isUserLoading && !user) {
        console.log("Auth timeout, logging out...");
        signout();
      }
    }, 10000); // 10 second timeout

    handleAuth();

    return () => clearTimeout(timeoutId);
  }, [user, error, isError, isUserLoading]);

  async function signout(): Promise<void> {
    await AuthService.logout();
    window.location.replace("/");
  }

  // Show loader while checking auth status or while user data is loading
  if (isLoading || isUserLoading) {
    return <Loader fullScreen />;
  }

  // Only render children if user is authenticated
  return user ? <>{children}</> : null;
};

export default AuthLoader;
