"use client";

import { cn } from "@/lib/utils";
import { topNavCategories } from "@/config/dashboard/navigation";
import { useNavigation } from "@/contexts/navigation";
import { useRouter } from "next/navigation";

// Default landing pages for each category
const categoryDefaultPaths: Record<string, string> = {
  content: "/dashboard",
  marketing: "/dashboard/crm",
  analytics: "/dashboard/analytics",
};

export function TopNavigation() {
  const { activeCategory, setActiveCategory } = useNavigation();
  const router = useRouter();

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    // Navigate to the default page for this category
    const defaultPath = categoryDefaultPaths[categoryId] || "/dashboard";
    router.push(defaultPath);
  };

  return (
    <nav className="flex items-end gap-0">
      {topNavCategories.map((category, index) => {
        const isActive = activeCategory === category.id;
        const Icon = category.icon;

        return (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.id)}
            className={cn(
              "relative flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-all duration-200",
              // Tab shape: rounded top corners, flat bottom
              "rounded-t-xl border-t border-l border-r",
              isActive
                ? "bg-slate-50/80 text-gray-900 z-10 border-gray-200 shadow-sm"
                : "bg-white/40 text-gray-500 hover:bg-white/60 hover:text-gray-700 border-transparent",
              // Add slight overlap for tab effect
              index > 0 && "-ml-0.5"
            )}
          >
            {/* Active tab indicator line at top */}
            {isActive && (
              <div className="absolute top-0 left-2 right-2 h-[3px] bg-[#00B4B4] rounded-b-full" />
            )}
            <Icon size={18} className={cn(isActive && "text-[#00B4B4]")} />
            <span>{category.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
