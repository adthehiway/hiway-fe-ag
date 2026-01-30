import { ContentType, Genre, MediaStatus } from "@/types";

// Format content type labels for better display
const formatContentTypeLabel = (type: string): string => {
  return type
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const contentTypeOptions = Object.values(ContentType).map((type) => ({
  label: formatContentTypeLabel(type),
  value: type,
}));

export const genreOptions = Object.values(Genre).map((genre) => ({
  label: genre,
  value: genre,
}));

export const languageOptions = [
  {
    label: "English - United States",
    value: "en-us",
  },
  {
    label: "English - United Kingdom",
    value: "en-gb",
  },
];

// Executive Producer, Associate Producer, Writer, DP, Composer, Editor.
export const crewOptions = [
  {
    label: "Director",
    value: "director",
  },
  {
    label: "Producer",
    value: "producer",
  },
  {
    label: "Executive Producer",
    value: "executive producer",
  },
  {
    label: "Associate Producer",
    value: "associate producer",
  },
  {
    label: "Writer",
    value: "writer",
  },
  {
    label: "DP",
    value: "dp",
  },
  {
    label: "Composer",
    value: "composer",
  },
  {
    label: "Editor",
    value: "editor",
  },
];

export const mediaStatusOptions = [
  {
    label: "Uploaded",
    value: MediaStatus.READY,
  },
  {
    label: "Upload in progress",
    value: [
      MediaStatus.UPLOAD_IN_PROGRESS,
      MediaStatus.UPLOADING_TO_ELUVIO,
      MediaStatus.MODERATION_IN_PROGRESS,
      MediaStatus.WAITING_TRANSCODING_START,
      MediaStatus.TRANSCODING_IN_PROGRESS,
      MediaStatus.WAITING_FINALIZE_ABR_MEZZANINE_START,
      MediaStatus.FINALIZE_ABR_MEZZANINE_IN_PROGRESS,
    ],
  },
  {
    label: "Error",
    value: MediaStatus.ERROR,
  },
];
