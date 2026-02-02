import {
  FileVideo,
  Megaphone,
  BarChart3,
  LucideIcon,
} from "lucide-react";
import { Permission } from "@/lib/permissions";
import { SidebarItem } from "./sidebar";

export interface TopNavCategory {
  id: string;
  label: string;
  icon: LucideIcon;
  description?: string;
  requiredPermission?: Permission | Permission[];
}

export interface NavigationConfig {
  categories: TopNavCategory[];
  categoryItems: Record<string, string[]>; // category id -> array of sidebar item labels
}

// Top-level navigation categories
export const topNavCategories: TopNavCategory[] = [
  {
    id: "content",
    label: "Content",
    icon: FileVideo,
    description: "Manage your media content",
  },
  {
    id: "marketing",
    label: "Marketing",
    icon: Megaphone,
    description: "CRM and audience management",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    description: "Insights and reporting",
  },
];

// Map category IDs to sidebar item labels
export const categoryItemsMap: Record<string, string[]> = {
  content: ["Dashboard", "Upload", "Content Library", "SmartLinks", "SmartRoom", "Live Stream", "Syndication"],
  marketing: ["CRM"],
  analytics: ["Analytics"],
};

// Helper to get category for a given path
export function getCategoryForPath(pathname: string): string {
  // Map paths to categories
  const pathCategoryMap: Record<string, string> = {
    "/dashboard": "content",
    "/dashboard/upload": "content",
    "/dashboard/content-library": "content",
    "/dashboard/smartlinks": "content",
    "/dashboard/smartrooms": "content",
    "/dashboard/live-stream": "content",
    "/dashboard/crm": "marketing",
    "/dashboard/crm/b2b": "marketing",
    "/dashboard/crm/d2c": "marketing",
    "/dashboard/syndication": "content",
    "/dashboard/analytics": "analytics",
    "/dashboard/settings": "content", // Settings accessible from any category
    "/dashboard/referrals": "content",
    "/dashboard/reports": "analytics",
    "/dashboard/help": "content",
  };

  // Check exact match first
  if (pathCategoryMap[pathname]) {
    return pathCategoryMap[pathname];
  }

  // Check prefix matches for nested routes
  for (const [path, category] of Object.entries(pathCategoryMap)) {
    if (pathname.startsWith(path + "/")) {
      return category;
    }
  }

  return "content"; // Default to content
}
