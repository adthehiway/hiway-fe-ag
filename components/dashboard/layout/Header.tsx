import { Button } from "@/components/ui/button";
import { useSidebar } from "@/contexts/sidebar";
import { Menu } from "lucide-react";
import { TopNavigation } from "./TopNavigation";

const Header = () => {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="sticky top-0 z-10 bg-white">
      {/* Tab bar area with subtle gradient background */}
      <div className="px-4 pt-3 pb-0 bg-gradient-to-b from-gray-100/80 to-transparent">
        <div className="flex items-end justify-between">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="iconSm"
            onClick={toggleSidebar}
            className="text-slate-700 hover:bg-slate-100 lg:hidden mb-2"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Top Navigation - visible on all screens */}
          <div className="flex-1 flex justify-center lg:justify-start lg:ml-0">
            <TopNavigation />
          </div>

          {/* Right side placeholder for future items */}
          <div className="w-10 lg:hidden" />
        </div>
      </div>
      {/* Subtle separator line */}
      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
    </header>
  );
};

export default Header;
