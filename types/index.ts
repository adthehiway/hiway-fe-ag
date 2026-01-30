import { CrewMember } from "@/components/ui/crew-input.component";
import { Permission } from "@/lib/permissions";

export enum Role {
  APIM = "APIM",
  ADMIN = "ADMIN",
  USER = "USER",
}

export enum MediaAssetType {
  POSTER = "POSTER",
  SUBTITLE = "SUBTITLE",
  AUDIO = "AUDIO",
  DOCUMENT = "DOCUMENT",
  OTHER = "OTHER",
}

// Other Asset Types for generic uploads
export enum OtherAssetType {
  PRESS_KIT = "PRESS_KIT",
  BEHIND_THE_SCENES = "BEHIND_THE_SCENES",
  PDF = "PDF",
  EPK = "EPK",
  STILLS = "STILLS",
  OTHER = "OTHER",
}

// Content Relationship Types
export enum ContentRelationshipType {
  ASSOCIATED = "ASSOCIATED", // Promotional content (promos, commercials, trailers, bonus clips)
  RELATED = "RELATED", // Related titles (e.g., sequels, series)
}

export interface IMediaAsset {
  id: string;
  type: MediaAssetType | string; // Can be enum or API string type like "MAIN_POSTER"
  url: string;
  filename: string;
  filesize?: number;
  language?: string;
  label?: string;
  isDefault: boolean;
  partHash?: string;
  mediaId: string;
  createdAt: string;
  updatedAt: string;
  offeringKey?: string | null;
  streamKey?: string | null;
}

export type OverviewType = {
  recentMedia: IMedia;
  analytics: {
    key: string;
    value: number;
    change: number;
  }[];
  revenueOverview: {
    currentMonth: {
      label: string;
      value: number;
      change: number;
    };
    monthly: {
      label: string;
      value: number;
    }[];
    projectedAnnual: number;
    avgMonthly: number;
    avgGrowth: number;
  };
  topPerformingContent: {
    id: string;
    title: string;
    views: number;
    revenue: number;
    genre?: string;
    rating?: string;
  }[];
};

export enum SmartLinkAccess {
  PUBLIC = "PUBLIC",
  SHARED = "SHARED",
  PRIVATE = "PRIVATE",
  PAYWALL = "PAYWALL",
}

export enum SmartLinkType {
  VIEW = "VIEW",
  VIEW_AND_DOWNLOAD = "VIEW_AND_DOWNLOAD",
}

export enum SmartLinkStatus {
  ALL = "ALL",
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}
export enum MediaStatus {
  UPLOAD_IN_PROGRESS = "UPLOAD_IN_PROGRESS",
  MODERATION_IN_PROGRESS = "MODERATION_IN_PROGRESS",
  UPLOADING_TO_ELUVIO = "UPLOADING_TO_ELUVIO",
  WAITING_TRANSCODING_START = "WAITING_TRANSCODING_START",
  TRANSCODING_IN_PROGRESS = "TRANSCODING_IN_PROGRESS",
  WAITING_FINALIZE_ABR_MEZZANINE_START = "WAITING_FINALIZE_ABR_MEZZANINE_START",
  FINALIZE_ABR_MEZZANINE_IN_PROGRESS = "FINALIZE_ABR_MEZZANINE_IN_PROGRESS",
  READY = "READY",
  ERROR = "ERROR",
}

export type ISmartLink = {
  id: string;
  name: string;
  mediaId: string;
  slug: string;
  access: SmartLinkAccess;
  typeOfAccess: SmartLinkType;
  emails?: string[];
  price?: number;
  currency?: string;
  companyId: string;
  collectEmail?: boolean;
  collectName?: boolean;
  collectPhone?: boolean;
  collectedData?: JSON;
  description?: string;
  maxViewsEnabled?: boolean;
  maxViews?: number;
  expiresAtEnabled?: boolean;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  media?: IMedia;
  status: SmartLinkStatus;
  watermark?: string;
  thumbnail?: string;
  subHeader?: string;
  pricingName?: string;
  companyLogo?: string;
  playbookContent?: string;
  regionalPricing?: IRegionalPricing[];
  allowedCountries?: string[];
  totalClicks?: number;
  totalViews?: number;
  totalRevenue?: number;
  backgroundColor?: string;
  backgroundUrl?: string;
  conversionRate?: number;
  shares?: number;
  views30d?: number;
  ageRating?: string;
  buttonText: string;
  showTrailerButton: boolean;
  trailerLink?: string;
  trailerAutoplay?: boolean;
  showFilmButton: boolean;
  filmLink?: string;
  // Rental Configuration
  rentalPrice?: number;
  rentalPeriodDays?: number;
  rentalMaxViews?: number;
  rentalViewingWindowHours?: number;
  globalSettingsOverride?: boolean;
  clipStart?: number;
  clipEnd?: number;
};

export type IRegionalPricing = {
  continent: string;
  currency: string;
  price: number | undefined;
  rentalPrice?: number;
};

export type SmartlinksAnalytics = {
  totalLinks: number;
  publicLinks: number;
  sharedLinks: number;
  privateLinks: number;
  paywallLinks: number;
  totalClicks: number;
  totalRevenue: number;
  conversionRate: number;
};

export type SmartRoomsAnalytics = {
  totalRooms: number;
  publicRooms: number;
  sharedRooms: number;
  privateRooms: number;
  paywallRooms: number;
  totalLinks: number;
  totalClicks: number;
  totalRevenue: number;
  conversionRate: number;
};

export enum SmartRoomStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  DRAFT = "DRAFT",
}

export type ISmartRoom = {
  id: string;
  name: string;
  description?: string;
  slug: string;
  companyId: string;
  userId: string;
  access: SmartLinkAccess;
  typeOfAccess: SmartLinkType;
  emails?: string[];
  price?: number;
  currency?: string;
  collectEmail?: boolean;
  collectName?: boolean;
  collectPhone?: boolean;
  maxViewsEnabled?: boolean;
  maxViews?: number;
  expiresAtEnabled?: boolean;
  expiresAt?: string;
  status: SmartRoomStatus;
  allowedCountries?: string[];
  backgroundUrl?: string;
  backgroundColor?: string;
  thumbnail?: string;
  pricingName?: string;
  subHeader?: string;
  companyLogo?: string;
  playbookContent?: string;
  watermark?: string;
  ageRating?: string;
  embedStyle?: EmbedStyle;
  buttonText?: string;
  showTrailerButton: boolean;
  trailerLink?: string;
  showFilmButton: boolean;
  filmLink?: string;
  rentalPrice?: number;
  rentalPeriodDays?: number;
  rentalMaxViews?: number;
  rentalViewingWindowHours?: number;
  globalSettingsOverride?: boolean;
  regionalPricing?: IRegionalPricing[];
  stripeProductId?: string;
  stripePriceId?: string;
  rentalStripeProductId?: string;
  rentalStripePriceId?: string;
  isRecurring?: boolean;
  subscriptionInterval?: "month" | "year";
  subscriptionStripeProductId?: string;
  subscriptionStripePriceId?: string;
  createdAt: string;
  updatedAt: string;
  smartLinks?: ISmartLink[];
  mediaIds?: string[];
};

export type ISettings = {
  id: string;
  userId: string;
  defaultRentalPeriodDays: number;
  defaultRentalMaxViews?: number | null;
  defaultRentalViewingWindowHours: number;
  createdAt: string;
  updatedAt: string;
};

export interface IContentFabricFile {
  path: string;
  mime_type: string;
  size: any;
  data: File;
  presignedUrl?: string;
  uploadId?: string; // For multipart uploads
  key?: string; // For multipart uploads
}

export type IContentFabricUploadMetadata = Pick<
  IContentFabricFile,
  "path" | "mime_type" | "size"
>;

export interface IMediaUploadTokenRequest {
  title?: string;
  description?: string;
  contentType?: ContentType;
}

export interface IMediaUploadTokenResponse {
  bucket: string;
  keyPrefix: string;
  region: string;
  credentials: {
    accessKeyId: string;
    secretAccessKey: string;
    sessionToken: string;
    expiration: string;
  };
}

export interface IMediaCastMember {
  id?: string;
  name: string;
  characterName?: string;
  image?: string;
}

export interface IMediaSocialLink {
  id?: string;
  platform: string;
  url: string;
  handle?: string;
}

export interface IMedia {
  id: string;
  name: string;
  cfMasterHash: string;
  cfMezzanineHash?: string;
  cfWriteToken: string;
  cfMasterObjectId: string;
  cfMezzanineObjectId?: string;
  cfLibraryId: string;
  cfMasterName?: string;
  cfMezzanineName?: string;
  cfNode: string;
  cfThumbnail?: string;
  companyId: string;
  userId: string;
  enabled: boolean;
  status: MediaStatus;
  error?: any;
  timeLeftInSeconds: number;
  checkLroAttempts?: number | null;
  checkMezzanineObjectAttempts?: number | null;
  createdAt: string;
  updatedAt: string;
  mediaMetadataId: string | null;
  sourceId?: string | null;
  metadata?: IMediaMetadata | null;
  company?: ICompany;
  signedToken?: string;
  source?: {
    id: string;
    name: string;
    size: number;
    mimeType: string;
    duration: number;
    height: number;
    width: number;
    aspectRatio: string;
    codecName: string;
    mediaId: string;
    createdAt: string;
    updatedAt: string;
  };
  versions: IMediaVersion[];
  totalViews?: number;
  tags?: string[];
  castMembers?: IMediaCastMember[];
  socialLinks?: IMediaSocialLink[];
  copyrightDetails?: string;
  imdbLink?: string;
  rottenTomatoesLink?: string;
  eidrCode?: string;
  isanCode?: string;
  associatedContent?: IMediaRelationship[];
  relatedContent?: IMediaRelationship[];
}
export enum AssociatedContentType {
  PROMO = "PROMO",
  COMMERCIAL = "COMMERCIAL",
  TRAILER = "TRAILER",
  BONUS_CLIP = "BONUS_CLIP",
  BTS = "BTS",
}
// Media Content Relationship
export interface IMediaRelationship {
  id: string;
  sourceMediaId: string;
  targetSmartLinkId: string; // Changed from targetMediaId to targetSmartLinkId
  relationshipType: ContentRelationshipType;
  associatedType?: AssociatedContentType; // Required for ASSOCIATED relationships
  createdAt: string;
  updatedAt: string;
  targetSmartLink?: ISmartLink; // Populated when fetching relationships (changed from targetMedia)
}

export interface IMediaVersion {
  id: string;
  cfMasterHash: string;
  changedFields: any;
  mediaId: string;
  userId: string;
  user: IUser;
  createdAt: string;
  updatedAt: string;
}

export interface IMediaMetadata {
  title: string;
  description: string;
  contentType: string;
  rating: string;
  episodicContent: boolean;
  seasonNumber?: number;
  episodeNumber?: number;
  duration: string;
  releaseDate: string;
  originalLanguage: string;
  genre: string[];
  cast: string[];
  productionCompany: string;
  crew: IMediaMetadataCrew[];
  // Feature & Documentary fields
  edition?: string;
  cut?: string;
  awards?: string;
  franchiseCollection?: string;
  // Episode fields
  seriesTitle?: string;
  episodeCode?: string;
  showRunner?: string;
  // Trailer/Promo fields
  parentTitleId?: string;
  cutType?: string;
  ratingBureauCode?: string;
  // Commercial fields
  advertiser?: string;
  campaignName?: string;
  adIdClearcastCode?: string;
  durationCuts?: string;
  agency?: string;
  // Sports fields
  sport?: string;
  competitionLeague?: string;
  teams?: string;
  venue?: string;
  eventType?: string;
  // Podcast fields
  showId?: string;
  hosts?: string[];
  guests?: string[];
  audioOnlyFlag?: boolean;
  explicitFlag?: boolean;
}

export interface IMediaMetadataCrew {
  position: string;
  name: string;
}
export enum CompanyRole {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
  COLLABORATOR = "COLLABORATOR",
}
export interface IUser {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  location?: string;
  bio?: string;
  id?: string;
  company?: {
    id: string;
    role: CompanyRole;
    permissions?: string[]; // Custom permissions for COLLABORATOR role
    expiresAt?: string; // Expiry date for COLLABORATOR role
  };
  cfAddress?: string;
  role?: string;
  image?: string;
  isSubscribed?: boolean;
  referralCode?: string;
}

export interface ICompany {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  logo?: string;
  cfLibraryId: string;
  cfStaticsObjectId: string;
  stripeAccountId?: string;
  stripeOnboarding?: boolean;
  isPublic: boolean;
  type?: CompanyType;
  description?: string;
  isSubscribed?: boolean;
}

export interface ICompanyUpdateDto {
  id: string;
  name: string;
  website: string;
  cfLogo?: string;
  isPublic: boolean;
}

export enum CompanyType {
  PRODUCTION_COMPANY = "PRODUCTION_COMPANY",
  CONTENT_CREATOR = "CONTENT_CREATOR",
  MUSIC_PRODUCTION = "MUSIC_PRODUCTION",
  DISTRIBUTOR = "DISTRIBUTOR",
  BRAND = "BRAND",
  OTHER = "OTHER",
}

interface IContentFabricObject {
  id: string;
  writeToken: string;
  node: string;
  authorizationToken: string;
  libraryId: string;
}

export interface IContentObject {
  id: string;
  video: IContentFabricFile;
}

export interface IPaginationResult<T> {
  continuationToken?: number;
  perPage: number;
  items: T[];
}

export interface IUploadQueueItem {
  title: string;
  date: Date | string;
  size: number;
  uploadedSize?: number;
  format: string;
  uploadedBy: string;
  source: string;
  status: MediaStatus;
  id: string;
  error?:
  | {
    type?: string;
    message?: string;
    details?: any;
  }
  | string;
}

export interface IUploadQueueResponse {
  items: IUploadQueueItem[];
  continuationToken?: number;
}
export interface IMediaAnalytics {
  id?: string;
  mediaId: string;
  companyId: string;
  totalViews: number;
  averageViewDuration: number;
  totalWatchTime: number;
  uniqueViewers: number;
  uniqueViewersChange: number;
  watchTimeChange: number;
  viewDurationChange: number;
  viewsChange: number;
}
export interface IObject {
  id: string;
  libraryId: string;
  node: string;
  writeToken: string;
  authorizationToken: string;
}

export interface ICreateObject {
  mediaId?: string;
  companyId?: string;
}

export interface IFinalizeObject {
  mediaId?: string;
  companyId?: string;
  libraryId: string;
  node: string;
  writeToken: string;
  asset: string;
  files: string[];
}

export interface ICompanyAnalytics {
  id?: string;
  companyId: string;
  currentMonthEarnings: number;
  currentMonthUniqueViewers: number;
  currentMonthViews: number;
  currentMonthWatchTime: number;
  earningsChange: number;
  previousMonthEarnings: number;
  previousMonthUniqueViewers: number;
  previousMonthViews: number;
  previousMonthWatchTime: number;
  totalEarnings: number;
  totalViews: number;
  totalWatchTime: number;
  uniqueViewers: number;
  uniqueViewersChange: number;
  viewsChange: number;
  watchTimeChange: number;
  viewsChart?: {
    date: string;
    views: number;
    public?: number;
    shared?: number;
    private?: number;
    paywall?: number;
  }[];
  countriesData?: {
    country: string;
    code: string;
    totalViews: number;
    viewDuration: number;
    uniqueViews: number;
  }[];
  devicesData?: {
    name: string;
    value: number;
    fill: string;
    views: number;
  }[];
  sourcesData?: {
    name: string;
    uniqueViews: number;
    viewDuration: number;
    totalViews: number;
  }[];
  topSmartLinks: {
    id: string;
    name: string;
    clicks: number;
    type: SmartLinkAccess;
    revenue: number;
    thumbnail: string;
  }[];
}

export interface ICompanyAnalyticsFilters {
  dateRange?: string;
  contentType?: string;
  source?: string;
  device?: string;
  country?: string;
  mediaId?: string;
  type: string;
}

export interface IRevenue {
  id?: string;
  userId: string;
  companyId: string;
  smartlinkId: string;
  smartlinkThumbnail: string;
  smartlinkName: string;
  quantity: number;
  price: number;
  revenue: number;
}

export interface IWatch {
  id: string;
  isDeleted: boolean;
  daysToDownload: number;
  type: SmartLinkAccess;
  displayName: string;
  subHeader?: string;
  rating?: string;
  companyLogo?: string;
  companyName?: string;
  offering?: string;
  hash?: string;
  authentication: boolean;
  price: number;
  currency: string;
  token?: string;
  thumbnail: string;
  cfThumbnail?: string;
  backgroundUrl?: string;
  backgroundColor?: string;
  duration: string;
  totalViews: number;
  year: number;
  language?: string;
  genres: string[];
  clipStart?: number;
  clipEnd?: number;
  isDownloadable: boolean;
  requiredDetails: string[];
  embedStyle: EmbedStyle;
  buttonText: string;
  trailerLink?: string;
  filmLink?: string;
  rentalPrice?: number;
  contentType?: string;
  cast?: IMediaCastMember[];
  crew?: CrewMember[];
  socialLinks?: IMediaSocialLink[];
  copyrightDetails?: string;
  imdbLink?: string;
  rottenTomatoesLink?: string;
  eidrCode?: string;
  isanCode?: string;
  tags?: string[];
  description?: string;
  audioTracks?: {
    id: string;
    language: string;
    label: string;
  }[];
  subtitles?: {
    id: string;
    language: string;
    label: string;
  }[];
  associatedContent?: {
    type: AssociatedContentType;
    id: string;
    slug: string;
    title: string;
    thumbnail: string;
    duration: string;
  }[];
  poster?: {
    id: string;
    url: string;
    filename: string;
  }[];
}

export enum EmbedStyle {
  DEFAULT = "DEFAULT",
  PLAY_BUTTON_ONLY = "PLAY_BUTTON_ONLY",
}

export type MediaStats = {
  totalFiles: {
    value: number;
    change: number;
  };
  totalViews: {
    value: number;
    change: number;
  };
  published: {
    value: number;
    change: number;
  };
};

export enum ContentType {
  COMMERCIAL = "commercial",
  DOCUMENTARY = "documentary",
  EPISODE = "episode",
  FEATURE = "feature",
  PROMO = "promo",
  TRAILER = "trailer",
  INTERVIEW = "interview",
  SHORT_FILM = "short film",
  PODCAST = "podcast",
  SPORTS = "sports",
}

export enum Genre {
  ACTION = "action",
  COMEDY = "comedy",
  DRAMA = "drama",
  HORROR = "horror",
  SCI_FI_AND_FANTASY = "sci-fi & fantasy",
  SPORTS = "sports",
  THRILLER = "thriller",
  DOCUMENTARY = "documentary",
  ANIMATION = "animation",
  MUSICAL_AND_PERFORMANCE = "musical & performance",
  FAMILY = "family",
  MYSTERY = "mystery",
  SHORT_FILM = "short film",
  EXPERIMENTAL = "experimental",
  BIOPIC = "biopic",
}

export interface IAccountPurchase {
  id: string;
  media: {
    name: string;
    cfthumbnail: string;
  };
  purchasedOn: Date;
  unitPrice: number;
}

export interface IMediaPurchase {
  id: string;
  media: {
    name: string;
    cfThumbnail: string;
  };
  slug: string;
  datePurchased: Date;
  unitPrice: number;
}

// Wallet API Types
export interface WalletSummary {
  totalPurchases: number;
  activeRentals: number;
  expiringSoonCount: number;
}

export interface IAccountRoomPurchase {
  id: string;
  roomId: string;
  name: string;
  description?: string;
  slug: string;
  thumbnail?: string;
  backgroundUrl?: string;
  datePurchased: Date | string;
  unitPrice: number;
  currency: string;
  publisher: {
    id: string;
    name: string;
    logo?: string;
  };
  itemCount: number;
}

export interface AccountPurchase {
  id: string;
  media: {
    name: string;
    cfThumbnail: string;
    format?: string; // "HD", "4K", or undefined
    contentType?: string; // "film", "series", "short", etc.
    genres?: string[]; // Array of genre strings
  };
  slug: string;
  datePurchased: string; // ISO 8601 date string
  unitPrice: number;
  currency: string; // Currency code (e.g., "USD")
  publisher: {
    id: string; // Company/Publisher ID
    name: string; // Publisher name
    logo?: string; // Publisher logo URL (optional)
  };
  type: "PURCHASE" | "RENTAL";

  // Rental-specific fields (only present for rentals)
  expiresAt?: string; // ISO 8601 date string
  viewingWindowExpiresAt?: string; // ISO 8601 date string
  timeRemainingSeconds?: number; // Seconds until expiry
  expiringSoon?: boolean; // true if expires within 24 hours

  // Continue watching (if available)
  continueWatching?: {
    position: number; // Last watched position in seconds
    totalDuration: number; // Total duration in seconds
    percentage: number; // Percentage watched (0-100)
    lastWatchedAt: string; // ISO 8601 date string
  };
}

export interface PaginatedPurchasesResponse {
  items: AccountPurchase[];
  continuationToken?: number; // Present if more pages available
  perPage: number;
}

export interface PaginatedRoomPurchasesResponse {
  items: IAccountRoomPurchase[];
  perPage: number;
}

export type PackagePaymentType = "one-time" | "recurring";

export enum Feature {
  VIDEO_STORAGE = "VIDEO_STORAGE",
  ASSET_STORAGE = "ASSET_STORAGE",
  STREAMING_HOURS = "STREAMING_HOURS",
}

export interface IFeatureUsage {
  total: number;
  used: number;
  package: number;
  topUps: number;
}

export enum PackageType {
  LITE = "LITE",
  CORE = "CORE",
  ADVANCED = "ADVANCED",
}

export enum BillingType {
  MONTHLY = "MONTHLY",
  ANNUAL = "ANNUAL",
}
export interface IPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingType: BillingType;
  paymentType: PackagePaymentType;
  type: PackageType;
  features: {
    feature: Feature;
    value: number;
  }[];
}

export interface IPackagePurchase {
  id?: string;
  companyId: string;
  stripeSubscriptionId: string;
  stripeInvoiceId?: string;
  stripePaymentIntentId?: string;
  dateStart: number;
  dateEnd: number;
  package: IPackage;
  packageId: string;
}

export interface IPackageGrouped {
  [PackageType.LITE]: IPackage[];
  [PackageType.CORE]: IPackage[];
  [PackageType.ADVANCED]: IPackage[];
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: IUser;
}

export enum PayoutSchedule {
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
}

export interface UpdatePayoutScheduleDto {
  schedule: PayoutSchedule;
}

export interface PayoutScheduleResponse {
  schedule: PayoutSchedule;
  message: string;
}

export interface GetPayoutScheduleResponse {
  schedule: "daily" | "weekly" | "monthly" | "manual" | null;
  weeklyAnchor?: string | null;
  monthlyAnchor?: number | null;
}

export interface MonetizationStats {
  totalRevenue: {
    value: number;
    change: number;
  };
  activeSubscribers: {
    value: number;
    change: number;
  };
  conversionRate: {
    value: number;
    change: number;
  };
}

export enum DiscountType {
  PERCENTAGE = "PERCENTAGE",
  FIXED_AMOUNT = "FIXED_AMOUNT",
}

export enum AppliesToType {
  ALL = "ALL",
  SPECIFIC_PRODUCT = "SPECIFIC_PRODUCT",
}

export interface CreateCouponDto {
  code: string;
  name: string;
  description?: string;
  discountType: DiscountType;
  percentOff?: number;
  amountOff?: number;
  currency?: string;
  appliesTo: AppliesToType;
  smartLinkId?: string;
  smartRoomId?: string;
  maxRedemptions?: number;
  maxViewsPerUse?: number;
  expiresAt?: string;
  isActive?: boolean;
}

export interface UpdateCouponDto {
  name?: string;
  description?: string;
  maxRedemptions?: number;
  maxViewsPerUse?: number;
  expiresAt?: string;
  isActive?: boolean;
}

export interface CouponResponse {
  id: string;
  code: string;
  name: string;
  description?: string;
  discountType: DiscountType;
  percentOff?: number;
  amountOff?: number;
  currency?: string;
  appliesTo: AppliesToType;
  smartLinkId?: string;
  smartRoomId?: string;
  maxRedemptions?: number;
  maxViewsPerUse?: number;
  expiresAt?: Date;
  isActive: boolean;
  stripeCouponId?: string;
  stripePromotionCodeId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type PayoutStatus =
  | "paid"
  | "pending"
  | "in_transit"
  | "canceled"
  | "failed";

export interface PayoutHistory {
  id: string;
  amount: number;
  status: PayoutStatus;
  destination: string;
  initiated: string;
  estimatedArrival: string;
  currency: string;
}

export interface PaginationMeta {
  total: number;
  pages: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface PayoutHistoryResponse {
  data: PayoutHistory[];
  meta: PaginationMeta;
}

export type TransactionStatus =
  | "succeeded"
  | "refunded"
  | "failed"
  | "pending"
  | "cancelled";

export type TransactionType = "Purchase" | "Rental" | "Subscription";

export interface TransactionHistory {
  id: string;
  amount: number;
  status: TransactionStatus;
  type: TransactionType;
  customer: string;
  date: string;
  currency: string;
  productType: "smartlink" | "smartroom";
  productName?: string;
  stripePaymentIntentId?: string;
  stripeInvoiceId?: string;
  stripeSubscriptionId?: string;
}

export interface TransactionHistoryResponse {
  data: TransactionHistory[];
  meta: PaginationMeta;
}

export interface RefundTransactionRequest {
  amount?: number;
  reason?: string;
}

export interface RefundTransactionResponse {
  refundId: string;
  amount: number;
  status: string;
  message: string;
}

export interface IUserStats {
  totalViews: number;
  contentPieces: number;
  subscribers: number;
  totalEarnings: number;
}

export interface IUserReferral {
  id: string;
  name: string;
  email: string;
  status: "active" | "inactive";
  joinedDate: string;
  avatar: string;
}

export interface BillingPlanAndPaymentMethods {
  plan: {
    packageId: string;
    name: string;
    price: number;
    currency: string;
    paymentType: string;
    status: string;
    dateStart: Date | null;
    dateEnd: Date | null;
    nextBillingDate: string;
    billingType: BillingType;
    features:
    | {
      feature: Feature;
      value: number;
    }[]
    | null;
  } | null;
  paymentMethods: {
    last4: string;
    brand: string;
    expMonth: number;
    expYear: number;
  }[];
  topUps: {
    id: string;
    name: string;
    price: number;
    currency: string;
    features: {
      feature: Feature;
      value: number;
    }[];
    purchaseDate: Date;
  }[];
}

export interface IBillingInvoice {
  invoiceNumber?: string;
  date: Date;
  plan: string;
  amount: number;
  status: string;
  downloadUrl: string;
  currency: string;
}

export interface IUsage {
  total: number;
  used: number;
  package: number;
  topUps: number;
}

export interface ICRMAnalytics {
  totalContacts: number;
  publicContacts: number;
  privateContacts: number;
  sharedContacts: number;
  paywallContacts: number;
  premiumContacts: number;
  totalClicks: number;
  totalRevenue: number;
  conversionRate: number;
  averageEngagement: number;
}

export interface ICRMContact {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  location: string | null;
  totalClicks: number;
  totalViewDuration: number;
  engagementLevel: "Low" | "Medium" | "High";
  isPaying: boolean;
  device: string;
  country: string;
}

export interface IContactDetails {
  avatar?: string;
  name: string;
  email: string;
  status: string;
  phone?: string;
  contentItems: number;
  totalViews: number;
  userId: string;
  joinDate: string;
  lastActive: string;
  totalEarnings: number;
}

export interface ISmartLinkWatched {
  smartLinkId: string;
  content: string;
  duration: string;
  views: number;
  country: string;
  completion: number;
  lastWatched: string;
}

export interface IPaginationMeta {
  total: number;
  pages: number;
  page: number;
  limit: number;
}

export interface IPaginatedSmartLinksWatched {
  data: ISmartLinkWatched[];
  meta: IPaginationMeta;
}

export interface IRevenueHistory {
  smartLinkId: string;
  content: string;
  type: string;
  amount: string;
  views: number;
  purchaseDate: string;
  lastWatched: string;
}

export interface IPaginatedRevenueHistory {
  data: IRevenueHistory[];
  meta: IPaginationMeta;
}

// Page-based pagination (for members and invitations)
export interface IPaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Invitation Types
export interface IInvitation {
  id: string;
  email: string;
  role: CompanyRole;
  companyId: string;
  expiresAt: string;
  createdAt: string;
  acceptedAt?: string;
  revokedAt?: string;
  customPermissions?: string[];
  memberExpiresAt?: string;
}

export interface IInvitationPreview {
  companyName: string;
  role: CompanyRole;
  expiresAt: string;
  isValid: boolean;
  customPermissions?: string[];
  memberExpiresAt?: string;
}

export interface ICreateInvitationRequest {
  email: string;
  role: CompanyRole;
  note?: string;
  customPermissions?: string[];
  memberExpiresAt?: string;
}

export interface ICompanyMember {
  id: string;
  userId: string;
  companyId: string;
  role: CompanyRole;
  customPermissions?: Permission[];
  expiresAt?: string;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    image?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Super Admin Grant Types
export interface ISuperAdminGrant {
  id: string;
  superAdminUserId: string;
  companyId: string;
  status: "PENDING" | "APPROVED" | "REVOKED";
  reason?: string;
  requestedAt: string;
  approvedAt?: string;
  approvedByOwnerUserId?: string;
}

export interface ICreateGrantRequest {
  reason: string;
}

export interface IApproveGrantRequest {
  reason?: string;
}

// Company Switcher Types
export interface IUserCompany {
  id: string;
  companyId: string;
  companyName: string;
  role: CompanyRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  companyLogo?: string;
}

export interface IUserCompaniesResponse {
  companies: IUserCompany[];
  activeCompanyId: string | null;
}

export interface IActivateCompanyResponse {
  success: boolean;
  message: string;
  companyId: string;
  companyName: string;
}

export enum ApiKeyType {
  TEST = "test",
  LIVE = "live",
}

export interface CreateApiKeyDto {
  type: ApiKeyType;
  name?: string;
  scopes?: string[];
}

export interface ApiKeyResponseDto {
  id: string;
  keyPrefix: "hwy_test" | "hwy_live";
  name: string;
  scopes: string[];
  lastUsedAt: string | null;
  createdAt: string;
  revokedAt: string | null;
  expiresAt: string | null;
}

export interface CreateApiKeyResponseDto extends ApiKeyResponseDto {
  apiKey: string;
}

export interface RevokeApiKeyResponse {
  success: boolean;
  message: string;
}
