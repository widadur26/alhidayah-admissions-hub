import {
  BookMarked,
  BookOpen,
  BookText,
  Building2,
  CalendarClock,
  CalendarDays,
  ClipboardList,
  FileText,
  GraduationCap,
  Handshake,
  Megaphone,
  Network,
  Newspaper,
  Route,
  School,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type SectionSlug = "tentang-kami" | "pendidikan" | "kesantrian" | "informasi" | "psb";

export type NavChild = {
  label: string;
  description: string;
  slug: string;
  icon: LucideIcon;
};

export type NavLinkItem = { kind: "link"; label: string; to: "/" | "/galeri-kontak" };
export type NavGroupItem = {
  kind: "group";
  label: string;
  section: SectionSlug;
  children: NavChild[];
  tone?: "default" | "cta";
};
export type NavItem = NavLinkItem | NavGroupItem;

export const NAV_ITEMS: NavItem[] = [
  { kind: "link", label: "Beranda", to: "/" },  {
    kind: "group",
    label: "Tentang Kami",
    section: "tentang-kami",
    children: [
      { label: "Profil Pesantren", description: "Sejarah & jati diri pondok", slug: "profil", icon: Building2 },
      { label: "Visi & Misi", description: "Arah dan tujuan pendidikan", slug: "visi-misi", icon: Target },
      { label: "Struktur Organisasi & Sanad", description: "Pengasuh, asatidz & silsilah ilmu", slug: "struktur", icon: Network },
      { label: "Fasilitas", description: "Asrama, masjid & ruang belajar", slug: "fasilitas", icon: School },
      { label: "Mitra & Alumni", description: "Jejaring dan kiprah lulusan", slug: "mitra-alumni", icon: Handshake },
    ],
  },
  {
    kind: "group",
    label: "Pendidikan",
    section: "pendidikan",
    children: [
      { label: "Pendidikan Formal", description: "MTs & MA terakreditasi", slug: "formal", icon: GraduationCap },
      { label: "Madrasah Diniyah", description: "Jenjang ula, wustha & ulya", slug: "diniyah", icon: BookOpen },
      { label: "Tahfizh Al-Qur'an", description: "Program hafalan bersanad", slug: "tahfizh", icon: BookMarked },
      { label: "Pengajian Kitab Kuning", description: "Sorogan & bandongan klasik", slug: "kitab-kuning", icon: ScrollText },
      { label: "Kurikulum", description: "Integrasi pesantren & nasional", slug: "kurikulum", icon: ClipboardList },
    ],
  },
  {
    kind: "group",
    label: "Kesantrian",
    section: "kesantrian",
    children: [
      { label: "Kegiatan Harian Santri", description: "Jadwal dari subuh hingga malam", slug: "kegiatan-harian", icon: CalendarClock },
      { label: "Ekstrakurikuler", description: "Pramuka, hadrah, olahraga & lainnya", slug: "ekstrakurikuler", icon: Sparkles },
      { label: "Organisasi Santri OSIP", description: "Wadah kepemimpinan santri", slug: "osip", icon: Users },
      { label: "Prestasi Santri", description: "Capaian akademik & non-akademik", slug: "prestasi", icon: Trophy },
      { label: "Tata Tertib", description: "Adab dan aturan pondok", slug: "tata-tertib", icon: ShieldCheck },
    ],
  },
  {
    kind: "group",
    label: "Informasi",
    section: "informasi",
    children: [
      { label: "Berita Pesantren", description: "Kabar terbaru dari pondok", slug: "berita", icon: Newspaper },
      { label: "Event & Agenda", description: "Kalender kegiatan mendatang", slug: "agenda", icon: CalendarDays },
      { label: "Pengumuman", description: "Informasi resmi untuk wali santri", slug: "pengumuman", icon: Megaphone },
      { label: "Kajian & Artikel Islam", description: "Tulisan para asatidz", slug: "kajian", icon: BookText },
    ],
  },
  {
    kind: "group",
    label: "PSB Online",
    section: "psb",
    tone: "cta",
    children: [
      { label: "Alur & Syarat", description: "Tahapan dan dokumen pendaftaran", slug: "alur-syarat", icon: Route },
      { label: "Rincian Biaya", description: "Biaya masuk & bulanan", slug: "biaya", icon: Wallet },
      { label: "Formulir Online", description: "Daftar langsung dari rumah", slug: "formulir", icon: FileText },
    ],
  },
  { kind: "link", label: "Galeri & Kontak", to: "/galeri-kontak" },
];

export const NAV_GROUPS = NAV_ITEMS.filter((i): i is NavGroupItem => i.kind === "group");

/**
 * Item menu per halaman: di beranda sendiri link "Beranda" disembunyikan
 * (pengguna sudah di sana, tidak perlu tautan ke halaman itu lagi).
 */
export function navItemsFor(pathname: string): NavItem[] {
  if (pathname === "/") return NAV_ITEMS.filter((i) => !(i.kind === "link" && i.to === "/"));
  return NAV_ITEMS;
}

export function findNavPage(section: string, slug: string) {
  const group = NAV_GROUPS.find((g) => g.section === section);
  const child = group?.children.find((c) => c.slug === slug);
  return group && child ? { group, child } : null;
}
