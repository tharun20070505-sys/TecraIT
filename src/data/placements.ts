import { PlacementInfo } from "@/types";

export const placementData: PlacementInfo = {
  trainingAbout:
    "The Department of Information Technology coordinates training programs covering programming, full-stack systems, quantitative aptitude, technical communication, and mock interviews from the second year onwards.",
  trainingPrograms: [
    {
      title: "Foundational Programming and Problem Solving",
      description: "Training in data structures, algorithms, and modular design patterns.",
      targetYear: "Second Year (Semester 3 and 4)",
    },
    {
      title: "Full-Stack Development and System Design",
      description: "Hands-on projects covering application frameworks, databases, and network services.",
      targetYear: "Third Year (Semester 5 and 6)",
    },
    {
      title: "Aptitude, Soft Skills and Company Preparation",
      description: "Logical reasoning, quantitative aptitude, technical mock interviews, and group discussions.",
      targetYear: "Final Year (Semester 7)",
    },
  ],
  batches: [
    {
      batch: "Batch 2021 to 2025",
      summaryText: "Content to be provided by the department",
    },
    {
      batch: "Batch 2020 to 2024",
      summaryText: "Content to be provided by the department",
    },
  ],
  placedStudents: [
    {
      id: "ps-1",
      name: "Graduating Student 1",
      company: "Technology Solutions Partner",
      role: "Associate Software Engineer",
      lpa: "Content to be provided by the department",
      year: "2025",
      batch: "2021 to 2025",
      photoUrl: "/images/faculty/faculty-placeholder.png",
    },
    {
      id: "ps-2",
      name: "Graduating Student 2",
      company: "Cloud Infrastructure Services",
      role: "Cloud Support Engineer",
      lpa: "Content to be provided by the department",
      year: "2025",
      batch: "2021 to 2025",
      photoUrl: "/images/faculty/faculty-placeholder.png",
    },
  ],
};
