import { Club } from "@/types";

export const clubsData: Club[] = [
  {
    id: "club-1",
    slug: "technexus",
    name: "TechNexus",
    type: "technical",
    logoUrl: "/images/clubs/technexus-logo.png",
    shortDescription: "Department technical society dedicated to software development, algorithmic problem solving, and competitive hackathons.",
    about: "TechNexus serves as the core technical forum for IT students to bridge academic principles with open-source development and competitive programming.",
    vision: "To establish a vibrant community of proactive coders, problem solvers, and technical innovators ready for global engineering challenges.",
    mission: "To conduct structured coding bootcamps, internal coding leagues, open-source workshops, and technical project mentorship.",
    whatWeDo: [
      "Weekly algorithmic problem solving and code review sessions.",
      "Internal 12-hour hackathons and sprint challenges.",
      "Peer mentorship on open source software development.",
      "Technology guest lectures by distinguished industry engineers.",
    ],
    members: [
      { id: "m1", name: "Student Lead", role: "President", batch: "Final Year" },
      { id: "m2", name: "Student Secretary", role: "Vice President", batch: "Third Year" },
    ],
    weeklyReports: [
      {
        id: "wr-1",
        weekNumber: 1,
        date: "2026-09-08",
        title: "Inaugural Technical Orientation and CodeSprint",
        description: "Orientation for newly enrolled members covering GitHub workflows, algorithmic practice, and season roadmap.",
      },
      {
        id: "wr-2",
        weekNumber: 2,
        date: "2026-09-15",
        title: "Hands-on Data Structures and Algorithmic Problem Solving",
        description: "Intensive deep-dive session on dynamic programming and graph traversals for technical interview preparations.",
      },
    ],
    images: [
      { id: "tn-1", url: "/images/clubs/club-placeholder.png", caption: "TechNexus Coding Sprint", altText: "TechNexus coding sprint" },
      { id: "tn-2", url: "/images/gallery/gallery-placeholder.png", caption: "Algorithmic Discussion Lab", altText: "Algorithmic discussion lab" },
    ],
  },
  {
    id: "club-2",
    slug: "aesthetic-ai-club",
    name: "Aesthetic AI Club",
    type: "technical",
    logoUrl: "/images/clubs/aesthetic-ai-logo.png",
    shortDescription: "Exploring the intersection of modern machine learning, generative intelligence, neural aesthetics, and computer vision.",
    about: "The Aesthetic AI Club explores foundational and frontier artificial intelligence models, computer vision architectures, and generative machine intelligence.",
    vision: "To demystify modern artificial intelligence through rigorous practical experimentation, creative compute, and applied model building.",
    mission: "To train students in neural network architectures, data engineering pipelines, generative models, and ethical AI deployment.",
    whatWeDo: [
      "Workshops on PyTorch, Hugging Face, and deep learning architectures.",
      "Explorations of generative art, diffusion models, and neural audio.",
      "Research paper reading circles on multimodal intelligence.",
      "Applied computer vision projects for smart campus automation.",
    ],
    members: [
      { id: "m3", name: "AI Lead", role: "President", batch: "Final Year" },
      { id: "m4", name: "Tech Coordinator", role: "Research Lead", batch: "Third Year" },
    ],
    weeklyReports: [
      {
        id: "wr-a1",
        weekNumber: 1,
        date: "2026-09-10",
        title: "Foundations of Convolutional and Vision Transformers",
        description: "Review of architectural shifts from classic CNNs to modern Vision Transformers with live coding demonstrations.",
      },
    ],
    images: [
      { id: "ai-img-1", url: "/images/clubs/club-placeholder.png", caption: "Vision Transformer Demo Session", altText: "Vision transformer session" },
    ],
  },
  {
    id: "club-3",
    slug: "fine-arts-club",
    name: "Fine and Arts Club",
    type: "non-technical",
    logoUrl: "/images/clubs/fine-arts-logo.png",
    shortDescription: "Nurturing creative expression, visual arts, design aesthetics, and cultural exhibitions within the department.",
    about: "The Fine and Arts Club fosters creativity, design thinking, sketching, painting, and cultural stage performances for holistic student development.",
    members: [
      { id: "m5", name: "Creative Lead", role: "President", batch: "Final Year" },
      { id: "m6", name: "Art Coordinator", role: "Secretary", batch: "Third Year" },
    ],
    images: [
      { id: "fa-1", url: "/images/clubs/club-placeholder.png", caption: "Annual Department Art and Design Exhibition", altText: "Art exhibition" },
    ],
  },
  {
    id: "club-4",
    slug: "media-club",
    name: "Media Club",
    type: "non-technical",
    logoUrl: "/images/clubs/media-club-logo.png",
    shortDescription: "Documenting department milestones through digital storytelling, cinematography, photography, and audio-visual production.",
    about: "The Media Club powers the department's visual identity, handling event photography, podcasting, aftermovies, and editorial publications.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    videoPoster: "/images/clubs/club-placeholder.png",
    members: [
      { id: "m7", name: "Media Lead", role: "Editor-in-Chief", batch: "Final Year" },
      { id: "m8", name: "Visual Lead", role: "Head of Photography", batch: "Third Year" },
    ],
    images: [
      { id: "mc-1", url: "/images/clubs/club-placeholder.png", caption: "Event Media and Live Coverage Desk", altText: "Media coverage desk" },
    ],
  },
];
