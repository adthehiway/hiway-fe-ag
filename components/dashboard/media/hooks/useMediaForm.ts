import { useState, useEffect, useCallback } from "react";
import {
  IMedia,
  IMediaMetadataCrew,
  IMediaCastMember,
  IMediaSocialLink,
} from "@/types";
import { secondsToHHMMSS } from "@/lib/utils";

export type MediaCastMember = IMediaCastMember;
export type MediaSocialLink = IMediaSocialLink;

export interface MediaFormData {
  title: string;
  description: string;
  contentType: string;
  rating: string;
  episodic: boolean;
  duration: string;
  language: string;
  cast: string[];
  releaseDate: string;
  genre: string;
  productionCompany: string;
  crew: IMediaMetadataCrew[];
  seasonNumber: number;
  episodeNumber: number;
  thumbnail: string;
  // Feature & Documentary fields
  edition: string;
  cut: string;
  awards: string;
  franchiseCollection: string;
  // Episode fields
  seriesTitle: string;
  episodeCode: string;
  showRunner: string;
  // Trailer/Promo fields
  parentTitleId: string;
  cutType: string;
  ratingBureauCode: string;
  // Commercial fields
  advertiser: string;
  campaignName: string;
  adIdClearcastCode: string;
  durationCuts: string;
  agency: string;
  // Sports fields
  sport: string;
  competitionLeague: string;
  teams: string;
  venue: string;
  eventType: string;
  // Podcast fields
  showId: string;
  hosts: string[];
  guests: string[];
  audioOnlyFlag: boolean;
  explicitFlag: boolean;
  // New fields
  tags: string[];
  castMembers: MediaCastMember[];
  socialLinks: MediaSocialLink[];
  copyrightDetails: string;
  imdbLink: string;
  rottenTomatoesLink: string;
  eidrCode: string;
  isanCode: string;
}

const initialFormState: MediaFormData = {
  title: "",
  description: "",
  contentType: "",
  rating: "",
  episodic: false,
  duration: "",
  language: "",
  cast: [],
  releaseDate: "",
  genre: "",
  productionCompany: "",
  crew: [],
  seasonNumber: 0,
  episodeNumber: 0,
  thumbnail: "",
  edition: "",
  cut: "",
  awards: "",
  franchiseCollection: "",
  seriesTitle: "",
  episodeCode: "",
  showRunner: "",
  parentTitleId: "",
  cutType: "",
  ratingBureauCode: "",
  advertiser: "",
  campaignName: "",
  adIdClearcastCode: "",
  durationCuts: "",
  agency: "",
  sport: "",
  competitionLeague: "",
  teams: "",
  venue: "",
  eventType: "",
  showId: "",
  hosts: [],
  guests: [],
  audioOnlyFlag: false,
  explicitFlag: false,
  tags: [],
  castMembers: [],
  socialLinks: [],
  copyrightDetails: "",
  imdbLink: "",
  rottenTomatoesLink: "",
  eidrCode: "",
  isanCode: "",
};

export function useMediaForm(media: IMedia | undefined) {
  const [form, setForm] = useState<MediaFormData>(initialFormState);

  // Initialize form from media data
  useEffect(() => {
    if (media) {
      setForm({
        title: media.metadata?.title || media.name || "",
        description: media.metadata?.description || "",
        contentType: media.metadata?.contentType || "",
        rating: media.metadata?.rating || "",
        episodic: media.metadata?.episodicContent || false,
        duration:
          media.metadata?.duration ||
          secondsToHHMMSS(media.source?.duration || 0),
        language: media.metadata?.originalLanguage || "",
        cast: media.metadata?.cast || [],
        releaseDate: media.metadata?.releaseDate
          ? new Date(media.metadata.releaseDate).toISOString().split("T")[0]
          : "",
        genre: (media.metadata?.genre || [])[0] || "",
        productionCompany: media.metadata?.productionCompany || "",
        crew: media.metadata?.crew || [],
        seasonNumber: media.metadata?.seasonNumber || 0,
        episodeNumber: media.metadata?.episodeNumber || 0,
        thumbnail: media.cfThumbnail || "",
        edition: media.metadata?.edition || "",
        cut: media.metadata?.cut || "",
        awards: media.metadata?.awards || "",
        franchiseCollection: media.metadata?.franchiseCollection || "",
        seriesTitle: media.metadata?.seriesTitle || "",
        episodeCode: media.metadata?.episodeCode || "",
        showRunner: media.metadata?.showRunner || "",
        parentTitleId: media.metadata?.parentTitleId || "",
        cutType: media.metadata?.cutType || "",
        ratingBureauCode: media.metadata?.ratingBureauCode || "",
        advertiser: media.metadata?.advertiser || "",
        campaignName: media.metadata?.campaignName || "",
        adIdClearcastCode: media.metadata?.adIdClearcastCode || "",
        durationCuts: media.metadata?.durationCuts || "",
        agency: media.metadata?.agency || "",
        sport: media.metadata?.sport || "",
        competitionLeague: media.metadata?.competitionLeague || "",
        teams: media.metadata?.teams || "",
        venue: media.metadata?.venue || "",
        eventType: media.metadata?.eventType || "",
        showId: media.metadata?.showId || "",
        hosts: media.metadata?.hosts || [],
        guests: media.metadata?.guests || [],
        audioOnlyFlag: media.metadata?.audioOnlyFlag || false,
        explicitFlag: media.metadata?.explicitFlag || false,
        tags: media.tags || [],
        castMembers: media.castMembers || [],
        socialLinks: media.socialLinks || [],
        copyrightDetails: media.copyrightDetails || "",
        imdbLink: media.imdbLink || "",
        rottenTomatoesLink: media.rottenTomatoesLink || "",
        eidrCode: media.eidrCode || "",
        isanCode: media.isanCode || "",
      });
    }
  }, [media]);

  const handleChange = useCallback((field: keyof MediaFormData, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const getContentTypeFields = useCallback((contentType: string): string[] => {
    const normalizedType = contentType.toLowerCase();

    if (normalizedType === "feature" || normalizedType === "documentary") {
      return ["edition", "cut", "awards", "franchiseCollection"];
    } else if (normalizedType === "episode") {
      return ["seriesTitle", "episodeCode", "showRunner"];
    } else if (normalizedType === "trailer" || normalizedType === "promo") {
      return ["parentTitleId", "cutType", "ratingBureauCode"];
    } else if (normalizedType === "commercial") {
      return [
        "advertiser",
        "campaignName",
        "adIdClearcastCode",
        "durationCuts",
        "agency",
      ];
    } else if (normalizedType === "sports") {
      return ["sport", "competitionLeague", "teams", "venue", "eventType"];
    } else if (normalizedType === "podcast") {
      return ["showId", "hosts", "guests", "audioOnlyFlag", "explicitFlag"];
    }
    return [];
  }, []);

  const buildUpdatePayload = useCallback(() => {
    const contentTypeFields = getContentTypeFields(form.contentType);
    const dynamicFields: Record<string, any> = {};

    // Only include fields relevant to the selected content type
    if (contentTypeFields.includes("edition")) {
      dynamicFields.edition = form.edition;
      dynamicFields.cut = form.cut;
      dynamicFields.awards = form.awards;
      dynamicFields.franchiseCollection = form.franchiseCollection;
    }
    if (contentTypeFields.includes("seriesTitle")) {
      dynamicFields.seriesTitle = form.seriesTitle;
      dynamicFields.episodeCode = form.episodeCode;
      dynamicFields.showRunner = form.showRunner;
    }
    if (contentTypeFields.includes("parentTitleId")) {
      dynamicFields.parentTitleId = form.parentTitleId;
      dynamicFields.cutType = form.cutType;
      dynamicFields.ratingBureauCode = form.ratingBureauCode;
    }
    if (contentTypeFields.includes("advertiser")) {
      dynamicFields.advertiser = form.advertiser;
      dynamicFields.campaignName = form.campaignName;
      dynamicFields.adIdClearcastCode = form.adIdClearcastCode;
      dynamicFields.durationCuts = form.durationCuts;
      dynamicFields.agency = form.agency;
    }
    if (contentTypeFields.includes("sport")) {
      dynamicFields.sport = form.sport;
      dynamicFields.competitionLeague = form.competitionLeague;
      dynamicFields.teams = form.teams;
      dynamicFields.venue = form.venue;
      dynamicFields.eventType = form.eventType;
    }
    if (contentTypeFields.includes("showId")) {
      dynamicFields.showId = form.showId;
      dynamicFields.hosts = form.hosts.filter((h) => h !== "");
      dynamicFields.guests = form.guests.filter((g) => g !== "");
      dynamicFields.audioOnlyFlag = form.audioOnlyFlag;
      dynamicFields.explicitFlag = form.explicitFlag;
    }

    return {
      metadata: {
        ...media?.metadata,
        title: form.title,
        description: form.description,
        rating: form.rating,
        episodicContent: form.episodic,
        duration: form.duration,
        originalLanguage: form.language,
        cast: form.cast.filter((c) => c !== ""),
        releaseDate: form.releaseDate,
        genre: [form.genre],
        productionCompany: form.productionCompany,
        crew: form.crew,
        contentType: form.contentType,
        seasonNumber: form.seasonNumber,
        episodeNumber: form.episodeNumber,
        ...dynamicFields,
      },
      cfThumbnail: form.thumbnail,
      tags: form.tags,
      castMembers: form.castMembers,
      socialLinks: form.socialLinks,
      copyrightDetails: form.copyrightDetails,
      imdbLink: form.imdbLink,
      rottenTomatoesLink: form.rottenTomatoesLink,
      eidrCode: form.eidrCode,
      isanCode: form.isanCode,
    };
  }, [form, media?.metadata, getContentTypeFields]);

  return {
    form,
    handleChange,
    getContentTypeFields,
    buildUpdatePayload,
  };
}
