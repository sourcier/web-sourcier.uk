export interface PreviewCard {
  label: string;
  sublabel: string;
  accentColor: string;
}

export interface Project {
  slug: string;
  name: string;
  tagline?: string;
  summary: string;
  status: "Active" | "In development" | "Archived";
  techStack: string[];
  repoUrl: string;
  homepageUrl?: string;
  previewCards?: PreviewCard[];
}

export const projects: Project[] = [
  {
    slug: "nioh2-save-editor",
    name: "Nioh Save Editor",
    tagline: "Desktop save editor for Nioh 2 & 3",
    summary:
      "A cross-platform Electron desktop app for editing Nioh 2 and Nioh 3 save files on PC — stats, weapons, items, and scrolls.",
    status: "Active",
    techStack: ["TypeScript", "Electron", "React", "Node.js"],
    repoUrl: "https://github.com/sourcier/nioh-save-editor",
    previewCards: [
      { label: "Nioh 2", sublabel: "PC & PS4", accentColor: "#4a1515" },
      { label: "Nioh 3", sublabel: "PC", accentColor: "#0f2d3a" },
    ],
  },
];
