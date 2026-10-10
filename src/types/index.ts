export interface NavItem {
  label: string;
  href: string;
  children?: {
    label: string;
    href: string;
    description?: string;
  }[];
}

/** Full nav item as stored in MongoDB / served by the API */
export interface DbNavItem {
  id: string;
  label: string;
  href: string;
  /** "page" = plain link, "dropdown" = has children, "auto" = children sourced from a collection */
  type: "page" | "dropdown" | "auto";
  autoSource?: string | null;
  children: { label: string; href: string; order: number; visible: boolean }[];
  order: number;
  visible: boolean;
  isSystem: boolean;
}

export interface SiteSettings {
  departmentName: string;
  departmentCode: string;
  institutionName: string;
  institutionShort: string;
  tagline: string;
  heroEyebrow: string;
  heroHeadline: string;
  heroDescription: string;
  heroCampusImage: string;
  heroIntervalSeconds?: number;
  heroTitleLineOne?: string;
  heroTitleLineTwo?: string;
  heroTextSeconds?: number;
  departmentOffice: {
    room: string;
    block: string;
    address: string;
    email: string;
    phone: string;
    officeHours: string;
  };
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
    github?: string;
  };
  footerNotice: string;
  accreditationNote: string;
  tneaCode?: string;
  officePhone?: string;
  highlightPillText?: string;
  brochurePdfUrl?: string;
  srietLogoSrc?: string;
  navbarBadgeLogos?: NavbarBadgeLogo[];
  brandReel?: BrandReelItem[];
}

export interface HeroSlide {
  id: string;
  url: string;
  responsiveUrls: string[];
  blurDataUrl: string;
  label: string;
  focalDesktop: { x: number; y: number };
  focalMobile: { x: number; y: number };
  overlay: number | null;
  active: boolean;
  startAt?: string | null;
  endAt?: string | null;
  order: number;
}

export interface NavbarBadgeLogo {
  id: string;
  url: string;
  alt: string;
  order: number;
}

export interface BrandReelItem {
  id: string;
  text: string;
  order: number;
  active: boolean;
}

export interface NoticeItem {
  id: string;
  title: string;
  link?: string;
  startDate?: string;
  endDate?: string;
  active: boolean;
  order?: number;
  createdAt?: string;
}

export interface QuickMetric {
  id: string;
  label: string;
  value: string;
  suffix?: string;
  prefix?: string;
  description?: string;
}

export interface WhyItCard {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

export interface ProgramDetailItem {
  label: string;
  value: string;
}

export interface ProgramOverview {
  title: string;
  description: string;
  details: ProgramDetailItem[];
}

export interface MissionItem {
  id: string;
  number: string; // M1, M2, M3...
  title: string;
  description: string;
}

export interface PeoItem {
  id: string;
  code: string;
  description: string;
}

export interface PoItem {
  id: string;
  code: string;
  title: string;
  description: string;
}

export interface PsoItem {
  id: string;
  code: string;
  description: string;
}

export interface AboutContent {
  introTitle: string;
  introParagraphs: string[];
  introImageUrl: string;
  introImageCaption: string;
  visionTitle: string;
  visionText: string;
  missionTitle: string;
  missionItems: MissionItem[];
  peos?: PeoItem[];
  pos?: PoItem[];
  psos?: PsoItem[];
  reelImages: ReelImage[];
}

export interface CareerPath {
  id: string;
  title: string;
  description: string;
  skills: string[];
}

export interface FacultyMember {
  id: string;
  name: string;
  position: string;
  qualification: string;
  specialisation: string;
  quotaLabel?: string;
  quota?: string;
  email?: string;
  contactNumber?: string;
  photoUrl: string;
  isHod: boolean;
  order: number;
  active: boolean;
  showEmail: boolean;
  showContactNumber: boolean;
  bio?: string;
  quote?: string;
}

export interface EventItem {
  id: string;
  slug: string;
  title: string;
  date: string;
  endDate?: string;
  time: string;
  venue: string;
  category: string;
  scope: "Department" | "College";
  description: string;
  fullContent?: string;
  posterUrl: string;
  isUpcoming: boolean;
  registrationUrl?: string;
}

export interface ClubMember {
  id: string;
  name: string;
  role: string;
  batch?: string;
  photoUrl?: string;
}

export interface ClubWeeklyReport {
  id: string;
  weekNumber: number;
  date: string;
  title: string;
  description: string;
  attachmentUrl?: string;
  attachmentType?: "pdf" | "image";
}

export interface Club {
  id: string;
  slug: string;
  name: string;
  type: "technical" | "non-technical";
  logoUrl: string;
  shortDescription: string;
  about: string;
  vision?: string;
  mission?: string;
  whatWeDo?: string[];
  videoUrl?: string; // Media club video / youtube
  videoPoster?: string;
  members: ClubMember[];
  weeklyReports?: ClubWeeklyReport[];
  images: ReelImage[];
}

export interface ITAssociationMember {
  id: string;
  name: string;
  role: string;
  batch: string;
  photoUrl: string;
}

export interface ITAssociationInfo {
  name: string;
  tagline: string;
  logoUrl: string;
  about: string;
  objectives: string[];
  membersByBatch: {
    batch: string;
    members: ITAssociationMember[];
  }[];
  images: ReelImage[];
}

export interface AlumniBatchPdf {
  id: string;
  batchYear: string;
  title: string;
  fileUrl: string;
  fileSize?: string;
}

export interface AlumniReview {
  id: string;
  name: string;
  batch: string;
  companyRole?: string;
  reviewText: string;
  avatarUrl?: string;
  approved: boolean;
}

export interface AlumniInfo {
  about: string;
  batchPdfs: AlumniBatchPdf[];
  reviews: AlumniReview[];
  images: ReelImage[];
}

export interface AchievementItem {
  id: string;
  title: string;
  eventName: string;
  prizePosition: string;
  date: string;
  year: string;
  details: string;
  imageUrl: string;
  category: "Student" | "Faculty" | "Department";
}

export interface PlacedStudent {
  id: string;
  name: string;
  company: string;
  role: string;
  lpa: string;
  year: string;
  batch: string;
  photoUrl: string;
}

export interface PlacementBatchSummary {
  batch: string;
  summaryText: string;
}

export interface PlacementInfo {
  trainingAbout: string;
  trainingPrograms: {
    title: string;
    description: string;
    targetYear: string;
  }[];
  batches: PlacementBatchSummary[];
  placedStudents: PlacedStudent[];
}

export interface CampusLifeEntry {
  id: string;
  title: string;
  category: "Sports" | "Cultural" | "Industrial Visits" | "Facilities" | "Student Activities";
  description: string;
  imageUrl: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  caption?: string;
  category:
    | "Events"
    | "Symposium"
    | "Industrial Visit"
    | "Workshops"
    | "Hackathons"
    | "Clubs"
    | "Campus"
    | "Achievements";
  date: string;
  imageUrl: string;
  order?: number;
}

export interface ReelImage {
  id: string;
  url: string;
  caption?: string;
  altText?: string;
  order?: number;
}

export interface ClubImageItem {
  id: string;
  clubId: string;
  url: string;
  blurDataUrl?: string;
  alt: string;
  caption?: string;
  focalPoint: { x: number; y: number };
  order: number;
  active: boolean;
  createdAt?: string;
}

export interface ClubMemberItem {
  id: string;
  clubId: string;
  name: string;
  role: string;
  batch?: string;
  photo?: string;
  order: number;
  active: boolean;
  createdAt?: string;
}

export interface LogoReelItemData {
  id: string;
  type: "club" | "association" | "custom";
  refId?: string;
  label: string;
  logoUrl: string;
  logoDarkUrl?: string;
  href?: string;
  order: number;
  active: boolean;
  isMissingLogo?: boolean;
}

export interface LogoReelConfig {
  speed: "slow" | "medium" | "fast";
  height: number;
  greyscale: boolean;
  linkEnabled: boolean;
}

export interface AssociationLogoData {
  logoLight: string;
  logoDark?: string;
  alt: string;
  showInFooter: boolean;
  showInReel: boolean;
}

