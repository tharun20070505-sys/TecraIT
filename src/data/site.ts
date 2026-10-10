import { SiteSettings, NavItem, QuickMetric, WhyItCard, ProgramOverview, CareerPath, ReelImage } from "@/types";

export const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About Department", href: "/about" },
  { label: "Faculty", href: "/faculty" },
  {
    label: "Student Life",
    href: "/student-life",
    children: [
      {
        label: "IT Association",
        href: "/student-life/it-association",
        description: "Official student association governing technical initiatives",
      },
      {
        label: "Alumni",
        href: "/alumni",
        description: "Alumni network, batch records, and graduate experiences",
      },
      {
        label: "Achievements",
        href: "/achievements",
        description: "Student and faculty academic and competition laurels",
      },
      {
        label: "Placements",
        href: "/placements",
        description: "Industry readiness, career training, and recruitment records",
      },
      {
        label: "Campus Life",
        href: "/campus-life",
        description: "Vibrant campus culture, technical hubs, and facilities",
      },
    ],
  },
  { label: "Clubs", href: "/clubs" },
  { label: "Gallery", href: "/gallery" },
  { label: "Events", href: "/events" },
  { label: "Contact", href: "/contact" },
];

export const siteSettings: SiteSettings = {
  departmentName: "Department of Information Technology",
  departmentCode: "IT",
  institutionName: "Sri Ranganathar Institute of Engineering and Technology",
  institutionShort: "SRIET",
  tagline: "Advancing Computing Education and Technical Innovation",
  heroEyebrow: "DEPARTMENT OF INFORMATION TECHNOLOGY",
  heroHeadline: "TECRA Information Technology",
  heroDescription:
    "Fostering excellence in computing, intelligent systems, cybersecurity, and cloud engineering through rigorous academic inquiry and practical technological innovation.",
  heroCampusImage: "/images/hero/hero-background.jpg",
  heroTitleLineOne: "TECRA",
  heroTitleLineTwo: "Department of Information Technology",
  heroTextSeconds: 3,
  departmentOffice: {
    room: "IT Department Block, Level 2",
    block: "Academic Block B",
    address: "Athipalayam, Coimbatore, Tamil Nadu 641110, India",
    email: "itdepartment@sriet.ac.in",
    phone: "+91 422 269 7799",
    officeHours: "Monday to Friday, 8:45 AM to 4:45 PM",
  },
  socialLinks: {
    linkedin: "https://www.linkedin.com/school/sriet-official",
    twitter: "https://twitter.com/srietofficial",
    instagram: "https://instagram.com/sriet_it",
    youtube: "https://youtube.com/@srietofficial",
  },
  footerNotice: "Sri Ranganathar Institute of Engineering and Technology (SRIET). All rights reserved.",
  accreditationNote: "Approved by AICTE, New Delhi and Affiliated to Anna University, Chennai.",
  srietLogoSrc: "/images/logos/sriet-logo.png",
  tneaCode: "2738",
  officePhone: "+91 422 269 7799",
  highlightPillText: "",
  brochurePdfUrl: "/docs/brochure.pdf",
  navbarBadgeLogos: [],
  brandReel: [
    {
      id: "br-1",
      text: "TECRA",
      order: 1,
      active: true,
    },
    {
      id: "br-2",
      text: "Department of Information Technology",
      order: 2,
      active: true,
    },
    {
      id: "br-3",
      text: "Sri Ranganathar Institute of Engineering and Technology",
      order: 3,
      active: true,
    },
    {
      id: "br-4",
      text: "Rathinam Group of Institutions",
      order: 4,
      active: true,
    },
  ],
};

export const quickMetrics: QuickMetric[] = [
  { id: "m1", label: "Advanced Computing Labs", value: "6", suffix: " Labs" },
  { id: "m2", label: "Active Student Clubs", value: "4", suffix: " Clubs" },
  { id: "m3", label: "Industry Partners & MoUs", value: "15", suffix: "+" },
  { id: "m4", label: "Research Papers & Patents", value: "48", suffix: "+" },
];

export const whyItCards: WhyItCard[] = [
  {
    id: "w1",
    title: "Software Engineering & Systems Architecture",
    description: "Build robust, scalable software systems from core data structures to distributed microservices with hands-on code reviews.",
    iconName: "Code2",
  },
  {
    id: "w2",
    title: "Machine Learning & Applied Intelligence",
    description: "Train real-world models on edge GPUs, spanning computer vision, natural language understanding, and automated decision systems.",
    iconName: "BrainCircuit",
  },
  {
    id: "w3",
    title: "Data Engineering & Stream Pipelines",
    description: "Design high-throughput ingestion pipelines, analytical warehouses, and modern distributed database architectures.",
    iconName: "DatabaseZap",
  },
  {
    id: "w4",
    title: "Cyber Defense & Ethical Systems",
    description: "Defend networked infrastructure, analyze cryptographic protocols, audit code vulnerabilities, and respond to live incidents.",
    iconName: "ShieldCheck",
  },
  {
    id: "w5",
    title: "Cloud Native & DevOps Engineering",
    description: "Master multi-cloud deployments, Docker/Kubernetes container orchestration, automated CI/CD, and site reliability.",
    iconName: "CloudCog",
  },
  {
    id: "w6",
    title: "Internet of Things & Connected Hardware",
    description: "Bridge physical sensors with embedded firmware, real-time telemetry, edge microcontrollers, and modern wireless protocols.",
    iconName: "Cpu",
  },
];

export const programOverview: ProgramOverview = {
  title: "Why Choose B.Tech Information Technology at SRIET?",
  description:
    "Engineering education should be active, grounded, and human-first. At SRIET, the Department of Information Technology pairs classical computational theory with continuous project work, close faculty mentorship, and active industry problem solving in Coimbatore's thriving industrial corridor.",
  details: [
    { label: "Degree Conferred", value: "Bachelor of Technology (B.Tech in Information Technology)" },
    { label: "Curriculum Standard", value: "Autonomous Scheme affiliated to Anna University, Chennai" },
    { label: "Programme Duration", value: "4 Academic Years / 8 Intensive Semesters" },
    { label: "Total Degree Credits", value: "162 Credits (Outcome-Based Education framework)" },
    { label: "Laboratory Practice", value: "6 Hands-On Computing Laboratories & Open Innovation Hub" },
    { label: "Industry Immersion", value: "Mandatory Semester Internships & Capstone Projects" },
    { label: "TNEA Counselling Code", value: "Code 2738 · SRIET Coimbatore" },
  ],
};

export const careerPaths: CareerPath[] = [
  {
    id: "cp1",
    title: "Software Development Engineer",
    description: "Architecting web platforms, enterprise applications, and backend microservices.",
    skills: ["System Design", "Distributed Systems", "Full-stack Engineering"],
  },
  {
    id: "cp2",
    title: "Data Analyst and Data Engineer",
    description: "Constructing scalable data pipelines, data warehousing, and business intelligence models.",
    skills: ["SQL and Data Systems", "Data Wrangling", "Statistical Modeling"],
  },
  {
    id: "cp3",
    title: "Cloud Infrastructure Engineer",
    description: "Deploying and managing fault-tolerant multi-cloud environments and container clusters.",
    skills: ["Cloud Architecture", "Automation Pipelines", "Site Reliability"],
  },
  {
    id: "cp4",
    title: "Cyber Security Analyst",
    description: "Safeguarding critical assets, vulnerability research, and incident triage.",
    skills: ["Network Security", "Threat Modeling", "Penetration Testing"],
  },
  {
    id: "cp5",
    title: "Artificial Intelligence Engineer",
    description: "Building production model inference pipelines, predictive models, and intelligent applications.",
    skills: ["Deep Learning", "Machine Learning Operations", "Model Optimization"],
  },
  {
    id: "cp6",
    title: "Higher Studies and Academic Research",
    description: "Pursuing postgraduate and doctoral pathways in recognized universities.",
    skills: ["Academic Research", "Scientific Writing", "Specialized Computing"],
  },
];

export const homeReelImages: ReelImage[] = [
  {
    id: "hr1",
    url: "/images/hero/sriet-campus.png",
    caption: "SRIET Main Campus Infrastructure",
    altText: "Illustration of the Sri Ranganathar Institute of Engineering and Technology main building",
  },
  {
    id: "hr2",
    url: "/images/campus/campus-placeholder.png",
    caption: "Information Technology Department Computing Center",
    altText: "Computing center and laboratories",
  },
  {
    id: "hr3",
    url: "/images/events/event-placeholder.png",
    caption: "Annual Technical Symposium and Project Exhibition",
    altText: "Technical symposium and project exhibitions",
  },
  {
    id: "hr4",
    url: "/images/gallery/gallery-placeholder.png",
    caption: "Collaborative Student Development Lab",
    altText: "Collaborative laboratory workspace",
  },
];
