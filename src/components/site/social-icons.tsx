import type { ComponentType } from "react";
import { Facebook, Instagram, Youtube, type LucideIcon } from "lucide-react";

import type { SocialSetting } from "@/lib/site-settings";
import { DEFAULT_SETTINGS } from "@/lib/site-settings";

/** Ikon TikTok tidak tersedia di lucide-react — pakai SVG inline bergaya mirip. */
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.09 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.02 1.38-2.52 2.34-4.19 2.74-1.67.4-3.47.31-5.09-.24-1.63-.57-3.04-1.69-3.98-3.11-1.05-1.52-1.43-3.42-1.2-5.23.19-1.56.9-3.03 2.02-4.14 1.02-.96 2.33-1.62 3.73-1.88.6-.11 1.22-.15 1.84-.13v3.36c-.95-.06-1.92.14-2.72.65-.83.5-1.46 1.28-1.77 2.18-.29.84-.3 1.77-.04 2.62.25.79.76 1.49 1.41 2.01.85.67 1.95.94 3.01.85 1.02-.08 2-.55 2.68-1.32.56-.62.87-1.44.94-2.27.03-2.32.01-4.65.01-6.97.02-2.4 0-4.8.01-7.2Z" />
    </svg>
  );
}

const ICONS: Record<string, LucideIcon | ComponentType<{ className?: string }>> = {
  Facebook,
  Instagram,
  TikTok: TikTokIcon,
  YouTube: Youtube,
};

export type SocialLink = { label: string; href: string; Icon: ComponentType<{ className?: string }> };

/** Sumber data: pengaturan sosmed dari dashboard (bawaan: site_settings bawaan). */
export const socialLinkIcons = (socials: SocialSetting[] = DEFAULT_SETTINGS.socials): SocialLink[] =>
  socials.map(({ label, href }) => ({
    label,
    href,
    Icon: ICONS[label] ?? Facebook,
  }));
