"use client";
import { ProfileWidget } from "@/components/auth/profile.widget";
import { cn } from "@/lib/utils";
import { Icon } from "../ui/icons";
import InputEnhanced from "@/components/ui/input-enhanced";
import { Search, Menu } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";
import { useAccountSidebar } from "./AccountSidebar";
import { Button } from "@/components/ui/button";

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const { toggleSidebar } = useAccountSidebar();

  useEffect(() => {
    if (debouncedSearch) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("search", debouncedSearch);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    } else {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("search");
      const newUrl = params.toString()
        ? `${pathname}?${params.toString()}`
        : pathname;
      router.replace(newUrl, { scroll: false });
    }
  }, [debouncedSearch, pathname, router, searchParams]);

  return (
    <header
      className={cn(
        "fixed top-0 z-10 w-full bg-sidebar border-b border-sidebar-border h-16 flex items-center justify-between px-4 left-0 transition-all duration-300 lg:left-64 lg:w-[calc(100%-16rem)]"
      )}
    >
      <div className="flex items-center gap-3 w-full">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="lg:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-4 flex-1 justify-center max-w-2xl">
          <InputEnhanced
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            iconLeft={<Search className="w-4 h-4" />}
            className="w-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="z-50 relative">
          <ProfileWidget />
        </div>
      </div>
    </header>
  );
};

export default Header;
