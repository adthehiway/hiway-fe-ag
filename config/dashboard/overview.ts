import {
  ChartColumn,
  DollarSign,
  Eye,
  Link2,
  Share,
  TrendingUp,
  Upload,
  Users,
} from "lucide-react";

export const getStartedSteps = [
  {
    title: "Upload Your Content",
    description:
      "Store your content in our secure library and add your metadata",
    icon: Upload,
  },
  {
    title: "Create a SmartLink",
    description:
      "Create a smartlink and share your content publicly, privately or paywalled",
    icon: Link2,
  },
  {
    title: "View Analytics",
    description: "View the analytics of all your links in real time",
    icon: ChartColumn,
  },
];

export const quickActions = [
  {
    title: "Upload Media",
    description: "Add new video content",
    icon: Upload,
    key: "uploadMedia",
  },
  {
    title: "Create a SmartLink",
    description: "Generate shareable links",
    icon: Link2,
    key: "createSmartLink",
  },
  {
    title: "Share Links",
    description: "View recent links",
    icon: Share,
    key: "shareLinks",
  },
  {
    title: "Create SmartRooms",
    description: "Share multiple SmartLinks",
    icon: Users,
    key: "createSmartRoom",
  },
];

export const analytics = [
  {
    title: "Total Views",
    key: "views",
    icon: Eye,
    iconColor: "text-blue-400",
  },
  {
    title: "Videos Uploaded",
    key: "videos",
    icon: Upload,
    iconColor: "text-accent",
  },
  {
    title: "Revenue",
    key: "revenue",
    icon: DollarSign,
    iconColor: "text-green-400",
  },
  // {
  //   title: "Engagement",
  //   key: "engagement",
  //   icon: TrendingUp,
  //   iconColor: "text-purple-400",
  // },
];
