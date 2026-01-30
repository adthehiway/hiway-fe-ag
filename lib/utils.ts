import { Feature, IUser, MediaStatus } from "@/types";
import { AxiosError } from "axios";
import { clsx, type ClassValue } from "clsx";
import moment from "moment";
import { toast } from "react-toastify";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Extracts error message from axios errors or other error types
 * @param error - The error object (can be AxiosError, Error, or unknown)
 * @param defaultMessage - Default message to return if no message is found
 * @returns The error message string
 */
export function getErrorMessage(
  error: unknown,
  defaultMessage: string = "Something went wrong, try again later."
): string | null {
  if (!error || (typeof error === "string" && (error as string).trim() === ""))
    return null;
  // Handle AxiosError
  if (error instanceof AxiosError) {
    // Try to get message from response.data.message
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    // Try to get message from response.data (in case message is at root level)
    if (error.response?.data && typeof error.response.data === "object") {
      const data = error.response.data as any;
      if (data.message) {
        return data.message;
      }
      if (data.error) {
        return typeof data.error === "string"
          ? data.error
          : data.error.message || defaultMessage;
      }
    }
    // Fall back to error.message if available
    if (error.message) {
      // check if object
      if (typeof error.message === "object") {
        return JSON.stringify(error.message);
      }
      return error.message;
    }
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return error.message || defaultMessage;
  }

  // Handle string errors
  if (typeof error === "string") {
    return error;
  }

  // Handle objects with message property
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message: unknown }).message;
    if (typeof message === "string") {
      return message;
    } else if (
      typeof message === "object" &&
      message !== null &&
      "message" in message
    ) {
      return (message as any).message;
    }
  }

  return defaultMessage;
}

export const getActiveHref = (pathname: string, hrefs: string[]) => {
  if (pathname.startsWith("/dashboard/media")) {
    const contentLibraryHref = hrefs.find((href) =>
      href.includes("content-library")
    );
    if (contentLibraryHref) return contentLibraryHref;
  }
  // Find the href with the longest matching prefix
  let activeHref = "";
  for (const href of hrefs) {
    if (href === "/") {
      if (pathname === "/") activeHref = href;
    } else if (pathname === href || pathname.startsWith(href + "/")) {
      if (href.length > activeHref.length) {
        activeHref = href;
      }
    }
  }
  return activeHref;
};

export const getBasePath = (pathname: string) => {
  const segments = pathname.split("/").filter(Boolean);

  // If we're at the root, return empty string or "Home"
  if (segments.length === 0) {
    return "Home";
  }

  // Get the last segment (current page name)
  const currentPage = segments[segments.length - 1];

  // Convert kebab-case or snake_case to Title Case
  return currentPage
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export const getFromLocalStorage = <T>(key: string): T | null => {
  if (typeof window === "undefined") return null;
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

export const saveToLocalStorage = <T>(key: string, value: T) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
};

export async function getVideoDurationInSeconds(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const url = URL.createObjectURL(file);

    video.preload = "metadata";
    video.src = url;
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(video.duration);
    };
    video.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load video metadata"));
    };
  });
}

export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function secondsToHHMMSS(seconds: number) {
  return moment.utc(seconds * 1000).format("HH:mm:ss");
}

export function formatUploadSpeed(bytesPerSecond: number, decimals = 1) {
  if (bytesPerSecond === 0) return "0 B/s";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B/s", "KB/s", "MB/s", "GB/s", "TB/s"];

  const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k));
  return (
    parseFloat((bytesPerSecond / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
  );
}

export function formatRemainingTime(seconds: number) {
  if (seconds === 0 || !isFinite(seconds)) return "Calculating...";

  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
}

export function copyToClipboard(text: string) {
  if (typeof window !== "undefined") {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      toast.success("Copied to clipboard");
    }
  }
}

export function valueToLabel(value: string) {
  return (
    value.charAt(0).toUpperCase() +
    value.slice(1).replace(/_/g, " ").toLowerCase()
  );
}

export function getDeviceType(): "desktop" | "mobile" | "tablet" | "tv" {
  const userAgent = navigator.userAgent.toLowerCase();

  // Check for TV
  if (userAgent.includes("tv") || userAgent.includes("smart-tv")) {
    return "tv";
  }

  // Check for tablet
  if (/ipad|android(?!.*mobile)/i.test(userAgent)) {
    return "tablet";
  }

  // Check for mobile
  if (
    /mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
  ) {
    return "mobile";
  }

  // Default to desktop
  return "desktop";
}

export function getSource(): string | undefined {
  if (typeof window === "undefined" || !document.referrer) {
    return undefined;
  }

  try {
    const referrerUrl = new URL(document.referrer);
    const hostname = referrerUrl.hostname.toLowerCase();
    return hostname;
  } catch (error) {
    console.error("Error parsing referrer URL:", error);
    return "direct";
  }
}

export function formatNumber(value?: number): string {
  if (!value) return "0";
  if (value < 1000) {
    return value.toLocaleString();
  }

  const suffixes = ["", "k", "M", "B", "T"];
  let magnitude = Math.floor(Math.log10(value) / 3);
  if (magnitude >= suffixes.length) magnitude = suffixes.length - 1;

  const scaledValue = value / Math.pow(10, magnitude * 3);
  const roundedValue = Math.round(scaledValue * 10) / 10;

  return `${roundedValue}${suffixes[magnitude]}`;
}

export const formatCurrencyAmount = (amount: number, currency: string) => {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: currency,
  });
};

export function getSmartLinkUrl({
  slug,
  length,
  embed = false,
  mode,
}: {
  slug?: string;
  length?: number;
  embed?: boolean;
  mode?: "autoplay" | "skip";
}) {
  const watchUrl =
    process.env.NEXT_PUBLIC_WATCH_URL || process.env.NEXT_PUBLIC_APP_URL || "";
  const useAppUrl = !process.env.NEXT_PUBLIC_WATCH_URL;

  let link: string;

  if (useAppUrl) {
    if (embed) {
      link = `${watchUrl}/embed?s=${slug || ""}`;
    } else {
      link = `${watchUrl}/watch?s=${slug || ""}`;
    }
  } else {
    if (embed) {
      link = `${watchUrl}/embed?s=${slug || ""}`;
    } else {
      link = `${watchUrl}/${slug || ""}`;
    }
  }

  if (mode) {
    const separator = link.includes("?") ? "&" : "?";
    link = `${link}${separator}mode=${mode}`;
  }

  return length ? link.slice(0, length) + "..." : link;
}

export function getEmbedCode({ slug }: { slug?: string }) {
  let link = getSmartLinkUrl({ slug, embed: true });
  return `<iframe width="420" height="315" src="${link}"></iframe>`;
}

/**
 * Returns a suitable interval for recharts XAxis so that there are at most 10 ticks/lines.
 * @param arr Array of chart data entries (e.g. days)
 */
export function getChartInterval<T = any>(arr: T[]): number {
  if (!arr || arr.length <= 15) return 0;
  return Math.ceil(arr.length / 15) - 1;
}

export const formateSeconds = (seconds: number) => {
  if (seconds <= 59) return `${seconds.toFixed(0)}s`;
  if (seconds < 3599) return `${Math.floor(seconds / 60)}m`;
  return `${Math.floor(seconds / 3600)}h`;
};

export const getFileNameFromName = (
  name: string,
  extension: string = "mp4"
) => {
  return `${name.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase()}.${extension}`;
};

export const validateEmail = (email: string) => {
  console.log(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const redirectTo = (path: string) => {
  if (typeof window !== "undefined") {
    window.location.href = path;
  }
};

export const handleFileSelection = ({
  files,
  multiple = false,
  maxSize = 1024 * 1024 * 10, // 10MB
  allowedFormats = [".png"],
  onError,
  onSuccess,
}: {
  files: FileList | null;
  multiple?: boolean;
  maxSize?: number;
  allowedFormats?: string[];
  onError?: (error: string | string[]) => void;
  onSuccess?: (files: File[]) => void;
}) => {
  if (!files || files.length === 0) {
    onError?.("No files selected.");
    return;
  }

  // If not multiple, only use the first file
  const selectedFiles = multiple ? files : [files[0]];

  const validFiles: File[] = [];
  const errors: string[] = [];

  for (const file of selectedFiles) {
    // Check file size
    if (file.size > maxSize) {
      errors.push(
        `File ${file.name} exceeds the maximum size of ${
          maxSize / (1024 * 1024)
        }MB.`
      );
      continue;
    }
    // Check file format
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (!allowedFormats.map((f) => f.toLowerCase()).includes(ext)) {
      errors.push(
        `File ${file.name} is not an allowed format (${allowedFormats.join(
          ", "
        )}).`
      );
      continue;
    }
    validFiles.push(file);
  }

  if (errors.length > 0) {
    onError?.(errors);
  }

  if (validFiles.length > 0) {
    onSuccess?.(validFiles);
  }
};

export const getFeatureValue = (feature: Feature, value: number) => {
  if (feature === Feature.VIDEO_STORAGE) {
    return `${value}GB video storage  p/m`;
  }
  if (feature === Feature.ASSET_STORAGE) {
    return `${value}GB asset storage  p/m`;
  }
  if (feature === Feature.STREAMING_HOURS) {
    return `${value} hours of streaming  p/m`;
  }
};

export const getWatchButtonText = (statusCode?: number) => {
  if (statusCode === 200) {
    return "Watch Now";
  }
  if (statusCode === 401) {
    return "Log in to Watch";
  }
  if (statusCode === 402) {
    return "You don't have access to this content";
  }
  if (statusCode === 403) {
    return "Watch Now";
  }
  if (statusCode === 406) {
    return "This content is not available in your country";
  }
  if (statusCode === 428) {
    return "Watch Now";
  }
  return "";
};

export const addDaysToDate = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export function slugifyFilename(filename: string) {
  const lastDotIndex = filename.lastIndexOf(".");
  const ext = lastDotIndex !== -1 ? filename.slice(lastDotIndex) : "";
  const baseName =
    lastDotIndex !== -1 ? filename.slice(0, lastDotIndex) : filename;

  const slug = baseName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return slug + ext;
}

export const getInitials = (user: IUser) => {
  // check if we have first name and last name
  if (user.firstName && user.lastName) {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
  }
  // check if we have username
  if (user.username) {
    return user.username.charAt(0);
  }
  // check if we have email
  if (user.email) {
    return user.email.charAt(0);
  }
};

export const mapMediaStatus = (status: MediaStatus): string => {
  switch (status) {
    case MediaStatus.UPLOADING_TO_ELUVIO:
      return "Uploading to Hiway";
    case MediaStatus.FINALIZE_ABR_MEZZANINE_IN_PROGRESS:
    case MediaStatus.TRANSCODING_IN_PROGRESS:
    case MediaStatus.WAITING_FINALIZE_ABR_MEZZANINE_START:
    case MediaStatus.WAITING_TRANSCODING_START:
      return "Processing";
    default:
      return status
        .replace(/_/g, " ")
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
  }
};

export const getProcessingPercentage = (status: MediaStatus | string) => {
  const orderedStates: MediaStatus[] = [
    MediaStatus.UPLOAD_IN_PROGRESS,
    MediaStatus.MODERATION_IN_PROGRESS,
    MediaStatus.UPLOADING_TO_ELUVIO,
    MediaStatus.WAITING_TRANSCODING_START,
    MediaStatus.TRANSCODING_IN_PROGRESS,
    MediaStatus.WAITING_FINALIZE_ABR_MEZZANINE_START,
    MediaStatus.FINALIZE_ABR_MEZZANINE_IN_PROGRESS,
    MediaStatus.READY,
  ];
  const lastIndex = orderedStates.length - 1;
  const idx = orderedStates.indexOf(status as MediaStatus);
  if (idx < 0) return 0;
  return Math.round((idx / lastIndex) * 100);
};

export const getApiDocumentationUrl = () => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  return appUrl.replace("portal", "api");
};

export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") {
    return "";
  }

  const STORAGE_KEY = "hiway_session_id";

  let sessionId = localStorage.getItem(STORAGE_KEY);

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, sessionId);
  }

  return sessionId;
}

export function clearSessionId(): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem("hiway_session_id");
}
