import {
  Calendar,
  DollarSign,
  Eye,
  FileText,
  FileVideo,
  HelpCircle,
  Link2,
  Lock,
  LucideChartColumn,
  LucideIcon,
  Settings,
  Target,
  Upload,
  Users,
  Zap,
} from "lucide-react";
import { Permission } from "@/lib/permissions";

export interface SidebarItem {
  label: string;
  icon: LucideIcon;
  comingSoon?: boolean;
  href?: string;
  requiredPermission?: Permission | Permission[];
}

export const navItems: SidebarItem[] = [
  {
    label: "Dashboard",
    icon: LucideChartColumn,
    href: "/dashboard",
    requiredPermission: ["dashboard:read", "dashboard:*"],
  },
  {
    label: "Upload",
    icon: Upload,
    href: "/dashboard/upload",
    requiredPermission: ["media:write", "media:*"],
  },
  {
    label: "Content Library",
    icon: FileVideo,
    href: "/dashboard/content-library",
    requiredPermission: ["media:read", "media:*"],
  },
  {
    label: "SmartLinks",
    icon: Link2,
    href: "/dashboard/smartlinks",
    requiredPermission: ["smartlink:read", "smartlink:*"],
  },
  {
    label: "SmartRoom",
    icon: Users,
    href: "/dashboard/smartrooms",
    requiredPermission: ["smartroom:read", "smartroom:*"],
  },
  {
    label: "Analytics",
    icon: Eye,
    href: "/dashboard/analytics",
    requiredPermission: ["analytics:read", "analytics:*"],
  },
  {
    label: "CRM",
    icon: Users,
    href: "/dashboard/crm",
    requiredPermission: ["crm:read", "crm:*"],
  },
  // {
  //   label: "Events",
  //   icon: Calendar,
  //   href: "/dashboard/events",
  //   requiredPermission: ["events:read", "events:*"],
  // },
  // { label: "Referrals", icon: Users, href: "/dashboard/referrals" },
  // { label: "CRM", icon: Users, comingSoon: true, href: "/dashboard/crm" },
  // {
  //   label: "Landing Pages",
  //   icon: Target,
  //   comingSoon: true,
  //   href: "/dashboard/landing-pages",
  // },
  // {
  //   label: "Revenue",
  //   icon: DollarSign,
  //   comingSoon: true,
  //   href: "/dashboard/revenue",
  // },
  // {
  //   label: "Find Audience",
  //   icon: Target,
  //   comingSoon: true,
  //   href: "/dashboard/find-audience",
  // },
  // {
  //   label: "Campaigns",
  //   icon: Zap,
  //   comingSoon: true,
  //   href: "/dashboard/campaigns",
  // },
  // {
  //   label: "Rights Management",
  //   icon: Lock,
  //   comingSoon: true,
  //   href: "/dashboard/rights-management",
  // },
];

export const bottomItems: SidebarItem[] = [
  {
    label: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
  },
  {
    label: "Reports",
    icon: FileText,
    href: "/dashboard/reports",
    comingSoon: true,
    requiredPermission: ["analytics:read", "analytics:*"],
  },
  {
    label: "Help",
    icon: HelpCircle,
    href: "/dashboard/help",
    comingSoon: true,
  },
  {
    label: "Referral",
    icon: Users,
    href: "/dashboard/referrals",
    comingSoon: false,
  },
];
