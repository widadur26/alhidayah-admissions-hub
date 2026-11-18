import type { ImageKey } from "@/lib/images";

export const SITE = {
  name: "Pondok Pesantren Asaasunnajaah",
  short: "Asaasunnajaah",
  location: "Kesugihan, Cilacap",
  founded: 1987,
  address: "Pondok Pesantren Asaasunnajaah Kesugihan, Cilacap, Jawa Tengah",
  phone: "+62 852-8198-8682",
  whatsapp: "6285281988682",
  email: "info@asasunnajaah.sch.id",
  office: "Setiap hari, 08.00–15.00 WIB",
  mapQuery: "Pondok Pesantren Asaasunnajaah Kesugihan, Cilacap, Jawa Tengah",
  socials: [
    { label: "Instagram", href: "https://www.instagram.com/pp_asaasunnajaah" },
    { label: "TikTok", href: "https://www.tiktok.com/@pp_asaasunnajaah" },
    { label: "Facebook", href: "https://www.facebook.com/search/top?q=Ponpes%20Asaasunnajaah%20Kesugihan" },
    { label: "YouTube", href: "https://www.youtube.com/results?search_query=Ponpes+Asaasunnajaah+Kesugihan" },
  ],
};

/**
 * Narahubung resmi pondok (halaman "Narahubung" pada brosur PSB).
 * Nomor disimpan dalam dua bentuk: tampilan (+62 …) dan tautan wa.me (tanpa "+" dan tanda hubung).
 */
export type ContactPerson = { name: string; role: string; phone: string; whatsapp: string };

export const CONTACT_PERSONS: { putra: ContactPerson[]; putri: ContactPerson[] } = {
  putra: [
    { name: "Kang Imam", role: "Contact person pondok putra", phone: "+62 852-8198-8682", whatsapp: "6285281988682" },
    { name: "Kang Hida", role: "Contact person pondok putra", phone: "+62 882-0051-56624", whatsapp: "62882005156624" },
  ],
  putri: [
    { name: "PP Putri", role: "Contact person pondok putri", phone: "+62 878-3306-5543", whatsapp: "6287833065543" },
    { name: "Mbak Ainun", role: "Contact person pondok putri", phone: "+62 857-2754-3561", whatsapp: "6285727543561" },
  ],
};

export type Article = {
  title: string;
  excerpt: string;
  date: string; // ISO
  category: string;
  image?: ImageKey; // gambar bawaan; wajib kecuali imageUrl diisi
  imageUrl?: string; // gambar unggahan dari dashboard admin
  author?: string;
  readMinutes?: number;
};

/**
 * Daftar berita, kajian, agenda, pengumuman, testimoni, dan mitra sengaja
 * dikosongkan sampai naskah resmi dari pondok tersedia. Situs menampilkan
 * keadaan kosong ("belum ada") alih-alih contoh yang tidak valid.
 * Konten bisa diisi lewat dashboard admin (/dashboard).
 */
export const NEWS: Article[] = [];

export const KAJIAN: Article[] = [];

export type AgendaItem = { date: string; title: string; place: string; time: string };

export const AGENDA: AgendaItem[] = [];

export type Notice = { date: string; title: string; text: string; tag: string };

export const NOTICES: Notice[] = [];

export type Testimonial = { quote: string; name: string; role: string };

export const TESTIMONIALS: Testimonial[] = [];

export const PARTNERS: string[] = [];

export const PSB_INFO = {
  year: "2024/2025",
  waves: [
    { name: "Pendaftaran Online", period: "Dibuka mulai 5 April 2024", test: "Melalui formulir online" },
    { name: "Pendaftaran Offline", period: "Dibuka mulai 24 April 2024", test: "Datang langsung ke pondok" },
  ],
  quota: "Putra & putri",
  /** Tautan formulir pendaftaran resmi (brosur PSB). */
  formUrl: "https://bit.ly/PSBasaasunnajaah24",
  /** Lokasi pondok sesuai brosur (dipakai pada bagian "Scan Me for Location"). */
  location: "Pondok Pesantren Asaasunnajaah Kesugihan, Cilacap, Jawa Tengah",
};

/** Rincian biaya pendaftaran santri baru sesuai brosur resmi pondok. */
export const BIAYA = {
  /** Komponen biaya yang sama untuk putra dan putri. */
  umum: [
    { label: "Pendaftaran", value: "Rp 50.000" },
    { label: "KTS", value: "Rp 15.000" },
    { label: "Pajak makan", value: "Rp 240.000 per bulan/2x" },
    { label: "Syahriyah", value: "Rp 50.000/bulan" },
    { label: "Madin", value: "Rp 10.000/bulan" },
  ],
  jariyah: "Rp 1.000.000 / 800.000 / 550.000 / 300.000",
  kelengkapan: { putra: "Rp 45.000", putri: "Rp 325.000" },
  /** Total biaya awal; sudah termasuk syahriyah & madin bulan pertama. */
  total: [
    { jariyah: "Rp 1.000.000", putra: "Rp 1.410.000", putri: "Rp 1.690.000" },
    { jariyah: "Rp 800.000", putra: "Rp 1.210.000", putri: "Rp 1.490.000" },
    { jariyah: "Rp 550.000", putra: "Rp 960.000", putri: "Rp 1.240.000" },
    { jariyah: "Rp 300.000", putra: "Rp 710.000", putri: "Rp 990.000" },
  ],
  rekening: {
    putra: { bank: "BRI", nomor: "3121-01-060801-53-0", nama: "Pondok Pesantren Asaasunnajaah" },
    putri: { bank: "BRI", nomor: "3121-01-048465-53-6", nama: "Anggun Sururoh" },
  },
  /** Nomor pengiriman bukti transfer. */
  konfirmasi: {
    putra: ["0882-3345-6371 (Raju N)", "0882-0035-20539 (Dimas F)"],
    putri: ["0823-2602-5425 (Anggun S)", "0878-3306-5543 (Pondok Putri)"],
  },
};

const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const monthsLong = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export function formatDate(iso: string, long = true) {
  const [y = 0, m = 1, d = 1] = iso.split("-").map(Number);
  return `${d} ${(long ? monthsLong : months)[m - 1]} ${y}`;
}

export function dateParts(iso: string) {
  const [, m = 1, d = 1] = iso.split("-").map(Number);
  return { day: String(d).padStart(2, "0"), month: months[m - 1] };
}
