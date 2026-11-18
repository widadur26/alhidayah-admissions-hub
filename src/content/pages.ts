import type { ContentPage } from "./blocks";
import { AGENDA, BIAYA, KAJIAN, NEWS, NOTICES, PSB_INFO } from "./site";

/**
 * Konten halaman.
 *
 * Prinsip: hanya informasi yang benar-benar diketahui yang ditulis lengkap.
 * Bagian yang naskahnya belum tersedia diberi keterangan "belum tersedia" agar
 * situs tidak memuat data karangan (nama pengasuh, prestasi, atau angka yang
 * belum dipastikan).
 */
type PageMap = Record<string, Record<string, ContentPage>>;

/** Blok keterangan untuk halaman yang datanya belum diterima dari pondok. */
const belumTersedia = (judul: string, catatan: string) => ({
  type: "callout" as const,
  title: judul,
  text: catatan,
});

export const PAGES: PageMap = {
  "tentang-kami": {
    profil: {
      title: "Profil Pesantren",
      summary:
        "Pondok Pesantren Asaasunnajaah Kesugihan, Cilacap — pesantren berasrama untuk santri putra dan putri.",
      image: "hero",
      blocks: [
        {
          type: "prose",
          heading: "Sekilas Asaasunnajaah",
          paragraphs: [
            "Pondok Pesantren Asaasunnajaah berada di Kesugihan, Cilacap, Jawa Tengah, dan menerima santri putra maupun santri putri yang mukim di asrama.",
            "Kegiatan santri berjalan dari Subuh hingga malam: sholat berjamaah, tadarrus Al-Qur'an, ngaji bandungan dan sorogan kitab kuning, sekolah formal bagi yang sekolah, madrasah diniyah, musyawarah, dan takror.",
            "Santri putra menempati asrama lantai 2, santri putri menempati asrama lantai 4. Kegiatan mingguan, bulanan, dan tahunan dilaksanakan bersama pengasuh dan masyayikh pondok.",
          ],
          image: "asrama",
          caption: "Asrama santri Pondok Pesantren Asaasunnajaah Kesugihan.",
        },
        {
          type: "table",
          heading: "Identitas pondok",
          columns: ["Keterangan", "Data"],
          rows: [
            ["Nama lembaga", "Pondok Pesantren Asaasunnajaah"],
            ["Lokasi", "Kesugihan, Cilacap, Jawa Tengah"],
            ["Santri", "Putra dan putri (mukim)"],
            ["Asrama", "Putra lantai 2 · Putri lantai 4"],
            [
              "Fasilitas",
              "Ruang tamu, perpustakaan, MCK/WC, gudang, dapur, kantor, kantin, aula, BMA",
            ],
          ],
        },
        belumTersedia(
          "Sejarah & data kelembagaan",
          "Naskah sejarah, tahun berdiri, susunan yayasan, dan nomor statistik pondok belum kami terima. Silakan menghubungi narahubung pondok untuk keterangan resmi.",
        ),
      ],
    },
    "visi-misi": {
      title: "Visi & Misi",
      summary: "Arah pendidikan Pondok Pesantren Asaasunnajaah Kesugihan.",
      image: "halaqah",
      blocks: [
        belumTersedia(
          "Naskah visi & misi",
          "Naskah visi dan misi resmi pondok belum kami terima, sehingga tidak kami tulis sendiri. Silakan menghubungi narahubung pondok putra atau putri pada halaman Galeri & Kontak.",
        ),
      ],
    },
    struktur: {
      title: "Struktur Organisasi",
      summary: "Susunan pengasuh dan pengelola Pondok Pesantren Asaasunnajaah Kesugihan.",
      image: "kitab",
      blocks: [
        belumTersedia(
          "Susunan pengasuh & pengelola",
          "Daftar nama dewan pengasuh, asatidz, dan pengurus pondok belum kami terima. Halaman ini akan diisi setelah data resmi tersedia.",
        ),
      ],
    },
    fasilitas: {
      title: "Fasilitas",
      summary:
        "Sarana penunjang belajar, ibadah, dan kehidupan sehari-hari santri di Pondok Pesantren Asaasunnajaah Kesugihan.",
      image: "asrama",
      blocks: [
        {
          type: "list",
          heading: "Fasilitas pondok",
          intro: "Fasilitas yang tercatat pada brosur resmi pondok.",
          style: "check",
          items: [
            "Ruang tamu",
            "Asrama putri (lantai 4)",
            "Asrama putra (lantai 2)",
            "Perpustakaan",
            "MCK/WC",
            "Gudang",
            "Dapur",
            "Kantor",
            "Kantin",
            "Aula",
            "BMA (Baitul Mal Asaasunnajaah)",
          ],
        },
      ],
    },
    "mitra-alumni": {
      title: "Mitra & Alumni",
      summary: "Jejaring kerja sama dan ikatan alumni Pondok Pesantren Asaasunnajaah.",
      image: "wisuda",
      blocks: [
        belumTersedia(
          "Data mitra & alumni",
          "Daftar lembaga mitra dan data alumni belum kami terima. Kegiatan yang sudah berjalan antara lain Halal Bihalal alumni dan wali santri serta Haul Masyayikh setiap tahun.",
        ),
      ],
    },
  },

  pendidikan: {
    formal: {
      title: "Sekolah Formal",
      summary: "Sekolah formal santri berlangsung pagi hari, berdampingan dengan kegiatan pondok.",
      image: "kelas",
      blocks: [
        {
          type: "table",
          heading: "Posisi sekolah formal dalam jadwal harian",
          columns: ["Waktu", "Kegiatan"],
          rows: [
            ["05.30–06.15", "Tadarrus Al-Qur'an dan ngaji bandungan kitab kuning"],
            ["06.30–12.00", "Sekolah formal (bagi yang sekolah)"],
            ["12.00–13.00", "Sholat Dzuhur berjamaah"],
            ["14.00–15.00", "Ngaji kitab bandungan"],
            ["20.30–22.00", "Madrasah Diniyah"],
          ],
          note: "Jadwal lengkap ada pada halaman Kegiatan Santri.",
        },
        belumTersedia(
          "Jenjang & akreditasi",
          "Jenjang sekolah formal, kurikulum, dan akreditasi belum kami terima datanya. Silakan bertanya kepada narahubung pondok putra atau putri.",
        ),
      ],
    },
    diniyah: {
      title: "Madrasah Diniyah",
      summary: "Madrasah Diniyah berlangsung setiap malam setelah sholat 'Isya.",
      image: "halaqah",
      blocks: [
        {
          type: "table",
          heading: "Kegiatan diniyah dalam jadwal harian",
          columns: ["Waktu", "Kegiatan", "Keterangan"],
          rows: [
            [
              "14.00–15.00",
              "Ngaji kitab bandungan",
              "Untuk kelas aula (putra) dan kelas aulia (putri)",
            ],
            ["16.30–17.00", "Setoran kitab Alfiyyah", "Untuk kelas 3–6 Diniyah (putri)"],
            ["20.30–22.00", "Madrasah Diniyah", "Setiap malam"],
            ["22.30–23.45", "Musyawarah & takror", "Putra"],
          ],
        },
        belumTersedia(
          "Jenjang & kitab pokok",
          "Rincian jenjang (ula, wustha, ulya) serta daftar kitab pokok belum kami terima. Silakan menghubungi narahubung pondok.",
        ),
      ],
    },
    tahfizh: {
      title: "Al-Qur'an & Tahfizh",
      summary: "Kegiatan tadarrus, sorogan, dan setoran hafalan sesuai jadwal harian pondok.",
      image: "tahfizh",
      blocks: [
        {
          type: "schedule",
          heading: "Kegiatan Al-Qur'an harian",
          items: [
            {
              time: "05.30–06.15",
              title: "Tadarrus Al-Qur'an",
              text: "Bersama ngaji bandungan kitab kuning.",
            },
            { time: "16.30–17.00", title: "Pengajian bandungan Al-Qur'an (putra)" },
            { time: "16.30–17.00", title: "Setoran kitab Alfiyyah (putri kelas 3–6 Diniyah)" },
            { time: "19.00–19.30", title: "Ngaji sorogan Al-Qur'an & kitab kuning" },
            { time: "22.00–22.30", title: "Setoran nadzom Alfiyyah Ibnu Malik (putra)" },
          ],
        },
        belumTersedia(
          "Program tahfizh",
          "Target hafalan, jumlah juz, dan syarat mengikuti program tahfizh belum kami terima. Silakan menghubungi narahubung pondok.",
        ),
      ],
    },
    "kitab-kuning": {
      title: "Pengajian Kitab Kuning",
      summary: "Pengajian kitab kuning dengan metode bandungan dan sorogan setiap hari.",
      image: "kitab",
      blocks: [
        {
          type: "table",
          heading: "Waktu pengajian kitab",
          columns: ["Waktu", "Kegiatan"],
          rows: [
            ["05.30–06.15", "Ngaji bandungan kitab kuning (setelah tadarrus)"],
            ["14.00–15.00", "Ngaji kitab bandungan untuk kelas aula/aulia"],
            ["16.30–17.00", "Pengajian bandungan Al-Qur'an (putra)"],
            ["19.00–19.30", "Ngaji sorogan kitab kuning & Al-Qur'an"],
            ["22.00–22.30", "Setoran nadzom Alfiyyah Ibnu Malik (putra)"],
            ["22.30–23.45", "Musyawarah & takror (putra)"],
          ],
        },
        {
          type: "prose",
          heading: "Bandungan dan sorogan",
          paragraphs: [
            "Bandungan: kitab dibacakan dan dimaknai bersama-sama, santri menyimak dan mencatat makna pada kitabnya masing-masing.",
            "Sorogan: santri membaca kitab di hadapan ustadz satu per satu untuk dikoreksi bacaannya.",
          ],
        },
      ],
    },
    kurikulum: {
      title: "Kurikulum",
      summary:
        "Perpaduan sekolah formal, madrasah diniyah, dan pengajian kitab dalam satu jadwal harian.",
      image: "kelas",
      blocks: [
        {
          type: "table",
          heading: "Alur kegiatan belajar harian",
          columns: ["Waktu", "Kegiatan"],
          rows: [
            ["05.30–06.15", "Tadarrus Al-Qur'an & ngaji bandungan kitab kuning"],
            ["06.30–12.00", "Sekolah formal (bagi yang sekolah)"],
            ["14.00–15.00", "Ngaji kitab bandungan"],
            ["16.30–17.00", "Pengajian bandungan Al-Qur'an / setoran kitab"],
            ["19.00–19.30", "Ngaji sorogan kitab kuning & Al-Qur'an"],
            ["20.30–22.00", "Madrasah Diniyah"],
            ["22.30–23.45", "Musyawarah & takror"],
          ],
          note: "Santri yang tidak bersekolah formal mengikuti kegiatan pondok pada jam tersebut.",
        },
      ],
    },
  },

  kesantrian: {
    "kegiatan-harian": {
      title: "Kegiatan Santri",
      summary:
        "Jadwal harian santri putra dan putri Pondok Pesantren Asaasunnajaah, dari Subuh hingga istirahat malam.",
      image: "tahfizh",
      blocks: [
        {
          type: "schedule",
          heading: "Jadwal harian santri putra",
          items: [
            { time: "04.00–05.30", title: "Sholat Shubuh berjamaah" },
            { time: "05.30–06.15", title: "Tadarrus Al-Qur'an dan Ngaji Bandungan Kitab Kuning" },
            { time: "06.15–06.30", title: "Sholat Dhuha berjamaah" },
            { time: "06.30–12.00", title: "Sekolah formal (bagi yang sekolah)" },
            { time: "12.00–13.00", title: "Sholat Dzuhur berjamaah" },
            { time: "14.00–15.00", title: "Ngaji kitab bandungan (untuk kelas aula)" },
            { time: "15.00–16.30", title: "Sholat 'Ashar berjamaah" },
            { time: "16.30–17.00", title: "Pengajian bandungan Al-Qur'an" },
            { time: "18.00–18.40", title: "Sholat Maghrib berjamaah" },
            { time: "18.40–19.00", title: "Pembacaan Ratibul Haddad" },
            { time: "19.00–19.30", title: "Ngaji sorogan kitab kuning & Al-Qur'an" },
            { time: "19.30–20.20", title: "Sholat 'Isya berjamaah" },
            { time: "20.30–22.00", title: "Madrasah Diniyah" },
            { time: "22.00–22.30", title: "Setoran nadzom Alfiyyah Ibnu Malik" },
            { time: "22.30–23.45", title: "Musyawarah & takror" },
            { time: "23.45–04.00", title: "Istirahat" },
          ],
        },
        {
          type: "schedule",
          heading: "Jadwal harian santri putri",
          items: [
            { time: "04.00–05.30", title: "Sholat Shubuh berjamaah" },
            { time: "05.30–06.15", title: "Tadarrus Al-Qur'an dan Ngaji Bandungan Kitab Kuning" },
            { time: "06.15–06.30", title: "Sholat Dhuha berjamaah" },
            { time: "06.30–12.00", title: "Sekolah formal (bagi yang sekolah)" },
            { time: "12.00–13.00", title: "Sholat Dzuhur berjamaah" },
            { time: "14.00–15.00", title: "Ngaji kitab bandungan (untuk kelas aulia)" },
            { time: "15.00–16.30", title: "Sholat 'Ashar berjamaah" },
            { time: "16.30–17.00", title: "Setoran kitab Alfiyyah (untuk kelas 3–6 Diniyah)" },
            { time: "18.00–18.40", title: "Sholat Maghrib berjamaah" },
            { time: "18.40–19.00", title: "Pembacaan Ratibul Haddad" },
            { time: "19.00–19.30", title: "Ngaji sorogan kitab kuning & Al-Qur'an" },
            { time: "19.30–20.20", title: "Sholat 'Isya berjamaah" },
            { time: "20.30–22.00", title: "Madrasah Diniyah" },
            { time: "22.00–22.30", title: "Musyawarah & takror" },
            { time: "23.45–04.00", title: "Istirahat" },
          ],
          intro:
            "Jadwal sesuai brosur pondok. Waktu di luar kegiatan belajar digunakan untuk istirahat dan keperluan pribadi.",
        },
      ],
    },
    "kegiatan-lainnya": {
      title: "Kegiatan Lainnya",
      summary: "Kegiatan mingguan, bulanan, dan tahunan Pondok Pesantren Asaasunnajaah Kesugihan.",
      image: "halaqah",
      blocks: [
        {
          type: "list",
          heading: "Kegiatan mingguan",
          style: "numbered",
          items: [
            "Pembacaan maulid Al Barzanji setiap malam Jum'at.",
            "Ziaroh qubur setiap Jum'at pagi bersama pengasuh.",
            "Ziaroh qubur serta pembacaan surat Yasin setiap ba'da sholat Jum'at (putra).",
            "Ziaroh qubur serta pembacaan surat Yasin setiap Jum'at ba'da 'Ashar (putri).",
            "Ro'an bersama setiap Ahad pagi.",
          ],
        },
        {
          type: "list",
          heading: "Kegiatan bulanan",
          style: "numbered",
          items: [
            "Khitobah santri setiap malam Ahad Kliwon.",
            "Mau'idzotul Hasanah setiap malam Selasa Kliwon bersama masyayikh.",
            "Pengajian rutin kitab Tanbihul Ghafilin para alumni setiap Ahad malam.",
            "Pengajian rutin ibu-ibu muslimat setiap ba'da sholat Dzuhur Ahad Manis.",
            "Pembacaan sholawat Nariyah 4444 setiap malam Jum'at Manis.",
          ],
        },
        {
          type: "list",
          heading: "Kegiatan tahunan",
          style: "numbered",
          items: [
            "Harlah Ponpes Asaasunnajaah dan Haul Masyayikh.",
            "Halal bihalal alumni dan wali santri.",
            "Ziaroh Walisongo & Auliya.",
            "Ulangan Nishfu Sanah.",
            "Ulangan Akhirussanah.",
            "Haflah Akhirussanah.",
          ],
        },
      ],
    },
    ekstrakurikuler: {
      title: "Ekstrakurikuler",
      summary: "Kegiatan pengembangan bakat dan keterampilan santri di luar jam madrasah.",
      image: "ekskul",
      blocks: [
        {
          type: "list",
          heading: "Kegiatan ekstrakurikuler",
          style: "check",
          items: [
            "Maulid Al Barzanji",
            "Hadroh/Maulid Simtudduror",
            "Khitobah santri",
            "Pembacaan Ratibul Haddad",
            "Musyawarah",
            "Muhafadzoh",
            "Jurnalistik",
            "Futsal",
          ],
        },
      ],
    },
    osip: {
      title: "Organisasi Santri",
      summary: "Organisasi santri Pondok Pesantren Asaasunnajaah Kesugihan.",
      image: "asrama",
      blocks: [
        belumTersedia(
          "Susunan organisasi santri",
          "Nama pengurus, departemen, dan masa bakti organisasi santri belum kami terima. Halaman ini akan diisi setelah data resmi tersedia.",
        ),
      ],
    },
    prestasi: {
      title: "Prestasi Santri",
      summary: "Capaian santri Pondok Pesantren Asaasunnajaah Kesugihan.",
      image: "prestasi",
      blocks: [
        belumTersedia(
          "Daftar prestasi",
          "Daftar kejuaraan dan nama peraih prestasi belum kami terima, sehingga belum kami tampilkan. Silakan menghubungi narahubung pondok.",
        ),
      ],
    },
    "tata-tertib": {
      title: "Tata Tertib",
      summary: "Aturan yang berlaku bagi santri Pondok Pesantren Asaasunnajaah Kesugihan.",
      image: "halaqah",
      blocks: [
        belumTersedia(
          "Naskah tata tertib",
          "Naskah tata tertib santri belum kami terima untuk dipublikasikan. Tata tertib disampaikan kepada wali santri saat pendaftaran dan sowan ke masyayikh.",
        ),
      ],
    },
  },

  informasi: {
    berita: {
      title: "Berita Pesantren",
      summary: "Kabar kegiatan dan perkembangan Pondok Pesantren Asaasunnajaah Kesugihan.",
      image: "wisuda",
      blocks: [{ type: "articles", items: NEWS }],
    },
    agenda: {
      title: "Event & Agenda",
      summary: "Kalender kegiatan pesantren untuk santri, wali santri, dan masyarakat umum.",
      image: "hero",
      blocks: [{ type: "agenda", items: AGENDA }],
    },
    pengumuman: {
      title: "Pengumuman",
      summary: "Informasi resmi dari pengurus pesantren untuk santri dan wali santri.",
      image: "asrama",
      blocks: [{ type: "notices", items: NOTICES }],
    },
    kajian: {
      title: "Kajian & Artikel Islam",
      summary: "Tulisan keislaman dari lingkungan Pondok Pesantren Asaasunnajaah.",
      image: "kitab",
      blocks: [{ type: "articles", items: KAJIAN, showAuthor: true }],
    },
  },

  psb: {
    "alur-syarat": {
      title: "Alur & Syarat Pendaftaran",
      summary:
        "Tahapan dan berkas yang diperlukan untuk mendaftar sebagai santri Pondok Pesantren Asaasunnajaah Kesugihan.",
      image: "wisuda",
      blocks: [
        {
          type: "table",
          heading: "Jadwal pendaftaran",
          columns: ["Jalur", "Dibuka mulai", "Cara daftar"],
          rows: [
            ["Pendaftaran online", "5 April 2024", "Mengisi formulir melalui tautan resmi"],
            ["Pendaftaran offline", "24 April 2024", "Datang langsung ke pondok"],
          ],
        },
        {
          type: "steps",
          heading: "Alur pendaftaran",
          items: [
            {
              title: "Daftar online atau offline",
              text: "Pendaftaran online dibuka 5 April 2024 melalui tautan formulir, pendaftaran offline dibuka 24 April 2024 di pondok.",
            },
            {
              title: "Diantar walisantri",
              text: "Calon santri datang bersama walisantri dan mengisi formulir pendaftaran.",
            },
            {
              title: "Menyerahkan berkas",
              text: "Fotokopi KK 2 lembar dan fotokopi ijazah terakhir pendidikan.",
            },
            {
              title: "Sowan ke Masyayikh Ma'had",
              text: "Silaturahmi dan pengarahan dari masyayikh sebelum santri resmi mondok.",
            },
            {
              title: "Melengkapi administrasi",
              text: "Menyelesaikan seluruh administrasi pendaftaran dan pembayaran awal.",
            },
          ],
        },
        {
          type: "list",
          heading: "Syarat-syarat pendaftaran",
          style: "check",
          items: [
            "Diantar oleh walisantri.",
            "Mengisi formulir pendaftaran.",
            "Menyerahkan fotokopi KK 2 lembar.",
            "Menyerahkan fotokopi ijazah terakhir pendidikan.",
            "Sowan ke Masyayikh Ma'had.",
            "Melengkapi administrasi.",
          ],
        },
        {
          type: "callout",
          title: "Formulir & lokasi",
          text: `Formulir pendaftaran: ${PSB_INFO.formUrl} · Lokasi: ${PSB_INFO.location}.`,
        },
      ],
    },
    biaya: {
      title: "Rincian Biaya Pendaftaran",
      summary:
        "Rincian biaya pendaftaran santri putra dan putri Pondok Pesantren Asaasunnajaah Kesugihan.",
      image: "asrama",
      blocks: [
        {
          type: "table",
          heading: "Komponen biaya",
          columns: ["Komponen", "Santri putra", "Santri putri"],
          rows: [
            ["Pendaftaran", "Rp 50.000", "Rp 50.000"],
            ["KTS", "Rp 15.000", "Rp 15.000"],
            ["Pajak makan", "Rp 240.000 per bulan/2x", "Rp 240.000 per bulan/2x"],
            ["Jariyah (pilih salah satu, selama mondok)", BIAYA.jariyah, BIAYA.jariyah],
            ["Syahriyah", "Rp 50.000/bulan", "Rp 50.000/bulan"],
            ["Madin", "Rp 10.000/bulan", "Rp 10.000/bulan"],
            ["Kelengkapan pondok", BIAYA.kelengkapan.putra, BIAYA.kelengkapan.putri],
          ],
        },
        {
          type: "table",
          heading: "Jumlah biaya awal menurut pilihan jariyah",
          columns: ["Jariyah", "Santri putra", "Santri putri"],
          rows: BIAYA.total.map((t) => [t.jariyah, t.putra, t.putri]),
          note: "Jumlah di atas sudah termasuk syahriyah dan madin bulan pertama.",
        },
        {
          type: "list",
          heading: "Ketentuan administrasi",
          style: "numbered",
          items: [
            "Untuk pembiayaan makan, syahriyah, dan madin dibayar secara rutin setiap bulan.",
            "Untuk pembiayaan pendaftaran, jariyah, kelengkapan pondok & KTS dibayar satu kali selama menjadi santri.",
            "Untuk pembiayaan kelengkapan pondok putri meliputi: lemari, kerudung almamater, pin, buku izin, raport, buku sorogan, buku setoran.",
            "Untuk pembiayaan kelengkapan pondok putra meliputi: buku izin, raport, buku setoran, buku sorogan.",
          ],
        },
        {
          type: "table",
          heading: "Rekening pembayaran",
          columns: ["Jalur", "Bank", "Nomor rekening", "Atas nama"],
          rows: [
            [
              "Santri putra",
              BIAYA.rekening.putra.bank,
              BIAYA.rekening.putra.nomor,
              BIAYA.rekening.putra.nama,
            ],
            [
              "Santri putri",
              BIAYA.rekening.putri.bank,
              BIAYA.rekening.putri.nomor,
              BIAYA.rekening.putri.nama,
            ],
          ],
          note: `Sertakan bukti transfer, lalu kirim ke WhatsApp — putra: ${BIAYA.konfirmasi.putra.join(" / ")}; putri: ${BIAYA.konfirmasi.putri.join(" / ")}.`,
        },
      ],
    },
    formulir: {
      title: "Formulir Pendaftaran Online",
      summary: `Isi data calon santri di bawah ini, atau gunakan formulir resmi di ${PSB_INFO.formUrl}.`,
      image: "halaqah",
      blocks: [{ type: "psb-form" }],
    },
  },
};

export function getPage(section: string, slug: string) {
  return PAGES[section]?.[slug] ?? null;
}
