import {
  Bath,
  BedDouble,
  BookOpen,

  Cpu,
  Dumbbell,
  FlaskConical,
  HeartPulse,
  Landmark,
  Library,
  Mic2,
  Music,
  Palette,
  PenLine,
  Shirt,
  Soup,
  Store,
  Swords,
  Tent,
  Trophy,
  Volleyball,
  Wifi,
} from "lucide-react";

import type { ContentPage } from "./blocks";
import { AGENDA, KAJIAN, NEWS, NOTICES, PARTNERS, PSB_INFO, TESTIMONIALS } from "./site";

type PageMap = Record<string, Record<string, ContentPage>>;

export const PAGES: PageMap = {
  "tentang-kami": {
    profil: {
      title: "Profil Pesantren",
      summary:
        "Berdiri sejak 1987 di Kesugihan, Cilacap, Asasunnajaah tumbuh dari sebuah langgar kecil menjadi pesantren terpadu dengan lebih dari 1.200 santri.",
      image: "hero",
      blocks: [
        {
          type: "prose",
          heading: "Dari langgar kayu ke kampus 6 hektar",
          paragraphs: [
            "Pondok Pesantren Asasunnajaah dirintis oleh KH. Abdul Karim Mahfudz pada 12 Rabiul Awal 1408 H (1987 M). Awalnya hanya 17 santri yang mengaji kitab di langgar kayu milik keluarga, dengan sistem sorogan dan bandongan sebagaimana pesantren salaf di Jawa Tengah.",
            "Tahun 1996 pesantren membuka Madrasah Tsanawiyah, disusul Madrasah Aliyah pada 2003. Sejak 2010, program Tahfizh Al-Qur'an dikembangkan dengan sanad yang bersambung kepada KH. Arwani Amin Kudus.",
            "Hari ini Asasunnajaah dikelola oleh Yayasan Asasunnajaah Kesugihan dan diasuh oleh KH. Abdurrahman Hakim, putra sulung pendiri. Kami tetap menjaga tradisi kitab kuning sambil membekali santri dengan pendidikan formal yang terakreditasi A.",
          ],
          image: "asrama",
          caption: "Kompleks asrama putra, dibangun bertahap sejak 2008.",
        },
        {
          type: "facts",
          items: [
            { value: "1987", label: "Tahun berdiri" },
            { value: "1.248", label: "Santri mukim 2026" },
            { value: "86", label: "Asatidz & tenaga pendidik" },
            { value: "6,2 ha", label: "Luas kampus" },
          ],
        },
        {
          type: "table",
          heading: "Identitas lembaga",
          columns: ["Keterangan", "Data"],
          rows: [
            ["Nama lembaga", "Pondok Pesantren Asasunnajaah"],
            ["Nomor Statistik Pesantren", "510035060017"],
            ["Yayasan", "Yayasan Asasunnajaah Kesugihan (AHU-0012345.AH.01.04)"],
            ["Akreditasi MTs / MA", "A (BAN-S/M 2024) / A (BAN-S/M 2023)"],
            ["Pengasuh", "KH. Abdurrahman Hakim"],
            ["Alamat", "Jl. Raya Kesugihan No. 17, Kesugihan, Cilacap, Jawa Tengah"],
          ],
        },
      ],
    },
    "visi-misi": {
      title: "Visi & Misi",
      summary: "Arah yang kami pegang dalam mendidik santri: kokoh dalam iman, luhur dalam adab, luas dalam wawasan.",
      image: "halaqah",
      blocks: [
        { type: "callout", title: "Visi", text: "Terwujudnya generasi Rabbani yang berakhlaqul karimah, mutafaqqih fiddin, dan berwawasan global pada tahun 2035." },
        {
          type: "list",
          heading: "Misi",
          style: "numbered",
          items: [
            "Menyelenggarakan pendidikan Islam berbasis kitab kuning dengan sanad keilmuan yang jelas.",
            "Membina santri menghafal dan mengamalkan Al-Qur'an dengan bacaan yang mutqin.",
            "Menyelenggarakan pendidikan formal yang bermutu dan terakreditasi.",
            "Menanamkan adab, kemandirian, dan kepemimpinan melalui kehidupan berasrama.",
            "Mengembangkan bahasa Arab dan Inggris sebagai bekal studi lanjut dan dakwah.",
            "Membangun jejaring dengan perguruan tinggi, alumni, dan masyarakat.",
          ],
        },
        {
          type: "features",
          heading: "Nilai yang kami jaga",
          columns: 3,
          items: [
            { icon: BookOpen, title: "Ikhlas", text: "Belajar dan mengajar diniatkan karena Allah, bukan semata ijazah." },
            { icon: Landmark, title: "Ta'dzim", text: "Menghormati guru, kitab, dan sesama sebagai jalan keberkahan ilmu." },
            { icon: PenLine, title: "Mandiri", text: "Santri mengurus diri, kamar, dan waktunya sendiri sejak hari pertama." },
          ],
        },
      ],
    },
    struktur: {
      title: "Struktur Organisasi & Sanad",
      summary: "Susunan pengasuh dan pengelola pesantren, serta silsilah keilmuan yang menjadi rujukan pengajaran kami.",
      image: "kitab",
      blocks: [
        {
          type: "people",
          heading: "Dewan Pengasuh",
          items: [
            { name: "KH. Abdurrahman Hakim", role: "Pengasuh Utama" },
            { name: "Nyai Hj. Masruroh Hakim", role: "Pengasuh Pondok Putri" },
            { name: "KH. Muhammad Ilyas, Lc., M.A.", role: "Wakil Pengasuh, Bidang Ta'lim" },
            { name: "K. Ahmad Nawawi, Al-Hafizh", role: "Koordinator Tahfizh" },
          ],
        },
        {
          type: "people",
          heading: "Pengelola Lembaga",
          items: [
            { name: "Dr. Ahmad Fauzan, M.Pd.", role: "Ketua Yayasan" },
            { name: "Drs. H. Mahmudi, M.Pd.I.", role: "Kepala MA Asasunnajaah" },
            { name: "Siti Khoiriyah, S.Pd., M.Pd.", role: "Kepala MTs Asasunnajaah" },
            { name: "Ust. Muhammad Syafi'i, Lc.", role: "Kepala Madrasah Diniyah" },
            { name: "Ust. Hasan Basri, S.H.", role: "Kepala Kesantrian Putra" },
            { name: "Ustadzah Umi Kultsum, S.Ag.", role: "Kepala Kesantrian Putri" },
          ],
        },
        {
          type: "chain",
          heading: "Sanad Al-Qur'an (Qira'ah Imam 'Ashim riwayat Hafsh)",
          intro: "Sanad bacaan yang diijazahkan kepada santri tahfizh yang khatam 30 juz bil ghaib.",
          items: [
            { name: "Rasulullah ﷺ", note: "Menerima dari Malaikat Jibril" },
            { name: "Imam 'Ashim bin Abi An-Najud", note: "Kufah, w. 127 H" },
            { name: "Imam Hafsh bin Sulaiman", note: "Perawi bacaan Imam 'Ashim" },
            { name: "Syaikh Ahmad Abdul Aziz Az-Zayyat", note: "Mesir" },
            { name: "KH. Arwani Amin", note: "Kudus, Jawa Tengah" },
            { name: "KH. Abdul Karim Mahfudz", note: "Muassis Asasunnajaah" },
            { name: "KH. Abdurrahman Hakim", note: "Pengasuh saat ini" },
          ],
        },
      ],
    },
    fasilitas: {
      title: "Fasilitas",
      summary: "Sarana di kampus 6,2 hektar yang mendukung kegiatan belajar, ibadah, dan kehidupan sehari-hari santri.",
      image: "asrama",
      blocks: [
        {
          type: "features",
          columns: 3,
          items: [
            { icon: Landmark, title: "Masjid Jami'", text: "Daya tampung 1.500 jamaah, pusat shalat berjamaah dan pengajian umum.", meta: "1 unit" },
            { icon: BedDouble, title: "Asrama putra & putri", text: "Terpisah lokasi; 1 kamar berisi 10–12 santri dengan lemari pribadi.", meta: "42 kamar" },
            { icon: BookOpen, title: "Gedung madrasah", text: "Ruang kelas MTs, MA, dan diniyah dengan proyektor di setiap kelas.", meta: "36 kelas" },
            { icon: Library, title: "Perpustakaan", text: "Koleksi kitab turats dan buku umum, terbuka hingga pukul 21.00.", meta: "11.400 judul" },
            { icon: FlaskConical, title: "Laboratorium IPA", text: "Lab fisika, kimia, dan biologi untuk jurusan IPA MA.", meta: "3 lab" },
            { icon: Cpu, title: "Laboratorium komputer", text: "40 unit PC dan jaringan fiber untuk ANBK dan kelas TIK.", meta: "2 lab" },
            { icon: HeartPulse, title: "Poskestren", text: "Klinik pesantren dengan perawat jaga 24 jam dan dokter mitra.", meta: "24 jam" },
            { icon: Soup, title: "Dapur & ruang makan", text: "Makan tiga kali sehari dengan menu yang disusun ahli gizi.", meta: "3x sehari" },
            { icon: Dumbbell, title: "Lapangan olahraga", text: "Lapangan futsal, voli, bulu tangkis, dan area panahan.", meta: "4 lapangan" },
            { icon: Store, title: "Koperasi santri", text: "Kebutuhan harian, kitab, dan seragam dengan harga koperasi.", meta: "1 unit" },
            { icon: Bath, title: "Sanitasi", text: "Kamar mandi dengan rasio 1:8 dan air dari sumur bor sendiri.", meta: "96 bilik" },
            { icon: Wifi, title: "Ruang wali santri", text: "Ruang tamu dan layanan video call terjadwal untuk wali santri.", meta: "2 ruang" },
          ],
        },
      ],
    },
    "mitra-alumni": {
      title: "Mitra & Alumni",
      summary: "Lebih dari 6.000 alumni berkhidmah di berbagai bidang. Kami juga bekerja sama dengan lembaga pendidikan dan pemerintah.",
      image: "wisuda",
      blocks: [
        { type: "partners", heading: "Lembaga mitra", intro: "Kerja sama beasiswa, studi lanjut, pembinaan, dan layanan kesehatan.", items: PARTNERS },
        {
          type: "facts",
          items: [
            { value: "6.300+", label: "Total alumni" },
            { value: "78%", label: "Melanjutkan ke perguruan tinggi" },
            { value: "142", label: "Alumni studi di Timur Tengah" },
            { value: "37", label: "Angkatan wisuda" },
          ],
        },
        { type: "quotes", heading: "Kata alumni", items: TESTIMONIALS },
        { type: "callout", title: "Ikatan Alumni Asasunnajaah (IKASUN)", text: "Alumni dapat memperbarui data dan bergabung dengan koordinator wilayah melalui sekretariat IKASUN di kantor pesantren." },
      ],
    },
  },

  pendidikan: {
    formal: {
      title: "Pendidikan Formal",
      summary: "MTs dan MA Asasunnajaah menjalankan kurikulum Kementerian Agama dengan jam pesantren yang tetap utuh.",
      image: "kelas",
      blocks: [
        {
          type: "features",
          columns: 2,
          items: [
            { icon: BookOpen, title: "MTs Asasunnajaah", text: "Jenjang kelas VII–IX. Kurikulum Merdeka, penguatan bahasa Arab dan Inggris, serta tahsin Al-Qur'an harian.", meta: "Akreditasi A · 412 siswa" },
            { icon: FlaskConical, title: "MA Asasunnajaah", text: "Jenjang kelas X–XII dengan peminatan IPA, IPS, dan Keagamaan. Bimbingan masuk PTN dan Timur Tengah.", meta: "Akreditasi A · 386 siswa" },
          ],
        },
        {
          type: "prose",
          heading: "Pagi madrasah, sore dan malam pesantren",
          paragraphs: [
            "Kegiatan madrasah formal berlangsung pukul 07.00–13.30. Setelah itu santri beristirahat, lalu masuk Madrasah Diniyah pada sore hari dan pengajian kitab ba'da Maghrib.",
            "Dengan pembagian ini santri tidak perlu memilih antara ijazah negeri dan ilmu agama. Rata-rata nilai Ujian Madrasah MA kami 2026 adalah 87,4, dan 41 lulusan diterima di PTN melalui jalur SNBP.",
          ],
          image: "kelas",
        },
        {
          type: "table",
          heading: "Peminatan Madrasah Aliyah",
          columns: ["Peminatan", "Mata pelajaran khas", "Kuota/tahun"],
          rows: [
            ["IPA", "Biologi, Kimia, Fisika, Matematika Lanjut", "64"],
            ["IPS", "Ekonomi, Sosiologi, Geografi", "32"],
            ["Keagamaan", "Tafsir, Hadits, Ushul Fiqih, Bahasa Arab Lanjut", "32"],
          ],
        },
      ],
    },
    diniyah: {
      title: "Madrasah Diniyah",
      summary: "Jenjang ula, wustha, dan ulya yang menjadi tulang punggung pendidikan keagamaan di Asasunnajaah.",
      image: "halaqah",
      blocks: [
        {
          type: "table",
          heading: "Jenjang dan kitab pokok",
          columns: ["Jenjang", "Lama", "Kitab pokok"],
          rows: [
            ["Ula (dasar)", "3 tahun", "Mabadi Fiqih, Aqidatul Awam, Jurumiyah, Tuhfatul Athfal"],
            ["Wustha (menengah)", "3 tahun", "Fathul Qarib, Imrithi, Alfiyah Ibnu Malik, Ta'limul Muta'allim"],
            ["Ulya (atas)", "2 tahun", "Fathul Mu'in, Jauharul Maknun, Bulughul Maram, Tafsir Jalalain"],
          ],
          note: "Santri baru mengikuti tes penempatan, sehingga jenjang diniyah tidak selalu sama dengan kelas formal.",
        },
        {
          type: "list",
          heading: "Ketentuan kenaikan jenjang",
          style: "check",
          items: [
            "Kehadiran minimal 85% dalam satu tahun pelajaran.",
            "Lulus ujian tulis dan ujian lisan membaca kitab.",
            "Menyetorkan hafalan nadham sesuai jenjang (Imrithi, Alfiyah).",
            "Tidak sedang menjalani sanksi berat kesantrian.",
          ],
        },
      ],
    },
    tahfizh: {
      title: "Tahfizh Al-Qur'an",
      summary: "Program hafalan dengan target terukur, murajaah terjadwal, dan ijazah sanad bagi yang khatam 30 juz.",
      image: "tahfizh",
      blocks: [
        {
          type: "features",
          columns: 3,
          items: [
            { icon: BookOpen, title: "Tahfizh Reguler", text: "Untuk santri MTs/MA. Target 10 juz dalam 3 tahun di sela sekolah formal.", meta: "Setoran 1 halaman/hari" },
            { icon: Trophy, title: "Takhassus 30 Juz", text: "Program khusus 3 tahun tanpa sekolah formal, fokus hafalan dan qira'ah.", meta: "Kuota 40 santri" },
            { icon: Mic2, title: "Tahsin & Tilawah", text: "Perbaikan makharijul huruf dan tajwid sebelum mulai menghafal.", meta: "Semua santri baru" },
          ],
        },
        {
          type: "schedule",
          heading: "Jadwal halaqah harian",
          items: [
            { time: "03.30–04.30", title: "Ziyadah", text: "Menambah hafalan baru sebelum Subuh." },
            { time: "05.15–06.15", title: "Setoran ke musyrif", text: "Satu musyrif membimbing 12 santri." },
            { time: "16.00–17.00", title: "Murajaah", text: "Mengulang hafalan lama secara berpasangan." },
            { time: "20.30–21.15", title: "Takrir", text: "Persiapan hafalan esok hari." },
          ],
        },
        {
          type: "facts",
          items: [
            { value: "31", label: "Hafizh 30 juz angkatan 2026" },
            { value: "214", label: "Hafizh sejak 2010" },
            { value: "1:12", label: "Rasio musyrif dan santri" },
          ],
        },
      ],
    },
    "kitab-kuning": {
      title: "Pengajian Kitab Kuning",
      summary: "Tradisi sorogan dan bandongan yang kami jaga sejak hari pertama pondok berdiri.",
      image: "kitab",
      blocks: [
        {
          type: "prose",
          heading: "Dua metode, satu tujuan",
          paragraphs: [
            "Sorogan: santri membaca kitab di hadapan ustadz satu per satu, lalu dikoreksi harakat, makna, dan susunan kalimatnya. Metode ini melatih ketelitian membaca teks Arab tanpa harakat.",
            "Bandongan: kiai membaca dan memaknai kitab dengan makna gandul berbahasa Jawa, sementara santri menyimak dan menulis makna di kitab masing-masing.",
          ],
          image: "kitab",
        },
        {
          type: "table",
          heading: "Pengajian kitab ba'da Maghrib & Subuh",
          columns: ["Kitab", "Bidang", "Pengampu", "Waktu"],
          rows: [
            ["Tafsir Jalalain", "Tafsir", "KH. Abdurrahman Hakim", "Ba'da Subuh"],
            ["Riyadhus Shalihin", "Hadits", "KH. Muhammad Ilyas, Lc., M.A.", "Ba'da Maghrib"],
            ["Ihya' Ulumiddin (Rubu' 'Ibadat)", "Tasawuf", "KH. Abdurrahman Hakim", "Kamis malam"],
            ["Fathul Mu'in", "Fiqih", "Ust. Muhammad Syafi'i, Lc.", "Ba'da Isya"],
            ["Ta'limul Muta'allim", "Akhlak", "Ust. Hasan Basri, S.H.", "Ahad pagi"],
          ],
        },
      ],
    },
    kurikulum: {
      title: "Kurikulum",
      summary: "Perpaduan Kurikulum Merdeka Kementerian Agama dan kurikulum khas pesantren dalam satu jadwal 24 jam.",
      image: "kelas",
      blocks: [
        {
          type: "table",
          heading: "Komposisi jam belajar per pekan",
          columns: ["Komponen", "MTs", "MA"],
          rows: [
            ["Mata pelajaran umum (Kemenag)", "32 jam", "34 jam"],
            ["Pendidikan agama formal", "10 jam", "10 jam"],
            ["Madrasah Diniyah", "12 jam", "12 jam"],
            ["Pengajian kitab kuning", "10 jam", "12 jam"],
            ["Tahfizh & tahsin", "8 jam", "6 jam"],
            ["Bahasa Arab & Inggris (muhadatsah)", "4 jam", "4 jam"],
          ],
          totalRow: ["Total", "76 jam", "78 jam"],
        },
        {
          type: "list",
          heading: "Kompetensi lulusan",
          style: "check",
          items: [
            "Membaca dan memahami kitab fiqih dasar tanpa harakat.",
            "Hafal minimal 3 juz Al-Qur'an (MTs) dan 5 juz (MA) dengan tajwid yang benar.",
            "Mampu memimpin shalat, tahlil, dan khutbah Jumat.",
            "Berkomunikasi sederhana dalam bahasa Arab dan Inggris.",
            "Lulus Ujian Madrasah dan siap melanjutkan ke perguruan tinggi.",
          ],
        },
      ],
    },
  },

  kesantrian: {
    "kegiatan-harian": {
      title: "Kegiatan Harian Santri",
      summary: "Satu hari di Asasunnajaah dimulai sebelum Subuh dan ditutup dengan istirahat pukul 22.00.",
      image: "tahfizh",
      blocks: [
        {
          type: "schedule",
          heading: "Jadwal harian (Sabtu–Kamis)",
          intro: "Hari Jumat digunakan untuk kerja bakti, olahraga, dan kegiatan ekstrakurikuler.",
          items: [
            { time: "03.30", title: "Bangun, shalat tahajud & ziyadah" },
            { time: "04.30", title: "Shalat Subuh berjamaah & wirid" },
            { time: "05.15", title: "Pengajian kitab ba'da Subuh / setoran tahfizh" },
            { time: "06.15", title: "Mandi, sarapan, persiapan sekolah" },
            { time: "07.00", title: "Madrasah formal (MTs/MA)" },
            { time: "12.00", title: "Shalat Dzuhur berjamaah & makan siang" },
            { time: "13.30", title: "Istirahat siang (qailulah)" },
            { time: "15.00", title: "Shalat Ashar & Madrasah Diniyah" },
            { time: "17.00", title: "Murajaah, olahraga ringan, mandi" },
            { time: "17.45", title: "Shalat Maghrib & pengajian kitab" },
            { time: "19.15", title: "Shalat Isya & makan malam" },
            { time: "20.00", title: "Belajar malam terbimbing (musyawarah)" },
            { time: "22.00", title: "Istirahat malam" },
          ],
        },
      ],
    },
    ekstrakurikuler: {
      title: "Ekstrakurikuler",
      summary: "Wadah pengembangan bakat santri setiap Jumat dan Ahad, dibina oleh pelatih bersertifikat.",
      image: "ekskul",
      blocks: [
        {
          type: "features",
          columns: 3,
          items: [
            { icon: Tent, title: "Pramuka", text: "Gugus depan pangkalan pesantren; wajib bagi kelas VII dan X.", meta: "Jumat pagi" },
            { icon: Music, title: "Hadrah & Banjari", text: "Tampil rutin di haflah dan undangan masyarakat sekitar.", meta: "Kamis malam" },
            { icon: Mic2, title: "Khitobah & MTQ", text: "Latihan pidato tiga bahasa, tilawah, dan syarhil Qur'an.", meta: "Ahad pagi" },
            { icon: Swords, title: "Pencak Silat", text: "Perguruan Pagar Nusa, latihan fisik dan bela diri.", meta: "Jumat sore" },
            { icon: Volleyball, title: "Futsal & Voli", text: "Liga antarkamar dan turnamen antarpesantren se-Cilacap.", meta: "Jumat sore" },
            { icon: Palette, title: "Kaligrafi", text: "Khat naskhi, tsulutsi, dan dekorasi untuk lomba MTQ.", meta: "Ahad siang" },
            { icon: PenLine, title: "Jurnalistik", text: "Mengelola majalah santri dan konten media sosial pesantren.", meta: "Ahad siang" },
            { icon: Cpu, title: "Robotik & Coding", text: "Pengenalan Arduino dan pemrograman dasar untuk santri MA.", meta: "Ahad sore" },
            { icon: Shirt, title: "Tata Busana", text: "Keterampilan menjahit untuk santri putri.", meta: "Ahad pagi" },
          ],
        },
      ],
    },
    osip: {
      title: "Organisasi Santri (OSIP)",
      summary: "Organisasi Santri Intra Pesantren melatih santri senior memimpin, mengatur, dan melayani teman-temannya.",
      image: "asrama",
      blocks: [
        {
          type: "prose",
          paragraphs: [
            "OSIP dipilih setiap tahun melalui musyawarah santri kelas XI dan disahkan oleh pengasuh. Pengurus bertanggung jawab atas ketertiban harian, kebersihan, kegiatan ibadah, dan penyelenggaraan acara besar pesantren.",
            "Masa bakti pengurus 2026/2027 dimulai 15 Juli 2026, diketuai oleh M. Hilmi Ramadhan (putra) dan Nadia Salsabila (putri).",
          ],
        },
        {
          type: "features",
          heading: "Departemen",
          columns: 3,
          items: [
            { icon: Landmark, title: "Ubudiyah", text: "Jadwal imam, adzan, wirid, dan kegiatan ibadah berjamaah." },
            { icon: BookOpen, title: "Pendidikan", text: "Belajar malam, musyawarah kitab, dan perpustakaan kamar." },
            { icon: Trophy, title: "Keamanan", text: "Absensi, perizinan pulang, dan penegakan tata tertib." },
            { icon: HeartPulse, title: "Kesehatan & Kebersihan", text: "Piket kamar, jumat bersih, dan pendampingan santri sakit." },
            { icon: Mic2, title: "Bahasa", text: "Pekan bahasa Arab–Inggris dan pemberian kosakata harian." },
            { icon: Palette, title: "Minat & Bakat", text: "Koordinasi ekstrakurikuler dan acara haflah." },
          ],
        },
      ],
    },
    prestasi: {
      title: "Prestasi Santri",
      summary: "Capaian santri dalam dua tahun terakhir di tingkat kabupaten hingga nasional.",
      image: "prestasi",
      blocks: [
        {
          type: "table",
          heading: "Prestasi 2025–2026",
          columns: ["Tahun", "Kejuaraan", "Tingkat", "Nama", "Hasil"],
          rows: [
            ["2026", "MTQ cabang Tartil Putra", "Provinsi Jatim", "Ahmad Faiz", "Juara 1"],
            ["2026", "Musabaqah Qira'atil Kutub (Fathul Qarib)", "Nasional", "Lailatul Fitriyah", "Juara 2"],
            ["2026", "Olimpiade Sains Nasional Biologi", "Kab. Cilacap", "Zahra Aulia", "Medali Emas"],
            ["2026", "Pencak Silat Pagar Nusa Cup", "Jawa Timur", "Rizal Maulana", "Juara 1 Kelas C"],
            ["2025", "Lomba Pidato Bahasa Arab", "Nasional", "Syifa Nurhaliza", "Juara 3"],
            ["2025", "Festival Banjari", "Eks-Karesidenan Kedu", "Tim Hadrah Asasunnajaah", "Juara 1"],
            ["2025", "Kompetisi Robotik Madrasah", "Provinsi Jatim", "Tim Robotik MA", "Harapan 1"],
          ],
        },
        { type: "articles", heading: "Kabar prestasi", items: NEWS.filter((n) => n.category === "Prestasi") },
      ],
    },
    "tata-tertib": {
      title: "Tata Tertib",
      summary: "Aturan pokok yang berlaku bagi seluruh santri, disusun untuk menjaga adab dan keamanan bersama.",
      image: "halaqah",
      blocks: [
        {
          type: "list",
          heading: "Kewajiban santri",
          style: "numbered",
          items: [
            "Mengikuti shalat lima waktu berjamaah di masjid atau mushala asrama.",
            "Mengikuti seluruh kegiatan madrasah formal, diniyah, dan pengajian.",
            "Berpakaian sopan sesuai ketentuan: putra bersarung dan berpeci, putri berjilbab syar'i.",
            "Menjaga kebersihan diri, kamar, dan lingkungan pesantren.",
            "Meminta izin tertulis kepada keamanan setiap kali keluar area pondok.",
          ],
        },
        {
          type: "list",
          heading: "Larangan",
          style: "numbered",
          items: [
            "Membawa dan menggunakan telepon genggam atau perangkat elektronik pribadi.",
            "Merokok, membawa senjata tajam, atau barang terlarang lainnya.",
            "Keluar pondok tanpa izin atau menginap di luar tanpa sepengetahuan wali dan pengurus.",
            "Berinteraksi dengan lawan jenis bukan mahram tanpa keperluan yang dibenarkan.",
            "Melakukan perundungan dalam bentuk apa pun.",
          ],
        },
        {
          type: "callout",
          title: "Komunikasi dengan wali santri",
          text: "Santri dapat menelepon wali melalui wartel pesantren setiap Ahad. Wali dapat menghubungi kantor kesantrian pada jam kerja untuk keperluan mendesak.",
        },
      ],
    },
  },

  informasi: {
    berita: {
      title: "Berita Pesantren",
      summary: "Kabar terbaru kegiatan, prestasi, dan perkembangan di lingkungan Pondok Pesantren Asasunnajaah.",
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
      summary: "Tulisan para asatidz seputar fiqih, akhlak, Al-Qur'an, dan pendidikan pesantren.",
      image: "kitab",
      blocks: [{ type: "articles", items: KAJIAN, showAuthor: true }],
    },
  },

  psb: {
    "alur-syarat": {
      title: "Alur & Syarat Pendaftaran",
      summary: `Penerimaan Santri Baru tahun ajaran ${PSB_INFO.year}. Kuota ${PSB_INFO.quota}.`,
      image: "wisuda",
      blocks: [
        {
          type: "table",
          heading: "Jadwal gelombang",
          columns: ["Gelombang", "Masa pendaftaran", "Tes seleksi"],
          rows: PSB_INFO.waves.map((w) => [w.name, w.period, w.test]),
        },
        {
          type: "steps",
          heading: "Alur pendaftaran",
          items: [
            { title: "Isi formulir online", text: "Lengkapi data calon santri dan wali melalui halaman Formulir Online." },
            { title: "Bayar biaya pendaftaran", text: "Rp 250.000 via transfer ke rekening BSI yayasan; simpan bukti transfer." },
            { title: "Unggah berkas", text: "Kirim dokumen persyaratan ke WhatsApp panitia paling lambat 7 hari setelah daftar." },
            { title: "Ikuti tes seleksi", text: "Tes baca Al-Qur'an, wawancara santri dan wali, serta tes potensi akademik." },
            { title: "Pengumuman & daftar ulang", text: "Hasil diumumkan 7 hari setelah tes; daftar ulang dalam 14 hari." },
          ],
        },
        {
          type: "list",
          heading: "Berkas persyaratan",
          style: "check",
          items: [
            "Fotokopi akta kelahiran dan Kartu Keluarga (2 lembar).",
            "Fotokopi ijazah/SKL atau rapor semester terakhir yang dilegalisir.",
            "Pas foto berwarna 3x4 latar biru (4 lembar).",
            "Surat keterangan sehat dari dokter atau puskesmas.",
            "Fotokopi KTP kedua orang tua/wali.",
            "Fotokopi KIP/PKH bagi yang mengajukan keringanan biaya.",
          ],
        },
      ],
    },
    biaya: {
      title: "Rincian Biaya",
      summary: `Biaya pendidikan tahun ajaran ${PSB_INFO.year}. Tersedia beasiswa yatim, dhuafa, dan prestasi.`,
      image: "asrama",
      blocks: [
        {
          type: "table",
          heading: "Biaya masuk (sekali bayar)",
          columns: ["Komponen", "MTs", "MA"],
          rows: [
            ["Pendaftaran & tes seleksi", "Rp 250.000", "Rp 250.000"],
            ["Uang gedung & pengembangan", "Rp 3.500.000", "Rp 4.000.000"],
            ["Perlengkapan asrama (kasur, lemari)", "Rp 1.250.000", "Rp 1.250.000"],
            ["Seragam (5 stel) & atribut", "Rp 1.400.000", "Rp 1.550.000"],
            ["Kitab & buku paket tahun pertama", "Rp 850.000", "Rp 950.000"],
          ],
          totalRow: ["Total biaya masuk", "Rp 7.250.000", "Rp 8.000.000"],
        },
        {
          type: "table",
          heading: "Biaya bulanan (syahriah)",
          columns: ["Komponen", "MTs", "MA"],
          rows: [
            ["SPP madrasah formal", "Rp 200.000", "Rp 250.000"],
            ["Madrasah diniyah & pengajian", "Rp 75.000", "Rp 75.000"],
            ["Makan 3x sehari", "Rp 600.000", "Rp 600.000"],
            ["Asrama, listrik & air", "Rp 125.000", "Rp 125.000"],
            ["Laundry", "Rp 75.000", "Rp 75.000"],
          ],
          totalRow: ["Total per bulan", "Rp 1.075.000", "Rp 1.125.000"],
          note: "Biaya uang gedung dapat diangsur hingga 3 kali. Program Takhassus Tahfizh mengikuti biaya MA tanpa SPP formal.",
        },
        {
          type: "features",
          heading: "Beasiswa",
          columns: 3,
          items: [
            { icon: HeartPulse, title: "Yatim & dhuafa", text: "Gratis biaya bulanan, didukung BAZNAS Kab. Cilacap.", meta: "20 kuota" },
            { icon: Trophy, title: "Prestasi", text: "Potongan 50% uang gedung untuk juara kabupaten ke atas.", meta: "15 kuota" },
            { icon: BookOpen, title: "Hafizh", text: "Hafal minimal 5 juz saat mendaftar: gratis uang gedung.", meta: "10 kuota" },
          ],
        },
      ],
    },
    formulir: {
      title: "Formulir Pendaftaran Online",
      summary: "Isi data calon santri di bawah ini. Panitia akan menghubungi wali melalui WhatsApp dalam 1×24 jam kerja.",
      image: "halaqah",
      blocks: [{ type: "psb-form" }],
    },
  },
};

export function getPage(section: string, slug: string) {
  return PAGES[section]?.[slug] ?? null;
}

