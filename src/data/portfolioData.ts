import type { PortfolioData } from "@/types/portfolio";

export const STORAGE_KEY = "portfolio_data";

export const defaultData: PortfolioData = {
  hero: {
    heading: "I Build Digital Experiences That Matter",
    subheading: "Full-stack developer & designer crafting modern web applications with clean code and thoughtful design.",
    ctaText: "View My Work",
    ctaLink: "#projects",
  },
  about: {
    bio: "I'm a passionate freelance developer with 5+ years of experience building modern web applications. I specialize in creating performant, accessible, and beautifully designed digital products that solve real problems.",
    skills: ["React", "TypeScript", "Node.js", "Python", "PostgreSQL", "GraphQL", "AWS", "Docker"],
    tools: ["VS Code", "Figma", "Git", "Vercel", "Notion", "Linear"],
  },
  projects: [],
  services: [],
  messages: [],
  socials: [
    { id: "1", platform: "GitHub", url: "https://github.com/nandish-tech1" },
    { id: "2", platform: "LinkedIn", url: "https://www.linkedin.com/in/nandish-g-s-52b8b3317/" },
    { id: "3", platform: "Twitter", url: "https://twitter.com" },
  ],
  sampleWorks: [],
};

export function loadData(): PortfolioData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return defaultData;
}

export function saveData(data: PortfolioData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
