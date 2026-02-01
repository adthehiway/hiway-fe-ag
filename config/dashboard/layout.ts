import { Layout } from "react-grid-layout";

export const defaultLayouts: Record<string, Layout[]> = {
  lg: [
    { i: "getStarted", x: 0, y: 0, w: 12, h: 6, minW: 4, minH: 6 },
    { i: "quickActions", x: 0, y: 6, w: 6, h: 6, minW: 3, minH: 4 },
    { i: "uploadMedia", x: 6, y: 6, w: 6, h: 6, minW: 3, minH: 4 },
    { i: "latestUpload", x: 0, y: 12, w: 6, h: 12, minW: 3, minH: 4 },
    { i: "analytics-0", x: 6, y: 12, w: 2, h: 3, minW: 2, minH: 3 },
    { i: "analytics-1", x: 8, y: 12, w: 2, h: 3, minW: 2, minH: 3 },
    { i: "analytics-2", x: 10, y: 12, w: 2, h: 3, minW: 2, minH: 3 },
    { i: "revenueOverview", x: 0, y: 24, w: 6, h: 11, minW: 3, minH: 10 },
    { i: "topContent", x: 6, y: 24, w: 6, h: 17, minW: 3, minH: 12 },
  ],
  md: [
    { i: "getStarted", x: 0, y: 0, w: 10, h: 6 },
    { i: "quickActions", x: 0, y: 6, w: 5, h: 6 },
    { i: "uploadMedia", x: 5, y: 6, w: 5, h: 6 },
    { i: "latestUpload", x: 0, y: 12, w: 5, h: 12 },
    { i: "analytics-0", x: 5, y: 12, w: 3, h: 3 },
    { i: "analytics-1", x: 8, y: 12, w: 3, h: 3 },
    { i: "analytics-2", x: 5, y: 15, w: 3, h: 3 },
    { i: "revenueOverview", x: 0, y: 24, w: 5, h: 11 },
    { i: "topContent", x: 5, y: 24, w: 5, h: 17 },
  ],
  sm: [
    { i: "getStarted", x: 0, y: 0, w: 6, h: 14 },
    { i: "quickActions", x: 0, y: 14, w: 6, h: 8 },
    { i: "uploadMedia", x: 0, y: 22, w: 6, h: 6 },
    { i: "latestUpload", x: 0, y: 28, w: 6, h: 10 },
    { i: "analytics-0", x: 0, y: 38, w: 2, h: 3 },
    { i: "analytics-1", x: 2, y: 38, w: 2, h: 3 },
    { i: "analytics-2", x: 4, y: 38, w: 2, h: 3 },
    { i: "revenueOverview", x: 0, y: 41, w: 6, h: 11 },
    { i: "topContent", x: 0, y: 52, w: 6, h: 17 },
  ],
};
