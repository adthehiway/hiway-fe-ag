import { Layout } from "react-grid-layout";

export const defaultLayouts: Record<string, Layout[]> = {
  lg: [
    { i: "getStarted", x: 0, y: 0, w: 12, h: 6, minW: 4, minH: 6 },
    { i: "quickActions", x: 0, y: 1, w: 12, h: 6, minW: 4, minH: 6 },
    { i: "uploadMedia", x: 0, y: 2, w: 6, h: 14, minW: 3, minH: 4 },
    { i: "latestUpload", x: 6, y: 2, w: 6, h: 14, minW: 3, minH: 4 },
    { i: "analytics-0", x: 0, y: 3, w: 4, h: 3, minW: 2, minH: 3 },
    { i: "analytics-1", x: 4, y: 3, w: 4, h: 3, minW: 2, minH: 3 },
    { i: "analytics-2", x: 8, y: 3, w: 4, h: 3, minW: 2, minH: 3 },
    { i: "revenueOverview", x: 0, y: 4, w: 6, h: 14, minW: 3, minH: 15 },
    { i: "topContent", x: 6, y: 4, w: 6, h: 14, minW: 3, minH: 15 },
  ],
  md: [
    { i: "getStarted", x: 0, y: 0, w: 10, h: 6 },
    { i: "quickActions", x: 0, y: 1, w: 10, h: 6 },
    { i: "uploadMedia", x: 0, y: 2, w: 5, h: 14 },
    { i: "latestUpload", x: 5, y: 2, w: 5, h: 14 },
    { i: "analytics-0", x: 0, y: 3, w: 3, h: 3 },
    { i: "analytics-1", x: 3, y: 3, w: 3, h: 3 },
    { i: "analytics-2", x: 6, y: 3, w: 3, h: 3 },
    { i: "revenueOverview", x: 0, y: 4, w: 5, h: 14 },
    { i: "topContent", x: 5, y: 4, w: 5, h: 14 },
  ],
  sm: [
    { i: "getStarted", x: 0, y: 0, w: 6, h: 14 },
    { i: "quickActions", x: 0, y: 1, w: 6, h: 15.5 },
    { i: "uploadMedia", x: 0, y: 2, w: 6, h: 8 },
    { i: "latestUpload", x: 3, y: 2, w: 6, h: 9 },
    { i: "analytics-0", x: 0, y: 3, w: 3, h: 3 },
    { i: "analytics-1", x: 3, y: 3, w: 3, h: 3 },
    { i: "analytics-2", x: 6, y: 3, w: 3, h: 3 },
    { i: "revenueOverview", x: 0, y: 4, w: 6, h: 12 },
    { i: "topContent", x: 6, y: 4, w: 6, h: 12 },
  ],
};
