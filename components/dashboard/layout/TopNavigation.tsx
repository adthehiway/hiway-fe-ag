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
    <nav className="floating-nav">
      {topNavCategories.map((category) => {
        const isActive = activeCategory === category.id;
        const Icon = category.icon;

        return (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.id)}
            className={cn(
              "floating-nav-item",
              isActive && "active"
            )}
          >
            <Icon size={18} />
            <span>{category.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
