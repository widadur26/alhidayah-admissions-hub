import type { ImageKey } from "@/lib/images";

export const SITE = {
  name: "Pondok Pesantren Asasunnajaah",
  short: "Asasunnajaah",
  location: "Kesugihan, Cilacap",
  founded: 1987,
  address: "Jl. Raya Kesugihan No. 17, Desa Kesugihan, Kec. Kesugihan, Kab. Cilacap, Jawa Tengah 53264",
  phone: "+62 812-3456-7890",
  whatsapp: "6281234567890",
  email: "info@asasunnajaah.sch.id",
  office: "Senin–Sabtu, 08.00–15.00 WIB",
  mapQuery: "Kesugihan, Cilacap, Jawa Tengah",
  socials: [
    { label: "Facebook", href: "https://www.facebook.com/asasunnajaah" },
    { label: "Instagram", href: "https://www.instagram.com/asasunnajaah" },
    { label: "TikTok", href: "https://www.tiktok.com/@asasunnajaah" },
    { label: "YouTube", href: "https://www.youtube.com/@asasunnajaah" },
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

export const NEWS: Article[] = [
  {
    title: "Wisuda Akbar ke-37: 214 santri resmi purna studi dan 31 hafizh 30 juz",
    excerpt:
      "Prosesi dihadiri lebih dari dua ribu wali santri. Pengasuh berpesan agar para lulusan menjaga adab di mana pun mereka berkhidmah.",
    date: "2026-11-02",
    category: "Kegiatan",
    image: "wisuda",
  },
  {
    title: "Ahmad Faiz juara 1 MTQ cabang Tartil tingkat Provinsi Jawa Timur",
    excerpt:
      "Santri kelas XI MA ini akan mewakili Jawa Timur pada MTQ Nasional 2027 setelah mengungguli 38 peserta dari kabupaten/kota lain.",
    date: "2026-10-24",
    category: "Prestasi",
    image: "prestasi",
  },
  {
    title: "Asrama putra blok C selesai direnovasi, kini menampung 180 santri",
    excerpt:
      "Renovasi meliputi kamar mandi baru, ventilasi silang, dan ruang belajar malam di setiap lantai.",
    date: "2026-10-11",
    category: "Fasilitas",
    image: "asrama",
  },
  {
    title: "Perkemahan Sabtu–Ahad Gugus Depan Asasunnajaah diikuti 320 anggota",
    excerpt:
      "Kegiatan tahunan Pramuka ini melatih kemandirian, navigasi darat, dan pertolongan pertama.",
    date: "2026-09-28",
    category: "Kesantrian",
    image: "ekskul",
  },
  {
    title: "Khataman Alfiyah Ibnu Malik santri kelas III Wustha",
    excerpt:
      "Sebanyak 96 santri menyetorkan hafalan 1.002 bait nadham di hadapan dewan masyayikh.",
    date: "2026-09-14",
    category: "Diniyah",
    image: "kitab",
  },
  {
    title: "Laboratorium komputer MA kini terhubung jaringan fiber 300 Mbps",
    excerpt:
      "Peningkatan ini mendukung pelaksanaan ANBK dan kelas pemrograman dasar untuk santri MA jurusan IPA.",
    date: "2026-08-30",
    category: "Pendidikan",
    image: "kelas",
  },
];

export const KAJIAN: Article[] = [
  {
    title: "Adab sebelum ilmu: membaca ulang Ta'limul Muta'allim di era gawai",
    excerpt: "Mengapa Imam Az-Zarnuji menempatkan niat dan pemilihan guru di bab-bab awal kitabnya.",
    date: "2026-11-06",
    category: "Akhlak",
    image: "kitab",
    author: "Ust. Muhammad Syafi'i, Lc.",
    readMinutes: 7,
  },
  {
    title: "Murajaah yang efektif: tiga pola yang dipakai para huffazh",
    excerpt: "Pola satu-hari-satu-juz, sistem tujuh manzil, dan sambung ayat berpasangan.",
    date: "2026-10-20",
    category: "Al-Qur'an",
    image: "tahfizh",
    author: "Ustadzah Nur Laila, Al-Hafizhah",
    readMinutes: 5,
  },
  {
    title: "Fiqih thaharah untuk santri baru: yang sering keliru",
    excerpt: "Membedakan najis mughallazhah, mutawassithah, dan mukhaffafah dalam keseharian di asrama.",
    date: "2026-10-03",
    category: "Fiqih",
    image: "halaqah",
    author: "KH. Abdurrahman Hakim",
    readMinutes: 9,
  },
  {
    title: "Menjadi santri yang melek teknologi tanpa kehilangan tradisi",
    excerpt: "Catatan dari lokakarya literasi digital untuk dewan guru dan pengurus OSIP.",
    date: "2026-09-18",
    category: "Pendidikan",
    image: "kelas",
    author: "Dr. Ahmad Fauzan, M.Pd.",
    readMinutes: 6,
  },
];

export type AgendaItem = { date: string; title: string; place: string; time: string };

export const AGENDA: AgendaItem[] = [
  { date: "2026-11-21", title: "Haflah Maulid Nabi & Pembacaan Simtud Duror", place: "Masjid Jami' Asasunnajaah", time: "19.30 WIB" },
  { date: "2026-12-05", title: "Open House PSB 2027/2028 & Tur Kampus", place: "Aula Utama", time: "08.00–12.00 WIB" },
  { date: "2026-12-14", title: "Penilaian Akhir Semester Ganjil MTs & MA", place: "Gedung Madrasah", time: "14–19 Des" },
  { date: "2026-12-21", title: "Pembagian Rapor & Penjemputan Liburan", place: "Kantor Kesantrian", time: "07.30 WIB" },
  { date: "2027-01-10", title: "Kembali ke Pondok & Ziarah Muassis", place: "Makam Masyayikh", time: "Ba'da Ashar" },
  { date: "2027-02-08", title: "Tes Seleksi PSB Gelombang I", place: "Kampus Asasunnajaah", time: "08.00 WIB" },
];

export type Notice = { date: string; title: string; text: string; tag: string };

export const NOTICES: Notice[] = [
  {
    date: "2026-11-08",
    tag: "PSB",
    title: "Pendaftaran Gelombang I tahun ajaran 2027/2028 dibuka",
    text: "Periode 1 November 2026 – 31 Januari 2027. Kuota putra 160 dan putri 160 santri.",
  },
  {
    date: "2026-11-04",
    tag: "Wali Santri",
    title: "Jadwal kunjungan wali santri bulan Desember",
    text: "Kunjungan hanya pada Ahad pekan kedua dan keempat, pukul 08.00–15.00 WIB, di ruang tamu putra/putri.",
  },
  {
    date: "2026-10-29",
    tag: "Keuangan",
    title: "Batas pembayaran syahriah semester ganjil",
    text: "Pembayaran paling lambat 10 Desember 2026 melalui virtual account atau loket bendahara.",
  },
  {
    date: "2026-10-15",
    tag: "Kesehatan",
    title: "Pemeriksaan kesehatan gigi gratis bersama Puskesmas Kesugihan",
    text: "Seluruh santri kelas VII dan X wajib hadir sesuai jadwal kamar masing-masing.",
  },
];

export type Testimonial = { quote: string; name: string; role: string };

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Yang paling saya syukuri bukan hanya hafalan, tapi kebiasaan bangun sebelum subuh dan disiplin waktu. Itu yang membuat saya bertahan di bangku kuliah di Kairo.",
    name: "M. Rizqi Maulana",
    role: "Alumni 2019 · Universitas Al-Azhar, Mesir",
  },
  {
    quote:
      "Anak kami pulang liburan dengan cara bicara yang lebih santun ke orang tua. Laporan perkembangannya juga rutin dikirim setiap bulan.",
    name: "Ibu Siti Aminah",
    role: "Wali santri kelas VIII",
  },
  {
    quote:
      "Pengajian kitab di sini membuat saya terbiasa membaca teks Arab gundul. Sekarang saya mengajar di madrasah diniyah di desa sendiri.",
    name: "Ahmad Zainuri, S.Pd.",
    role: "Alumni 2014 · Guru MI Nurul Huda",
  },
  {
    quote:
      "Sebagai mahasiswi kedokteran, saya merasakan manfaat jurusan IPA di MA Asasunnajaah. Bekal sainsnya kuat tanpa mengurangi jam diniyah.",
    name: "dr. Fatimah Az-Zahra",
    role: "Alumni 2015 · Dokter RSUD Cilacap",
  },
];

export const PARTNERS = [
  "Kementerian Agama Kab. Cilacap",
  "LPTQ Jawa Tengah",
  "Universitas Al-Azhar Kairo",
  "UIN Sunan Kalijaga Yogyakarta",
  "Universitas Jenderal Soedirman",
  "BAZNAS Kab. Cilacap",
  "Bank Syariah Indonesia",
  "Puskesmas Kesugihan",
  "Rabithah Ma'ahid Islamiyah",
];

export const PSB_INFO = {
  year: "2027/2028",
  waves: [
    { name: "Gelombang I", period: "1 Nov 2026 – 31 Jan 2027", test: "8 Februari 2027" },
    { name: "Gelombang II", period: "1 Feb – 30 Apr 2027", test: "9 Mei 2027" },
  ],
  quota: "160 putra · 160 putri",
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
