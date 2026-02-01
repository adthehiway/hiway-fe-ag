import { IUser, IMedia, CompanyRole, MediaStatus, PackageType, BillingType, Feature, IPackageGrouped } from "@/types";

// Mock user data
export const mockUser: IUser = {
  id: "mock-user-123",
  email: "adam@hiway.com",
  firstName: "Adam",
  lastName: "Greenwood",
  username: "demouser",
  phone: "+1 555 123 4567",
  location: "Los Angeles, CA",
  bio: "Content creator and media enthusiast",
  role: "USER",
  company: {
    id: "mock-company-123",
    role: CompanyRole.OWNER,
  },
  isSubscribed: true,
  referralCode: "DEMO123",
  image: "/images/default.png",
};

// Mock user companies list (for company switcher)
export const mockUserCompanies = [
  {
    id: "mock-company-123",
    name: "Demo Productions",
    logo: null,
    role: CompanyRole.OWNER,
  },
  {
    id: "mock-company-456",
    name: "Creative Studios",
    logo: null,
    role: CompanyRole.ADMIN,
  },
  {
    id: "mock-company-789",
    name: "Media House",
    logo: null,
    role: CompanyRole.MEMBER,
  },
];

// Mock dashboard overview data
export const mockDashboardOverview = {
  recentMedia: {
    id: "media-1",
    title: "Sample Video",
    description: "A sample video for UI development",
    thumbnail: "/images/thumbnail.jpg",
    cfThumbnail: "/images/thumbnail.jpg",
    metadata: {
      title: "Getting Started with Hiway",
      description: "Learn the basics of content creation and distribution on the Hiway platform",
    },
    source: {
      duration: 1847, // ~30 minutes
    },
    status: "READY",
    totalViews: 1250,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as IMedia,
  analytics: [
    { key: "totalViews", value: 12450, change: 12.5 },
    { key: "totalRevenue", value: 8750, change: 8.3 },
    { key: "subscribers", value: 1250, change: 15.2 },
    { key: "watchTime", value: 45600, change: 5.7 },
  ],
  revenueOverview: {
    currentMonth: { label: "January", value: 2850, change: 12.5 },
    monthly: [
      { label: "Aug", value: 1800 },
      { label: "Sep", value: 2100 },
      { label: "Oct", value: 1950 },
      { label: "Nov", value: 2400 },
      { label: "Dec", value: 2650 },
      { label: "Jan", value: 2850 },
    ],
    projectedAnnual: 32000,
    avgMonthly: 2290,
    avgGrowth: 8.5,
  },
  topPerformingContent: [
    { id: "1", title: "Getting Started with Hiway", views: 5420, revenue: 1250, genre: "Tutorial", rating: "4.8" },
    { id: "2", title: "Advanced Content Creation", views: 3890, revenue: 980, genre: "Education", rating: "4.6" },
    { id: "3", title: "Monetization Strategies", views: 2750, revenue: 720, genre: "Business", rating: "4.9" },
    { id: "4", title: "Building Your Audience", views: 2100, revenue: 540, genre: "Marketing", rating: "4.5" },
    { id: "5", title: "Live Streaming Tips", views: 1890, revenue: 450, genre: "Tutorial", rating: "4.7" },
  ],
};

// Mock media list
export const mockMediaList: IMedia[] = [
  {
    id: "media-1",
    title: "Getting Started with Hiway",
    description: "Learn the basics of content creation",
    thumbnail: "/images/thumbnail.jpg",
    cfThumbnail: "/images/thumbnail.jpg",
    metadata: {
      title: "Getting Started with Hiway",
      description: "Learn the basics of content creation",
    },
    source: { duration: 1847 },
    status: MediaStatus.READY,
    totalViews: 5420,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  } as IMedia,
  {
    id: "media-2",
    title: "Advanced Techniques",
    description: "Take your content to the next level",
    thumbnail: "/images/thumbnail.jpg",
    cfThumbnail: "/images/thumbnail.jpg",
    metadata: {
      title: "Advanced Techniques",
      description: "Take your content to the next level",
    },
    source: { duration: 2456 },
    status: MediaStatus.READY,
    totalViews: 3890,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
  } as IMedia,
  {
    id: "media-3",
    title: "Monetization Guide",
    description: "How to earn from your content",
    thumbnail: "/images/thumbnail.jpg",
    cfThumbnail: "/images/thumbnail.jpg",
    metadata: {
      title: "Monetization Guide",
      description: "How to earn from your content",
    },
    source: { duration: 1234 },
    status: MediaStatus.READY,
    totalViews: 2750,
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    updatedAt: new Date(Date.now() - 259200000).toISOString(),
  } as IMedia,
];

// Mock company data
export const mockCompany = {
  id: "mock-company-123",
  name: "Demo Productions",
  description: "A demo company for UI development",
  logo: "/images/logo.png",
  stripeOnboarding: true,
  createdAt: new Date().toISOString(),
};

// Mock user stats
export const mockUserStats = {
  totalViews: 12450,
  contentPieces: 24,
  subscribers: 1250,
  totalEarnings: 8750,
};

// Mock referrals
export const mockReferrals = [
  { id: "ref-1", email: "user1@example.com", status: "active", createdAt: new Date().toISOString() },
  { id: "ref-2", email: "user2@example.com", status: "pending", createdAt: new Date().toISOString() },
];

// Mock company members
export const mockCompanyMembers = {
  items: [
    {
      id: "member-1",
      userId: "mock-user-123",
      user: { ...mockUser },
      role: CompanyRole.OWNER,
      permissions: ["all"],
      createdAt: new Date().toISOString(),
    },
    {
      id: "member-2",
      userId: "user-2",
      user: {
        id: "user-2",
        email: "jane@example.com",
        firstName: "Jane",
        lastName: "Smith",
        image: null,
      },
      role: CompanyRole.ADMIN,
      permissions: ["media:read", "media:write", "smartlinks:read", "smartlinks:write"],
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
  ],
  total: 2,
  page: 1,
  limit: 20,
  totalPages: 1,
};

// Mock company invitations
export const mockCompanyInvitations = {
  items: [
    {
      id: "invite-1",
      email: "newuser@example.com",
      role: CompanyRole.MEMBER,
      status: "PENDING",
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      expiresAt: new Date(Date.now() + 5 * 86400000).toISOString(),
    },
  ],
  total: 1,
  page: 1,
  limit: 20,
  totalPages: 1,
};

// Mock API keys
export const mockApiKeys = [
  {
    id: "key-1",
    name: "Production API Key",
    keyPrefix: "hwy_live",
    scopes: ["read:media"],
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    lastUsedAt: new Date(Date.now() - 86400000).toISOString(),
    revokedAt: null,
  },
  {
    id: "key-2",
    name: "Development Key",
    keyPrefix: "hwy_test",
    scopes: ["read:media"],
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    lastUsedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    revokedAt: null,
  },
];

// Mock billing plan
export const mockBillingPlan = {
  plan: {
    id: "plan-pro",
    name: "Pro Plan",
    price: 49,
    currency: "USD",
    billingType: "monthly",
    features: [
      "Unlimited uploads",
      "Advanced analytics",
      "Priority support",
      "Custom branding",
    ],
  },
  nextBillingDate: new Date(Date.now() + 15 * 86400000).toISOString(),
  paymentMethods: [
    {
      id: "pm-1",
      brand: "visa",
      last4: "4242",
      expiryMonth: 12,
      expiryYear: 2026,
      isDefault: true,
    },
  ],
};

// Mock billing invoices
export const mockBillingInvoices = [
  {
    id: "inv-1",
    number: "INV-2024-001",
    amount: 49,
    currency: "USD",
    status: "paid",
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    paidAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    pdfUrl: "#",
  },
  {
    id: "inv-2",
    number: "INV-2024-002",
    amount: 49,
    currency: "USD",
    status: "paid",
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    paidAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    pdfUrl: "#",
  },
];

// Mock billing usage
export const mockBillingUsage = {
  package: 100,
  topUps: 0,
  used: 45,
};

// Mock monetization stats
export const mockMonetizationStats = {
  totalRevenue: { value: 8750, change: 12.5 },
  activeSubscribers: { value: 1250, change: 85 },
  conversionRate: { value: 4.2, change: 0.8 },
  totalPayouts: 6500,
  pendingPayouts: 1250,
  lastPayoutDate: new Date(Date.now() - 7 * 86400000).toISOString(),
  monthlyRevenue: [
    { month: "Aug", revenue: 1200 },
    { month: "Sep", revenue: 1450 },
    { month: "Oct", revenue: 1380 },
    { month: "Nov", revenue: 1620 },
    { month: "Dec", revenue: 1850 },
    { month: "Jan", revenue: 1250 },
  ],
};

// Mock payout schedule
export const mockPayoutSchedule = {
  schedule: "monthly",
  nextPayoutDate: new Date(Date.now() + 20 * 86400000).toISOString(),
  minimumPayout: 50,
  payoutMethod: {
    type: "bank_transfer",
    accountLast4: "6789",
    bankName: "Chase Bank",
  },
};

// Mock coupons
export const mockCoupons = [
  {
    id: "coupon-1",
    code: "SUMMER25",
    discountType: "percentage",
    discountValue: 25,
    usageCount: 45,
    maxUsage: 100,
    expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
    isActive: true,
  },
  {
    id: "coupon-2",
    code: "FLAT10",
    discountType: "fixed",
    discountValue: 10,
    usageCount: 12,
    maxUsage: null,
    expiresAt: null,
    isActive: true,
  },
];

// Mock smartlinks
export const mockSmartlinks = {
  items: [
    {
      id: "sl-1",
      title: "Getting Started Guide",
      slug: "getting-started",
      access: "PUBLIC",
      status: "ACTIVE",
      views: 1250,
      revenue: 450,
      media: { id: "media-1", title: "Getting Started with Hiway" },
      createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    },
    {
      id: "sl-2",
      title: "Premium Tutorial",
      slug: "premium-tutorial",
      access: "PRIVATE",
      status: "ACTIVE",
      views: 890,
      revenue: 320,
      media: { id: "media-2", title: "Advanced Techniques" },
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    },
    {
      id: "sl-3",
      title: "Exclusive Content",
      slug: "exclusive-content",
      access: "PRIVATE",
      status: "ACTIVE",
      views: 540,
      revenue: 180,
      media: { id: "media-3", title: "Monetization Guide" },
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
  ],
  total: 3,
  continuationToken: null,
};

// Mock smartlinks analytics
export const mockSmartlinksAnalytics = {
  totalSmartlinks: 12,
  totalViews: 15680,
  totalRevenue: 4250,
  avgViewsPerLink: 1307,
  topPerforming: [
    { id: "sl-1", title: "Getting Started Guide", views: 1250, revenue: 450 },
    { id: "sl-2", title: "Premium Tutorial", views: 890, revenue: 320 },
  ],
};

// Mock smartrooms
export const mockSmartrooms = {
  items: [
    {
      id: "sr-1",
      title: "Tutorial Collection",
      slug: "tutorials",
      access: "PUBLIC",
      mediaCount: 5,
      views: 2340,
      revenue: 780,
      createdAt: new Date(Date.now() - 21 * 86400000).toISOString(),
    },
    {
      id: "sr-2",
      title: "Premium Series",
      slug: "premium-series",
      access: "PRIVATE",
      mediaCount: 8,
      views: 1560,
      revenue: 1250,
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    },
  ],
  total: 2,
  continuationToken: null,
};

// Mock smartrooms analytics
export const mockSmartRoomsAnalytics = {
  totalRooms: 5,
  totalViews: 8920,
  totalRevenue: 2830,
  avgViewsPerRoom: 1784,
};

// Mock CRM analytics
export const mockCRMAnalytics = {
  totalContacts: 1250,
  newContactsThisMonth: 85,
  activeContacts: 420,
  totalRevenue: 8750,
  avgRevenuePerContact: 7,
  topCountries: [
    { country: "United States", count: 450 },
    { country: "United Kingdom", count: 180 },
    { country: "Canada", count: 120 },
  ],
};

// Mock CRM contacts
export const mockCRMContacts = {
  items: [
    {
      id: "contact-1",
      email: "viewer1@example.com",
      firstName: "John",
      lastName: "Viewer",
      totalSpent: 125,
      lastActivity: new Date(Date.now() - 2 * 86400000).toISOString(),
      createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    },
    {
      id: "contact-2",
      email: "viewer2@example.com",
      firstName: "Sarah",
      lastName: "Fan",
      totalSpent: 89,
      lastActivity: new Date(Date.now() - 5 * 86400000).toISOString(),
      createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
    },
    {
      id: "contact-3",
      email: "viewer3@example.com",
      firstName: "Mike",
      lastName: "Subscriber",
      totalSpent: 250,
      lastActivity: new Date(Date.now() - 1 * 86400000).toISOString(),
      createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
    },
  ],
  total: 1250,
  continuationToken: null,
};

// Mock company analytics
export const mockCompanyAnalytics = {
  totalViews: 45680,
  totalRevenue: 12450,
  totalWatchTime: 125000,
  uniqueViewers: 3250,
  earningsChange: 12.5,
  watchTimeChange: 8.3,
  uniqueViewersChange: 15.2,
  viewsChange: 10.7,
  viewsByDay: [
    { date: "2024-01-25", views: 1250 },
    { date: "2024-01-26", views: 1380 },
    { date: "2024-01-27", views: 1420 },
    { date: "2024-01-28", views: 1180 },
    { date: "2024-01-29", views: 1560 },
    { date: "2024-01-30", views: 1290 },
    { date: "2024-01-31", views: 1450 },
  ],
  revenueByDay: [
    { date: "2024-01-25", revenue: 320 },
    { date: "2024-01-26", revenue: 450 },
    { date: "2024-01-27", revenue: 380 },
    { date: "2024-01-28", revenue: 290 },
    { date: "2024-01-29", revenue: 520 },
    { date: "2024-01-30", revenue: 410 },
    { date: "2024-01-31", revenue: 480 },
  ],
  topContent: [
    { id: "media-1", title: "Getting Started", views: 5420, revenue: 1250 },
    { id: "media-2", title: "Advanced Tips", views: 3890, revenue: 980 },
    { id: "media-3", title: "Pro Techniques", views: 2750, revenue: 720 },
  ],
};

// Mock media stats
export const mockMediaStats = {
  total: 24,
  ready: 18,
  processing: 3,
  failed: 1,
  draft: 2,
};

// Mock upload queue
export const mockUploadQueue = {
  items: [],
  total: 0,
  continuationToken: null,
};

// Mock storage details
export const mockStorageDetails = {
  total: 50 * 1024 * 1024 * 1024, // 50GB
  used: 12 * 1024 * 1024 * 1024, // 12GB
  remaining: 38 * 1024 * 1024 * 1024, // 38GB
  inProgress: 0,
  usedPercentage: 24,
};

// Mock 2FA status
export const mock2FAStatus = {
  enabled: false,
  methods: [],
};

// Mock settings
export const mockSettings = {
  defaultAccess: "PRIVATE",
  defaultPricing: null,
  watermarkEnabled: false,
  analyticsEnabled: true,
  defaultRentalPeriodDays: 7,
  defaultRentalMaxViews: null,
  defaultRentalViewingWindowHours: 48,
};

// Mock packages data for plan selection
export const mockPackages: IPackageGrouped = {
  [PackageType.LITE]: [
    {
      id: "pkg-lite-monthly",
      name: "Starter",
      description: "Perfect for individuals just getting started",
      price: 0,
      currency: "USD",
      billingType: BillingType.MONTHLY,
      paymentType: "recurring",
      type: PackageType.LITE,
      features: [
        { feature: Feature.VIDEO_STORAGE, value: 5 * 1024 * 1024 * 1024 }, // 5GB
        { feature: Feature.ASSET_STORAGE, value: 1 * 1024 * 1024 * 1024 }, // 1GB
        { feature: Feature.STREAMING_HOURS, value: 10 },
      ],
    },
    {
      id: "pkg-lite-annual",
      name: "Starter",
      description: "Perfect for individuals just getting started",
      price: 0,
      currency: "USD",
      billingType: BillingType.ANNUAL,
      paymentType: "recurring",
      type: PackageType.LITE,
      features: [
        { feature: Feature.VIDEO_STORAGE, value: 5 * 1024 * 1024 * 1024 },
        { feature: Feature.ASSET_STORAGE, value: 1 * 1024 * 1024 * 1024 },
        { feature: Feature.STREAMING_HOURS, value: 10 },
      ],
    },
  ],
  [PackageType.CORE]: [
    {
      id: "pkg-core-monthly",
      name: "Pro",
      description: "Advanced features for growing creators",
      price: 49,
      currency: "USD",
      billingType: BillingType.MONTHLY,
      paymentType: "recurring",
      type: PackageType.CORE,
      features: [
        { feature: Feature.VIDEO_STORAGE, value: 50 * 1024 * 1024 * 1024 }, // 50GB
        { feature: Feature.ASSET_STORAGE, value: 10 * 1024 * 1024 * 1024 }, // 10GB
        { feature: Feature.STREAMING_HOURS, value: 100 },
      ],
    },
    {
      id: "pkg-core-annual",
      name: "Pro",
      description: "Advanced features for growing creators",
      price: 490,
      currency: "USD",
      billingType: BillingType.ANNUAL,
      paymentType: "recurring",
      type: PackageType.CORE,
      features: [
        { feature: Feature.VIDEO_STORAGE, value: 50 * 1024 * 1024 * 1024 },
        { feature: Feature.ASSET_STORAGE, value: 10 * 1024 * 1024 * 1024 },
        { feature: Feature.STREAMING_HOURS, value: 100 },
      ],
    },
  ],
  [PackageType.ADVANCED]: [
    {
      id: "pkg-advanced-monthly",
      name: "Business",
      description: "For teams and businesses with high-volume needs",
      price: 149,
      currency: "USD",
      billingType: BillingType.MONTHLY,
      paymentType: "recurring",
      type: PackageType.ADVANCED,
      features: [
        { feature: Feature.VIDEO_STORAGE, value: 500 * 1024 * 1024 * 1024 }, // 500GB
        { feature: Feature.ASSET_STORAGE, value: 100 * 1024 * 1024 * 1024 }, // 100GB
        { feature: Feature.STREAMING_HOURS, value: 500 },
      ],
    },
    {
      id: "pkg-advanced-annual",
      name: "Business",
      description: "For teams and businesses with high-volume needs",
      price: 1490,
      currency: "USD",
      billingType: BillingType.ANNUAL,
      paymentType: "recurring",
      type: PackageType.ADVANCED,
      features: [
        { feature: Feature.VIDEO_STORAGE, value: 500 * 1024 * 1024 * 1024 },
        { feature: Feature.ASSET_STORAGE, value: 100 * 1024 * 1024 * 1024 },
        { feature: Feature.STREAMING_HOURS, value: 500 },
      ],
    },
  ],
};

// Flag to enable/disable mock mode
export const MOCK_MODE = true;
