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
    const defaultPath = categoryDefaultPaths[categoryId] || "/dashboard";
    router.push(defaultPath);
  };

  return (
    <nav className="flex items-end -mb-px pl-2">
      {topNavCategories.map((category) => {
        const isActive = activeCategory === category.id;
        const Icon = category.icon;

        return (
          <div key={category.id} className="relative flex items-end">
            {/* Left curved foot - aligned with content area top */}
            {isActive && (
              <div
                className="w-3 h-3 self-end -translate-y-[1px]"
                style={{
                  background: `radial-gradient(circle at 0% 0%, #0f172a 12px, #f8fafc 12px)`,
                }}
              />
            )}

            <button
              onClick={() => handleCategoryClick(category.id)}
              className={cn(
                "relative flex items-center justify-center gap-2 px-5 h-8 text-sm font-medium transition-all duration-200 rounded-t-lg",
                isActive
                  ? "text-gray-700 bg-slate-50 z-20 -translate-y-[1px]"
                  : "text-white/60 hover:text-white/80 z-10"
              )}
            >
              <Icon size={15} className={cn("relative z-10", isActive ? "text-gray-500" : "")} />
              <span className="relative z-10">{category.label}</span>
            </button>

            {/* Right curved foot - aligned with content area top */}
            {isActive && (
              <div
                className="w-3 h-3 self-end -translate-y-[1px]"
                style={{
                  background: `radial-gradient(circle at 100% 0%, #0f172a 12px, #f8fafc 12px)`,
                }}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
