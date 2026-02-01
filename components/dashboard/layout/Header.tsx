import { Button } from "@/components/ui/button";
import { useSidebar } from "@/contexts/sidebar";
import { Menu } from "lucide-react";

const Header = () => {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="sticky top-0 z-10 px-6 py-4 lg:hidden">
      <Button
        variant="ghost"
        size="iconSm"
        onClick={toggleSidebar}
        className="text-slate-700 hover:bg-slate-100"
      >
        <Menu className="h-5 w-5" />
      </Button>
    </header>
  );
};

export default Header;
