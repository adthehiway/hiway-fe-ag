import { ProfileWidget } from "@/components/auth/profile.widget";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/contexts/sidebar";
import { cn, getBasePath } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

const Header = () => {
  const { toggleSidebar, isCollapsed } = useSidebar();
  const pathname = usePathname();
  const basePath = getBasePath(pathname);

  return (
    <header
      className={cn(
        "fixed top-0  z-10 w-full bg-sidebar border-b border-sidebar-border  h-16 flex items-center justify-between px-4 left-0 transition-all duration-300",
        isCollapsed
          ? "lg:left-20 lg:w-[calc(100%-5rem)]"
          : "lg:left-64 lg:w-[calc(100%-16rem)]"
      )}
    >
      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="iconSm" onClick={toggleSidebar}>
          <Menu />
        </Button>

        {/* <span className="text-sidebar-primary-foreground font-medium text-lg">
          {basePath}
        </span> */}
      </div>

      <div className="z-50 relative">
        <ProfileWidget />
      </div>
    </header>
  );
};

export default Header;
