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
  Radio,
  Share2,
  BarChart3,
  Play,
  Film,
  Globe,
  TrendingUp,
  Building2,
  User,
  Briefcase,
  ShoppingBag,
} from "lucide-react";
import { Permission } from "@/lib/permissions";

export interface SidebarChild {
  label: string;
  href: string;
  icon?: LucideIcon;
}

export interface SidebarChildGroup {
  groupLabel: string;
  items: SidebarChild[];
}

export interface SidebarItem {
  label: string;
  icon: LucideIcon;
  comingSoon?: boolean;
  href?: string;
  requiredPermission?: Permission | Permission[];
  children?: SidebarChild[];
  childGroups?: SidebarChildGroup[];
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
    label: "Syndication",
    icon: Share2,
    href: "/dashboard/syndication",
    requiredPermission: ["media:read", "media:*"],
  },
  {
    label: "Analytics",
    icon: Eye,
    href: "/dashboard/analytics",
    requiredPermission: ["analytics:read", "analytics:*"],
    childGroups: [
      {
        groupLabel: "Overview",
        items: [
          { label: "Analytics Overview", href: "/dashboard/analytics?section=analytics-overview", icon: BarChart3 },
        ],
      },
      {
        groupLabel: "Core Video",
        items: [
          { label: "Views & Engagement", href: "/dashboard/analytics?section=views-engagement", icon: Play },
          { label: "Engagement Analysis", href: "/dashboard/analytics?section=engagement-analysis", icon: TrendingUp },
          { label: "Geographic", href: "/dashboard/analytics?section=geographic", icon: Globe },
          { label: "Traffic Sources", href: "/dashboard/analytics?section=traffic-sources", icon: Target },
        ],
      },
      {
        groupLabel: "Content Types",
        items: [
          { label: "Free Content", href: "/dashboard/analytics?section=free-content", icon: Film },
          { label: "Paid Content", href: "/dashboard/analytics?section=paid-content", icon: DollarSign },
        ],
      },
      {
        groupLabel: "Distribution",
        items: [
          { label: "Social & External", href: "/dashboard/analytics?section=social-external", icon: Share2 },
          { label: "B2B Screeners", href: "/dashboard/analytics?section=b2b-screeners", icon: Building2 },
          { label: "Syndicated", href: "/dashboard/analytics?section=syndicated", icon: Globe },
        ],
      },
      {
        groupLabel: "Reports",
        items: [
          { label: "Reports Hub", href: "/dashboard/analytics?section=reports-hub", icon: FileText },
        ],
      },
    ],
  },
  {
    label: "CRM",
    icon: Users,
    href: "/dashboard/crm",
    requiredPermission: ["crm:read", "crm:*"],
    childGroups: [
      {
        groupLabel: "Contacts",
        items: [
          { label: "B2B", href: "/dashboard/crm/b2b", icon: Building2 },
          { label: "D2C", href: "/dashboard/crm/d2c", icon: ShoppingBag },
        ],
      },
    ],
  },
  {
    label: "Live Stream",
    icon: Radio,
    href: "/dashboard/live-stream",
    requiredPermission: ["media:read", "media:*"],
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
