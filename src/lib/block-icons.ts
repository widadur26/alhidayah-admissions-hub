import {
  Bath,
  BedDouble,
  BookMarked,
  BookOpen,
  BookText,
  Building2,
  CalendarClock,
  CalendarDays,
  ClipboardList,
  Cpu,
  Dumbbell,
  FileText,
  FlaskConical,
  GraduationCap,
  Handshake,
  HeartPulse,
  Landmark,
  Library,
  Megaphone,
  Mic2,
  Music,
  Network,
  Newspaper,
  Palette,
  PenLine,
  Route as RouteIcon,
  School,
  ScrollText,
  ShieldCheck,
  Shirt,
  Soup,
  Sparkles,
  Store,
  Swords,
  Tent,
  Target,
  Trophy,
  Users,
  Volleyball,
  Wallet,
  Wifi,
  type LucideIcon,
} from "lucide-react";

import type { Block } from "@/content/blocks";

/**
 * Nama ikon (teks) ↔ komponen Lucide.
 * Blok konten dari database hanya bisa menyimpan teks JSON, sedangkan blok
 * bawaan memakai komponen ikon. Kedua arah dikonversi di sini.
 */

const ICON_MAP: Record<string, LucideIcon> = {
  bath: Bath,
  "bed-double": BedDouble,
  "book-marked": BookMarked,
  "book-open": BookOpen,
  "book-text": BookText,
  "building-2": Building2,
  "calendar-clock": CalendarClock,
  "calendar-days": CalendarDays,
  "clipboard-list": ClipboardList,
  cpu: Cpu,
  dumbbell: Dumbbell,
  "file-text": FileText,
  "flask-conical": FlaskConical,
  "graduation-cap": GraduationCap,
  handshake: Handshake,
  "heart-pulse": HeartPulse,
  landmark: Landmark,
  library: Library,
  megaphone: Megaphone,
  mic: Mic2,
  music: Music,
  network: Network,
  newspaper: Newspaper,
  palette: Palette,
  "pen-line": PenLine,
  route: RouteIcon,
  school: School,
  "scroll-text": ScrollText,
  "shield-check": ShieldCheck,
  shirt: Shirt,
  soup: Soup,
  sparkles: Sparkles,
  store: Store,
  swords: Swords,
  tent: Tent,
  target: Target,
  trophy: Trophy,
  users: Users,
  volleyball: Volleyball,
  wallet: Wallet,
  wifi: Wifi,
};

const NAME_MAP = new Map<LucideIcon, string>(Object.entries(ICON_MAP).map(([name, Icon]) => [Icon, name]));

export const DEFAULT_ICON = "book-open" as const;

/** Daftar nama ikon yang bisa dipilih di dashboard. */
export const iconNames = (): string[] => Object.keys(ICON_MAP);

/** Nama teks → komponen ikon (fallback: book-open). */
export const iconFromName = (name: unknown): LucideIcon =>
  ICON_MAP[String(name ?? "")] ?? ICON_MAP[DEFAULT_ICON]!;

/** Komponen ikon → nama teks untuk disimpan sebagai JSON (fallback: book-open). */
export const nameFromIcon = (Icon: unknown): string => {
  const name = NAME_MAP.get(Icon as LucideIcon);
  return name ?? DEFAULT_ICON;
};

type BlockInput = Record<string, unknown>;

/** Ubah blok dari database (ikon masih teks) menjadi blok siap render (ikon komponen). */
export const normalizeBlocks = (blocks: unknown): Block[] => {
  if (!Array.isArray(blocks)) return [];
  return blocks.map((raw): Block => {
    const b = (raw ?? {}) as BlockInput;
    if (b["type"] === "features" && Array.isArray(b["items"])) {
      return {
        ...(b as unknown as Block),
        items: (b["items"] as BlockInput[]).map((it) => ({
          ...it,
          icon:
            typeof it["icon"] === "string" || it["icon"] == null ? iconFromName(it["icon"]) : (it["icon"] as LucideIcon),
        })),
      } as Block;
    }
    return b as unknown as Block;
  });
};

/** Ubah blok bawaan (ikon komponen) menjadi struktur JSON-ramah (ikon teks) untuk editor dashboard. */
export const blocksToEditable = (blocks: readonly unknown[]): unknown[] =>
  blocks.map((raw) => {
    const b = raw as unknown as BlockInput;
    if (b["type"] === "features" && Array.isArray(b["items"])) {
      return {
        ...b,
        items: (b["items"] as BlockInput[]).map((it) => ({
          ...it,
          icon: nameFromIcon(it["icon"]),
        })),
      };
    }
    return b;
  });
