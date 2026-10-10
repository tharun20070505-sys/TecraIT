import { ITAssociationInfo } from "@/types";

export const associationData: ITAssociationInfo = {
  name: "TECRA IT Association",
  tagline: "Connecting Academic Ambition with Technical Leadership",
  logoUrl: "/images/association/association-logo.png",
  about:
    "The TECRA Information Technology Association is the student governing body of the department. It coordinates academic guest lectures, technical symposiums, hackathons, and community programs, encouraging students to build organizational leadership.",
  objectives: [
    "Bridge academic curriculum with evolving industry engineering practices.",
    "Organize departmental symposia, national conferences, and development sprints.",
    "Promote collaborative learning, programming practice, and student projects.",
    "Facilitate alumni mentorship programs for pre-final and final year students.",
  ],
  membersByBatch: [
    {
      batch: "2025 to 2026",
      members: [
        {
          id: "am-1",
          name: "Student President",
          role: "President",
          batch: "Final Year (2022 to 2026)",
          photoUrl: "/images/faculty/faculty-placeholder.png",
        },
        {
          id: "am-2",
          name: "Student Secretary",
          role: "Secretary",
          batch: "Third Year (2023 to 2027)",
          photoUrl: "/images/faculty/faculty-placeholder.png",
        },
        {
          id: "am-3",
          name: "Student Treasurer",
          role: "Treasurer",
          batch: "Final Year (2022 to 2026)",
          photoUrl: "/images/faculty/faculty-placeholder.png",
        },
        {
          id: "am-4",
          name: "Technical Coordinator",
          role: "Technical Coordinator",
          batch: "Third Year (2023 to 2027)",
          photoUrl: "/images/faculty/faculty-placeholder.png",
        },
      ],
    },
    {
      batch: "2024 to 2025",
      members: [
        {
          id: "am-5",
          name: "Past President",
          role: "President",
          batch: "Batch of 2025",
          photoUrl: "/images/faculty/faculty-placeholder.png",
        },
        {
          id: "am-6",
          name: "Past Secretary",
          role: "Secretary",
          batch: "Batch of 2025",
          photoUrl: "/images/faculty/faculty-placeholder.png",
        },
      ],
    },
  ],
  images: [
    {
      id: "ai-1",
      url: "/images/association/association-placeholder.png",
      caption: "Association Inauguration Ceremony",
      altText: "Association inauguration ceremony and council installation",
    },
    {
      id: "ai-2",
      url: "/images/events/event-placeholder.png",
      caption: "Symposium Executive Committee",
      altText: "National symposium executive committee",
    },
  ],
};
