import { Button } from "@/components/ui/button";
import { useSidebar } from "@/contexts/sidebar";
import { Menu } from "lucide-react";
import { TopNavigation } from "./TopNavigation";

const Header = () => {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="sticky top-0 z-10">
      {/* Tab bar - no background, tabs sit on the navy frame */}
      <div className="flex items-end justify-between">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="iconSm"
          onClick={toggleSidebar}
          className="text-slate-700 hover:bg-slate-100 lg:hidden mb-2 ml-4 bg-white rounded-lg"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Top Navigation - flush to the left edge */}
        <div className="flex-1 flex justify-center lg:justify-start">
          <TopNavigation />
        </div>

        {/* Right side placeholder for future items */}
        <div className="w-10 lg:hidden" />
      </div>
    </header>
  );
};

export default Header;
