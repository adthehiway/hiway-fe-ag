import { contentTypeOptions } from "../media";
import { countries } from "countries-list";

export const countryOptions = Object.entries(countries).map(([code, data]) => ({
  label: data.name,
  value: code,
}));

export const dateRangeOptions = [
  {
    label: "Last 24 hours",
    value: "24h",
  },
  {
    label: "Last 7 days",
    value: "7d",
  },
  {
    label: "Last 30 days",
    value: "30d",
  },
  {
    label: "Last 90 days",
    value: "90d",
  },
];

export const deviceOptions = [
  { label: "Desktop", value: "desktop" },
  { label: "Mobile", value: "mobile" },
  { label: "Tablet", value: "tablet" },
  { label: "TV", value: "tv" },
];

export const sourceOptions = [
  { label: "twitter", value: "twitter.com" },
  { label: "linkedin", value: "linkedin.com" },
  { label: "vimeo", value: "vimeo.com" },
  { label: "facebook", value: "facebook.com" },
  { label: "other", value: "other.com" },
];

export { contentTypeOptions };
