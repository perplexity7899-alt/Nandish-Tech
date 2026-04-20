import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import * as Icons from "lucide-react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getIconComponent(iconName: string) {
  const icons: Record<string, any> = {
    Code2: Icons.Code2,
    Rocket: Icons.Rocket,
    Zap: Icons.Zap,
    Code: Icons.Code,
    Palette: Icons.Palette,
    Server: Icons.Server,
    MessageSquare: Icons.MessageSquare,
    Settings: Icons.Settings,
    Cpu: Icons.Cpu,
    Database: Icons.Database,
    Globe: Icons.Globe,
    Smartphone: Icons.Smartphone,
    ShoppingCart: Icons.ShoppingCart,
    Shield: Icons.Shield,
    TrendingUp: Icons.TrendingUp,
    Award: Icons.Award,
  };

  return icons[iconName] || null;
}
