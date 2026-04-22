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
  projects: [
    {
      id: "1",
      title: "E-Commerce Platform",
      description: "A full-featured online store with payment processing, inventory management, and real-time analytics dashboard.",
      image: "https://images.unsplash.com/photo-1557821552-17105176677c?w=500&h=300&fit=crop",
      techStack: ["React", "Node.js", "Stripe"],
      liveUrl: "#",
      githubUrl: "#",
    },
    {
      id: "2",
      title: "Task Management App",
      description: "Collaborative project management tool with real-time updates, kanban boards, and team chat integration.",
      image: "https://images.unsplash.com/photo-1516534775068-bb57b6439066?w=500&h=300&fit=crop",
      techStack: ["Next.js", "TypeScript", "Prisma"],
      liveUrl: "#",
      githubUrl: "#",
    },
    {
      id: "3",
      title: "AI Content Generator",
      description: "AI-powered content creation tool for generating blog posts, social media content, and marketing copy.",
      image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=500&h=300&fit=crop",
      techStack: ["Python", "FastAPI", "OpenAI"],
      liveUrl: "#",
      githubUrl: "#",
    },
  ],
  services: [],
  messages: [],
  socials: [
    { id: "1", platform: "GitHub", url: "https://github.com/nandish-tech1" },
    { id: "2", platform: "LinkedIn", url: "https://www.linkedin.com/in/nandish-g-s-52b8b3317/" },
    { id: "3", platform: "Twitter", url: "https://twitter.com" },
  ],
  sampleWorks: [
    {
      id: "1",
      title: "E-Commerce Platform",
      description: "A full-featured online store with payment processing, inventory management, and real-time analytics dashboard.",
      techStack: ["React", "Node.js", "Stripe"],
      liveUrl: "#",
      githubUrl: "#",
    },
    {
      id: "2",
      title: "Task Management App",
      description: "Collaborative project management tool with real-time updates, kanban boards, and team chat integration.",
      techStack: ["Next.js", "TypeScript", "Prisma"],
      liveUrl: "#",
      githubUrl: "#",
    },
    {
      id: "3",
      title: "AI Content Generator",
      description: "AI-powered content creation tool for generating blog posts, social media content, and marketing copy.",
      techStack: ["Python", "FastAPI", "OpenAI"],
      liveUrl: "#",
      githubUrl: "#",
    },
  ],
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
