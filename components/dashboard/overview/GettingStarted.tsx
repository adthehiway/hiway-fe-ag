import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getStartedSteps } from "@/config/dashboard/overview";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getFromLocalStorage, saveToLocalStorage } from "@/lib/utils";

const GettingStarted = ({
  isLoading,
  getStartedClosed,
  handleGetStartedClosed,
  ...props
}: {
  isLoading: boolean;
  getStartedClosed: boolean;
  handleGetStartedClosed: () => void;
  props?: React.HTMLAttributes<HTMLDivElement>;
}) => {
  if (getStartedClosed) return null;

  return isLoading ? (
    <Card {...props}>
      <CardHeader className="flex flex-row justify-between items-center">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-8 w-8 rounded-full" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-3">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center px-4 py-6 rounded-lg bg-muted/50 border "
            >
              <Skeleton className="h-12 w-12 rounded-lg mb-3" />
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-40" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  ) : (
    <Card {...props}>
      <CardHeader className="flex flex-row justify-between items-center">
        <div className="flex flex-col gap-2">
          <CardTitle>Getting Started with Hiway</CardTitle>
          <CardDescription>
            Get started with your content sharing journey
          </CardDescription>
        </div>
        <div>
          <Button variant="ghost" size="iconSm" onClick={handleGetStartedClosed}>
            <X size={16} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-3">
          {getStartedSteps.map((step, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center px-4 py-6 rounded-lg bg-muted/50 border "
            >
              <div className="h-12 w-12 rounded-lg bg-accent flex items-center justify-center mb-3">
                <step.icon />
              </div>
              <h3 className=" font-medium mb-2">
                {index + 1}. {step.title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default GettingStarted;
