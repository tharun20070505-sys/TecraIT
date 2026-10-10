import { AlumniInfo } from "@/types";

export const alumniData: AlumniInfo = {
  about:
    "The Department of Information Technology maintains a network of alumni contributing to technology corporations, research institutions, and enterprises. Our graduates frequently return as mentors and guest speakers for current students.",
  batchPdfs: [
    {
      id: "b-2024",
      batchYear: "Batch 2020 to 2024",
      title: "Class of 2024 Graduate Directory and Profiles",
      fileUrl: "#",
      fileSize: "PDF Document",
    },
    {
      id: "b-2023",
      batchYear: "Batch 2019 to 2023",
      title: "Class of 2023 Graduate Directory and Profiles",
      fileUrl: "#",
      fileSize: "PDF Document",
    },
    {
      id: "b-2022",
      batchYear: "Batch 2018 to 2022",
      title: "Class of 2022 Graduate Directory and Profiles",
      fileUrl: "#",
      fileSize: "PDF Document",
    },
  ],
  reviews: [
    {
      id: "rev-1",
      name: "Department Alumnus",
      batch: "Batch of 2023",
      companyRole: "Software Engineer",
      reviewText:
        "The IT department provided a steady foundation in core computing, hands-on lab projects, and faculty mentorship that shaped my engineering career.",
      approved: true,
    },
    {
      id: "rev-2",
      name: "Department Alumna",
      batch: "Batch of 2022",
      companyRole: "Data Engineer",
      reviewText:
        "The emphasis on practical coursework and technical association activities prepared me thoroughly for industry demands and distributed teamwork.",
      approved: true,
    },
  ],
  images: [
    {
      id: "alm-1",
      url: "/images/alumni/alumni-placeholder.png",
      caption: "Alumni Meet and Industry Mentorship Interaction",
      altText: "Alumni meet with faculty and students",
    },
    {
      id: "alm-2",
      url: "/images/hero/sriet-campus.png",
      caption: "Campus Reunion at SRIET Main Building",
      altText: "Campus reunion photograph",
    },
  ],
};
