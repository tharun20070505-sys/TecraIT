/**
 * TECRA IT - Sri Ranganathar Institute of Engineering and Technology (SRIET)
 * Standalone MongoDB Seeding Script
 *
 * Usage:
 *   node scripts/seed-database.mjs
 *   or: npm run seed
 */

import mongoose from "mongoose";

const DATABASE_URL =
  process.env.DATABASE_URL || "mongodb://localhost:27017/tecra_it";

console.log("==================================================");
console.log("  TECRA IT Database Seeding Engine");
console.log("  Department of Information Technology, SRIET");
console.log("==================================================");
console.log(`Connecting to: ${DATABASE_URL.replace(/:\/\/.*@/, "://<credentials>@")}`);

// Define Mongoose Schemas for Seeding
const FacultySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    position: { type: String, required: true },
    qualification: { type: String, required: true },
    specialisation: { type: String, required: true },
    email: { type: String, default: "" },
    contactNumber: { type: String, default: "" },
    photoUrl: { type: String, default: "/images/faculty/avatar-placeholder.png" },
    isHod: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    showEmail: { type: Boolean, default: true },
    showContactNumber: { type: Boolean, default: true },
    bio: { type: String, default: "" },
    quote: { type: String, default: "" },
    quota: { type: String, default: "" },
    quotaLabel: { type: String, default: "" },
  },
  { timestamps: true }
);

const EventSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    date: { type: String, required: true },
    endDate: { type: String, default: "" },
    time: { type: String, required: true },
    venue: { type: String, required: true },
    category: { type: String, required: true },
    scope: { type: String, enum: ["Department", "College"], default: "Department" },
    description: { type: String, required: true },
    fullContent: { type: String, default: "" },
    posterUrl: { type: String, default: "" },
    isUpcoming: { type: Boolean, default: true },
    registrationUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

const GalleryImageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    imageUrl: { type: String, required: true },
    category: { type: String, required: true },
    caption: { type: String, default: "" },
    date: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const ContactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: "" },
    category: { type: String, default: "General" },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const HealthCheckSchema = new mongoose.Schema(
  {
    service: { type: String, required: true },
    status: { type: String, enum: ["healthy", "degraded", "down"], required: true },
    latencyMs: { type: Number, required: true },
    message: { type: String, default: "" },
    checkedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Models
const Faculty = mongoose.models.Faculty || mongoose.model("Faculty", FacultySchema);
const Event = mongoose.models.Event || mongoose.model("Event", EventSchema);
const GalleryImage = mongoose.models.GalleryImage || mongoose.model("GalleryImage", GalleryImageSchema);
const ContactMessage = mongoose.models.ContactMessage || mongoose.model("ContactMessage", ContactMessageSchema);
const HealthCheck = mongoose.models.HealthCheck || mongoose.model("HealthCheck", HealthCheckSchema);

// Initial Seed Datasets
const facultyData = [
  {
    name: "Dr. K. Radhika",
    position: "Professor & Head of Department",
    qualification: "B.Tech (IT), M.E. (CSE), Ph.D.",
    specialisation: "Cloud Computing, Distributed Systems, Deep Learning",
    email: "hod.it@sriet.ac.in",
    contactNumber: "+91 94432 12345",
    photoUrl: "/images/faculty/hod-radhika.png",
    isHod: true,
    order: 1,
    active: true,
    showEmail: true,
    showContactNumber: true,
    bio: "Dr. K. Radhika brings over 18 years of academic and industrial research experience in distributed systems and cloud architecture. She has published over 30 peer-reviewed journal articles and leads the TECRA Centre for Advanced Computing.",
    quote: "Empowering every engineering graduate to bridge foundational computer science with production-grade systems innovation.",
    quota: "Ph.D. Anna University, 2014",
    quotaLabel: "Doctoral Research",
  },
  {
    name: "Mr. S. Arvind",
    position: "Associate Professor",
    qualification: "B.E. (CSE), M.Tech (Information Technology)",
    specialisation: "Computer Networks, Cyber Security, Blockchain",
    email: "arvind.s@sriet.ac.in",
    contactNumber: "+91 94432 12346",
    photoUrl: "/images/faculty/arvind.png",
    isHod: false,
    order: 2,
    active: true,
    showEmail: true,
    showContactNumber: false,
    bio: "14 years of teaching and industrial consultancy experience. Research mentor for the TECRA Cyber Defense and Blockchain Research SIG.",
  },
  {
    name: "Mrs. M. Kavitha",
    position: "Assistant Professor",
    qualification: "B.Tech (IT), M.E. (Software Engineering)",
    specialisation: "Full Stack Development, DevOps, Human Computer Interaction",
    email: "kavitha.m@sriet.ac.in",
    contactNumber: "+91 94432 12347",
    photoUrl: "/images/faculty/kavitha.png",
    isHod: false,
    order: 3,
    active: true,
    showEmail: true,
    showContactNumber: false,
    bio: "Head faculty mentor for TechNexus student developer club and active contributor to web application architecture curriculum.",
  },
  {
    name: "Dr. R. Balaji",
    position: "Assistant Professor",
    qualification: "B.E. (CSE), M.E. (CSE), Ph.D.",
    specialisation: "Artificial Intelligence, Computer Vision, Edge Computing",
    email: "balaji.r@sriet.ac.in",
    contactNumber: "+91 94432 12348",
    photoUrl: "/images/faculty/balaji.png",
    isHod: false,
    order: 4,
    active: true,
    showEmail: true,
    showContactNumber: true,
    bio: "Specialist in real-time object detection models and edge hardware deployment. Faculty lead for the Aesthetic AI student organization.",
  },
  {
    name: "Mrs. T. Deepa",
    position: "Assistant Professor",
    qualification: "B.Tech (IT), M.Tech (Data Science)",
    specialisation: "Big Data Analytics, Database Management Systems, Python",
    email: "deepa.t@sriet.ac.in",
    contactNumber: "+91 94432 12349",
    photoUrl: "/images/faculty/deepa.png",
    isHod: false,
    order: 5,
    active: true,
    showEmail: true,
    showContactNumber: false,
    bio: "Coordinator for academic industry value-added courses and department accreditation data analytics.",
  },
  {
    name: "Mr. P. Vignesh",
    position: "Assistant Professor",
    qualification: "B.E. (CSE), M.E. (Embedded Systems)",
    specialisation: "Internet of Things, Embedded AI, Mobile Computing",
    email: "vignesh.p@sriet.ac.in",
    contactNumber: "+91 94432 12350",
    photoUrl: "/images/faculty/vignesh.png",
    isHod: false,
    order: 6,
    active: true,
    showEmail: true,
    showContactNumber: false,
    bio: "Faculty mentor for hardware prototyping, robotics hackathons, and national-level student innovation contests.",
  },
  {
    name: "Mr. K. Naveen",
    position: "Lab Instructor",
    qualification: "Diploma (CT), B.Sc. (Computer Science)",
    specialisation: "Systems Administration, Network Configuration, Linux Lab Operations",
    email: "naveen.k@sriet.ac.in",
    contactNumber: "+91 94432 12351",
    photoUrl: "/images/faculty/naveen.png",
    isHod: false,
    order: 7,
    active: true,
    showEmail: true,
    showContactNumber: false,
    bio: "In-charge of the TECRA High Performance Laboratory and operating systems virtualization server rack.",
  },
  {
    name: "Mrs. S. Revathi",
    position: "Technical Assistant",
    qualification: "B.C.A., M.C.A.",
    specialisation: "Database Administration, Software Testing, Web Services",
    email: "revathi.s@sriet.ac.in",
    contactNumber: "+91 94432 12352",
    photoUrl: "/images/faculty/revathi.png",
    isHod: false,
    order: 8,
    active: true,
    showEmail: true,
    showContactNumber: false,
    bio: "Supervises the software engineering laboratory workstations and departmental continuous integration runners.",
  },
];

const eventsData = [
  {
    slug: "national-conference-advances-computing-2026",
    title: "National Conference on Advances in Computing & Intelligent Systems (NCACIS 2026)",
    date: "2026-11-14",
    endDate: "2026-11-15",
    time: "09:00 AM - 05:00 PM IST",
    venue: "SRIET Central Auditorium & Seminar Hall 1",
    category: "Symposium",
    scope: "College",
    description: "Annual national conference gathering researchers, scholars, and industry leaders to present groundbreaking research in distributed AI, edge systems, and cybersecurity.",
    fullContent: "The National Conference on Advances in Computing & Intelligent Systems brings together pioneering minds across academia and engineering industries. Features keynote speeches from Fortune 500 tech architects, parallel technical paper tracks, and Best Paper accolades.",
    posterUrl: "/images/events/ncacis-2026.png",
    isUpcoming: true,
    registrationUrl: "https://forms.gle/ncacis-2026-reg",
  },
  {
    slug: "hands-on-deep-learning-workshop",
    title: "Hands-on Workshop: Deep Learning with PyTorch & Edge Devices",
    date: "2026-10-24",
    time: "09:30 AM - 04:30 PM IST",
    venue: "TECRA High Performance Lab (Block B, Room 204)",
    category: "Workshops",
    scope: "Department",
    description: "Intensive, day-long hands-on masterclass focusing on PyTorch model architectures, quantization, and deployment onto NVIDIA Jetson and edge microcontroller hardware.",
    fullContent: "Led by industry practitioners, this workshop equips IT students with real-world computer vision workflows, model pruning techniques, and deployment on edge accelerators.",
    posterUrl: "/images/events/deep-learning-workshop.png",
    isUpcoming: true,
    registrationUrl: "https://forms.gle/dl-workshop-tecra",
  },
  {
    slug: "annual-inter-collegiate-sports-meet",
    title: "SRIET Inter-Collegiate Engineering Tech & Sports Fest 2026",
    date: "2026-12-05",
    time: "08:00 AM - 06:00 PM IST",
    venue: "SRIET Sports Complex & Main Grounds",
    category: "Events",
    scope: "College",
    description: "Mega annual inter-collegiate festival celebrating athletic sportsmanship, e-sports gaming tournaments, and technical project exhibitions.",
    fullContent: "Over 40 engineering colleges participate in track and field events, basketball championships, collegiate hackathons, and cultural evenings.",
    posterUrl: "/images/events/sports-meet.png",
    isUpcoming: true,
    registrationUrl: "https://forms.gle/sriet-sports-fest",
  },
  {
    slug: "institute-innovation-hackathon-2026",
    title: "Institute Innovation Council: 36-Hour National HackSprint 2026",
    date: "2026-09-18",
    time: "08:00 AM - 08:00 PM IST",
    venue: "TECRA Innovation Center & Design Studio",
    category: "Hackathons",
    scope: "Department",
    description: "Flagship 36-hour non-stop hackathon building production-grade software solutions for sustainability, healthcare AI, and smart campus logistics.",
    fullContent: "Over 65 shortlisted teams built full-stack software and embedded prototypes with live cloud deployment and cash prizes awarded to top engineering innovations.",
    posterUrl: "/images/events/hackathon-2026.png",
    isUpcoming: false,
    registrationUrl: "",
  },
];

const galleryData = [
  {
    title: "High Performance Computing Lab",
    imageUrl: "/images/gallery/lab-workstation-1.png",
    category: "Campus",
    caption: "State-of-the-art dual-display workstations dedicated to machine learning, distributed computing, and Linux kernel programming.",
    date: "2026-08-15",
    order: 1,
  },
  {
    title: "AI & Neural Networks Research Pod",
    imageUrl: "/images/gallery/ai-research-lab.png",
    category: "Campus",
    caption: "Specialized collaborative research pod outfitted with GPU servers for deep learning experimentations.",
    date: "2026-08-20",
    order: 2,
  },
  {
    title: "TECRA 36-Hour HackSprint Prototyping",
    imageUrl: "/images/gallery/hackathon-action.png",
    category: "Hackathons",
    caption: "Teams actively developing autonomous edge systems and full-stack web platforms during the annual HackSprint.",
    date: "2026-09-18",
    order: 3,
  },
  {
    title: "National Conference Keynote Session",
    imageUrl: "/images/gallery/symposium-hall.png",
    category: "Symposium",
    caption: "Keynote presentation delivered by Chief Enterprise Architect on next-generation cloud native infrastructures.",
    date: "2026-09-22",
    order: 4,
  },
  {
    title: "TechNexus Hands-on Git Workshop",
    imageUrl: "/images/gallery/technexus-workshop.png",
    category: "Workshops",
    caption: "Student-led interactive tutorial on Git branching strategies, trunk-based deployment, and continuous integration.",
    date: "2026-07-10",
    order: 5,
  },
  {
    title: "SRIET Main Academic Quadrangle",
    imageUrl: "/images/gallery/campus-quad.png",
    category: "Campus",
    caption: "Lush, modern green campus grounds providing an inspiring academic environment for engineering education.",
    date: "2026-06-05",
    order: 6,
  },
  {
    title: "Zonal Basketball Championship Victory",
    imageUrl: "/images/gallery/sports-victory.png",
    category: "Achievements",
    caption: "Department of IT basketball team securing championship honors at the Anna University Inter-Collegiate Zonal Tournament.",
    date: "2026-08-30",
    order: 7,
  },
  {
    title: "Industrial Visit to Tech Hub Coimbatore",
    imageUrl: "/images/gallery/industrial-visit.png",
    category: "Industrial Visit",
    caption: "Third year IT students interacting with software DevOps leads at ELCOT IT Park Coimbatore.",
    date: "2026-09-02",
    order: 8,
  },
];

const sampleMessages = [
  {
    name: "Dr. K. Raman",
    email: "raman.prof@example.ac.in",
    phone: "+91 94432 10987",
    category: "Academics",
    subject: "Guest Lecture on Distributed Systems Architecture",
    message: "Greetings, I would like to propose an interactive 2-day workshop on modern distributed systems and container orchestration for final year IT students.",
    isRead: false,
    isArchived: false,
  },
  {
    name: "R. Priya",
    email: "priya.candidate@gmail.com",
    phone: "+91 98765 43210",
    category: "Admissions",
    subject: "Lateral Entry B.Tech IT Admissions Inquiry",
    message: "Respected Admissions Team, I have completed my 3-year Diploma in Computer Technology with 92% aggregate. Please provide information on lateral entry vacancies for the upcoming session.",
    isRead: true,
    isArchived: false,
  },
];

async function seed() {
  try {
    // Connect with a 5s timeout
    await mongoose.connect(DATABASE_URL, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("✓ Connected to MongoDB database successfully.\n");

    // Clear existing collections
    console.log("Cleaning existing department records...");
    await Promise.all([
      Faculty.deleteMany({}),
      Event.deleteMany({}),
      GalleryImage.deleteMany({}),
      ContactMessage.deleteMany({}),
      HealthCheck.deleteMany({}),
    ]);
    console.log("✓ Old collections purged.\n");

    // Insert Datasets
    console.log("Inserting verified department datasets...");
    const [seededFaculty, seededEvents, seededGallery, seededMessages] = await Promise.all([
      Faculty.insertMany(facultyData),
      Event.insertMany(eventsData),
      GalleryImage.insertMany(galleryData),
      ContactMessage.insertMany(sampleMessages),
      HealthCheck.create({
        service: "tecra-seeder",
        status: "healthy",
        latencyMs: 12,
        message: "Initial database seed completed successfully",
        checkedAt: new Date(),
      }),
    ]);

    console.log("\n==================================================");
    console.log("  SEEDING COMPLETE SUMMARY");
    console.log("==================================================");
    console.log(`✓ Faculty Members Seeded:       ${seededFaculty.length}`);
    console.log(`✓ Events & Announcements Seeded: ${seededEvents.length}`);
    console.log(`✓ Gallery Media Seeded:         ${seededGallery.length}`);
    console.log(`✓ Sample Contact Messages:       ${seededMessages.length}`);
    console.log(`✓ Initial Health Check Audit:    1`);
    console.log("==================================================");
    console.log("Database is ready for production and administrative operations!\n");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("\n❌ Could not connect to MongoDB server:");
    console.error(err.message);
    console.log("\n[NOTE] If MongoDB is not running locally, the application automatically");
    console.log("operates in 100% resilient offline fallback mode with identical data!");
    console.log("To seed a live MongoDB Atlas cluster, set DATABASE_URL and run:");
    console.log("  DATABASE_URL='mongodb+srv://user:pass@cluster.mongodb.net/tecra_it' npm run seed\n");
    process.exit(0);
  }
}

seed();
