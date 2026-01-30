"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

interface TabsProps extends React.ComponentProps<typeof TabsPrimitive.Root> {
  useSearchParams?: boolean;
  searchParamKey?: string;
}

function Tabs({
  className,
  useSearchParams: useUrlParams = false,
  searchParamKey = "tab",
  value,
  onValueChange,
  defaultValue,
  ...props
}: TabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Get current tab from URL if using search params
  const urlTab = useUrlParams ? searchParams.get(searchParamKey) : null;

  // Determine the current value
  const currentValue = useUrlParams ? urlTab || defaultValue : value;

  // Handle value change
  const handleValueChange = React.useCallback(
    (newValue: string) => {
      // Call the original onValueChange immediately for responsive UI
      onValueChange?.(newValue);

      if (useUrlParams) {
        // Use requestAnimationFrame to defer URL update and avoid blocking
        requestAnimationFrame(() => {
          const params = new URLSearchParams(searchParams.toString());
          params.set(searchParamKey, newValue);
          // Use replace instead of push to avoid history pollution and be faster
          router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        });
      }
    },
    [
      useUrlParams,
      searchParamKey,
      searchParams,
      pathname,
      router,
      onValueChange,
    ]
  );

  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      value={currentValue}
      onValueChange={handleValueChange}
      defaultValue={defaultValue}
      {...props}
    />
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "bg-muted text-muted-foreground inline-flex h-12 w-fit items-center justify-center rounded-lg p-[3px]",
        className
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "data-[state=active]:bg-accent data-[state=active]:text-accent-foreground dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-all focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 ",
        className
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };

// Hook for managing tabs with search parameters
export function useTabsWithSearchParams(
  searchParamKey: string = "tab",
  defaultTab?: string
) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const currentTab = searchParams.get(searchParamKey) || defaultTab;

  const setTab = React.useCallback(
    (tab: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(searchParamKey, tab);
      // Use replace for better performance and defer with requestAnimationFrame
      requestAnimationFrame(() => {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [searchParamKey, searchParams, pathname, router]
  );

  const removeTab = React.useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(searchParamKey);
    const newUrl = params.toString()
      ? `${pathname}?${params.toString()}`
      : pathname;
    // Use replace for better performance and defer with requestAnimationFrame
    requestAnimationFrame(() => {
      router.replace(newUrl, { scroll: false });
    });
  }, [searchParamKey, searchParams, pathname, router]);

  return {
    currentTab,
    setTab,
    removeTab,
    searchParams,
  };
}
