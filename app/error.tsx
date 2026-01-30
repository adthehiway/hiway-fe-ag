"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, RefreshCcw, Home, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const router = useRouter();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  const handleGoHome = () => {
    router.push("/", { scroll: false });
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleRetry = () => {
    reset();
  };

  return (
    <main className="h-full w-full">
      <div className="flex w-full h-full items-center justify-center">
        <Image
          src="/images/bg-left.png"
          width={600}
          height={558}
          alt="Left Image"
          className="absolute left-0 w-1/3 pl-8"
        />
        <div className="w-full h-full flex items-center justify-center bg-muted/50 z-50">
          <div className="relative z-10 flex flex-col w-[90%] md:w-[90%] md:max-w-[348px] lg:w-[75%] lg:max-w-[590px] bg-muted p-9 rounded-[8px] justify-center items-center">
            <div className="p-4" />

            {/* Error Icon */}
            <div className="mb-6">
              <AlertTriangle className="h-16 w-16 text-red-500 mx-auto" />
            </div>

            {/* Error Title */}
            <p className="font-primary font-normal text-[36px] text-white uppercase text-center mb-4">
              Something went wrong
            </p>

            {/* Error Description */}
            <p className="font-primary font-normal text-[10px] text-muted-foreground uppercase text-center mb-6">
              An unexpected error occurred while processing your request. Our
              team has been notified and is working to resolve this issue.
            </p>

            {/* Error Details Card (only in development) */}
            {process.env.NODE_ENV === "development" && (
              <Card className="w-full mb-6 bg-red-950/20 border-red-500/20">
                <CardHeader>
                  <CardTitle className="text-red-400 text-sm">
                    Error Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-red-300 text-xs font-mono break-all">
                    {error.message}
                  </CardDescription>
                  {error.digest && (
                    <CardDescription className="text-red-300 text-xs font-mono mt-2">
                      Error ID: {error.digest}
                    </CardDescription>
                  )}
                </CardContent>
              </Card>
            )}

            <hr className="w-full h-px my-4 bg-muted-foreground/20 border-0 rounded" />

            {/* Action Buttons */}
            <div className="flex gap-2 w-full mb-4">
              <Button className="flex-1" onClick={handleRetry}>
                <RefreshCcw className="h-4 w-4 mr-2" />
                Try again
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleGoHome}
              >
                <Home className="h-4 w-4 mr-2" />
                Go home
              </Button>
            </div>

            <Button variant="ghost" className="w-full" onClick={handleGoBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go back
            </Button>

            <div className="p-4" />

            <p className="font-primary font-normal text-[10px] text-muted-foreground uppercase text-center">
              If this problem persists, please contact our support team.
            </p>
          </div>
        </div>
        <Image
          src="/images/bg-right.png"
          alt="Right Image"
          className="absolute right-0 w-1/3 pr-8"
          width={600}
          height={558}
        />
      </div>
    </main>
  );
}
