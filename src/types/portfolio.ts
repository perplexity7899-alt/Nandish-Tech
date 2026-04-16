export interface Project {
  id: string;
  title: string;
  description: string;
  image: string; // Primary/featured image (for backwards compatibility)
  images?: string[]; // Array of multiple images for carousel
  techStack: string[];
  liveUrl: string;
  githubUrl: string;
  pricing?: ProjectPricing;
}

export interface ProjectPricing {
  id: string;
  project_id: string;
  price: number;
  currency: string;
  is_paid: boolean;
  code_access: boolean;
  live_access: boolean;
}

export interface ProjectPurchase {
  id: string;
  user_id: string;
  project_id: string;
  price: number;
  currency: string;
  payment_id: string;
  payment_status: 'pending' | 'completed' | 'failed';
  code_access: boolean;
  live_access: boolean;
  purchased_at: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface AboutData {
  bio: string;
  skills: string[];
  tools: string[];
}

export interface HeroData {
  heading: string;
  subheading: string;
  ctaText: string;
  ctaLink: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  date: string;
  read: boolean;
}

export interface Reply {
  id: string;
  message_id: string;
  admin_id?: string;
  client_id?: string;
  reply_message: string;
  created_at: string;
  updated_at?: string;
  is_admin_reply?: boolean;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
}

export interface PortfolioData {
  hero: HeroData;
  about: AboutData;
  projects: Project[];
  services: Service[];
  messages: ContactMessage[];
  socials: SocialLink[];
}
