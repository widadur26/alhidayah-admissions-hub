import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  MapPin,
  MessageCircle,
  Route as RouteIcon,
  ScrollText,
  Users,
  Wallet,
} from "lucide-react";

import kelasImage from "@/assets/kelas-formal.jpg";
import tahfizhImage from "@/assets/santri-tahfizh.jpg";
import wisudaImage from "@/assets/wisuda.jpg";
import { getSiteContent } from "@/lib/content-store";
import { SectionHeading } from "@/components/site/SectionHeading";
import { ArticleCard, AgendaRow, NoticeRow, QuoteCard } from "@/components/site/blocks";
import { IMAGES, type ImageKey } from "@/lib/images";
import { AGENDA, NEWS, NOTICES, PSB_INFO, SITE, TESTIMONIALS } from "@/content/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PP Asasunnajaah Kesugihan–Cilacap · Madrasah, Tahfizh & Kitab Kuning" },
      {
        name: "description",
        content:
          "Pondok Pesantren Asasunnajaah di Kesugihan, Cilacap: MTs & MA terakreditasi, madrasah diniyah, tahfizh Al-Qur'an, dan pengajian kitab kuning. Info lengkap PSB 2027/2028 di sini.",
      },
      {
        property: "og:title",
        content: "PP Asasunnajaah Kesugihan–Cilacap · Madrasah, Tahfizh & Kitab Kuning",
      },
      {
        property: "og:description",
        content: "PSB santri baru 2027/2028 dibuka. Lihat program, biaya, dan formulir pendaftaran online.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const SLIDES = [
  {
    eyebrow: "Pondok Pesantren Asasunnajaah",
    title: "Madrasah, Tahfizh, dan Kitab Kuning dalam Satu Hari",
    text: "Pagi sekolah formal MTs/MA, sore masuk diniyah, malam pagelaran kitab ba'da Maghrib. Santri Asasunnajaah tidak perlu memilih antara ijazah dan ilmu agama.",
    image: kelasImage,
    alt: "Santri MTs/MA belajar di ruang kelas yang terang",
  },
  {
    eyebrow: "Tahfizh & Diniyah",
    title: "Hafalan Bertahap dengan Musyrif Pembimbing",
    text: "Setoran ziyadah sebelum Subuh, murajaah sore berpasangan, dan takrir malam. Satu musyrif membegusi 12 santri, sejak kelas VII hingga khatam 30 juz.",
    image: tahfizhImage,
    alt: "Santri mengaji Al-Qur'an di masjid pada pagi hari",
  },
  {
    eyebrow: "PSB 2027/2028 Telah Dibuka",
    title: "Daftar Santri Baru dari Rumah",
    text: `Gelombang I: 1 November 2026 – 31 Januari 2027. Isi formulir online, panitia menghubungi wali lewat WhatsApp dalam 1×24 jam kerja.`,
    image: wisudaImage,
    alt: "Wisuda akbar santri di aula pondok",
  },
];

const STATS = [
  { icon: Users, value: "1.200+", label: "Santri mukim" },
  { icon: GraduationCap, value: "86", label: "Asatidz & musyrif" },
  { icon: BookOpen, value: "37", label: "Angkatan wisuda" },
];

const PROGRAMS = [
  {
    icon: GraduationCap,
    title: "MTs (kelas VII–IX)",
    href: { section: "pendidikan", slug: "formal" } as const,
    text: "Madrasah Tsanawiyah dengan Kurikulum Merdeka, pendalaman bahasa Arab–Inggris, dan tahsin harian.",
    meta: "Akreditasi A",
  },
  {
    icon: GraduationCap,
    title: "MA (kelas X–XII)",
    href: { section: "pendidikan", slug: "formal" } as const,
    text: "Peminatan IPA, IPS, dan Keagamaan. Bimbingan melanjutkan ke PTN maupun LPTQ kairo dan Timur Tengah.",
    meta: "Akreditasi A",
  },
  {
    icon: BookOpen,
    title: "Madrasah Diniyah",
    href: { section: "pendidikan", slug: "diniyah" } as const,
    text: "Jenjang ula, wustha, dan ulya sore-hari. Kitab pokok: Mabadi Fiqih sampai Bulughul Maram.",
    meta: "3 jenjang",
  },
  {
    icon: ScrollText,
    title: "Tahfizh & Takhassus",
    href: { section: "pendidikan", slug: "tahfizh" } as const,
    text: "Tahfizh reguler 3 tahun untuk santri MTs/MA, atau Takhassus 30 juz penuh dengan ijazah sanad.",
    meta: "Kuota takhassus 40",
  },
];

const GALLERY: { image: ImageKey; caption: string }[] = [
  { image: "tahfizh", caption: "Halaqah ba'da Subuh" },
  { image: "kitab", caption: "Bandongan kitab" },
  { image: "kelas", caption: "Kelas MTs" },
  { image: "ekskul", caption: "Ekstrakurikuler" },
  { image: "asrama", caption: "Asrama putra" },
  { image: "halaqah", caption: "Halaqah santriwati" },
];

function Index() {
  const [slide, setSlide] = useState(0);

  // Konten yang dikelola lewat dashboard admin (/dashboard).
  const { data: saved } = useQuery({
    queryKey: ["site-content"],
    queryFn: () => getSiteContent(),
    staleTime: 30_000,
  });

  const slides = useMemo(
    () =>
      SLIDES.map((d, i) => {
        const s = saved?.hero?.[i];
        return {
          ...d,
          image: s?.imageUrl || d.image,
          eyebrow: s?.eyebrow?.trim() || d.eyebrow,
          title: s?.title?.trim() || d.title,
          text: s?.text?.trim() || d.text,
        };
      }),
    [saved],
  );

  const news = useMemo(() => {
    const items = saved?.news ?? [];
    if (items.length === 0) return NEWS;
    return items.map((n) => ({
      title: n.title,
      excerpt: n.excerpt,
      category: n.category,
      date: n.date,
      ...(n.author.trim() ? { author: n.author } : {}),
      ...(n.imageUrl ? { imageUrl: n.imageUrl } : {}),
    }));
  }, [saved]);

  const gallery = useMemo(
    () =>
      GALLERY.map((d, i) => ({
        caption: saved?.gallery?.[i]?.caption?.trim() || d.caption,
        src: saved?.gallery?.[i]?.imageUrl || IMAGES[d.image],
      })),
    [saved],
  );

  const total = slides.length;

  const next = useCallback(() => setSlide((s) => (s + 1) % total), [total]);
  const prev = useCallback(() => setSlide((s) => (s - 1 + total) % total), [total]);

  useEffect(() => {
    const id = window.setInterval(next, 7000);
    return () => window.clearInterval(id);
  }, [next]);

  const current = slides[slide] ?? slides[0]!;

  return (
    <div className="min-h-screen bg-background">
      <main>
        {/* Hero */}
        <section id="beranda" className="relative isolate flex min-h-[100svh] items-center overflow-hidden">
          {slides.map((s, i) => (
            <img
              key={s.title}
              src={s.image}
              alt={s.alt}
              width={1600}
              height={1000}
              aria-hidden={i !== slide}
              className={`absolute inset-0 -z-20 h-full w-full object-cover transition-opacity duration-700 ease-out ${
                i === slide ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
          <div className="absolute inset-0 -z-10 bg-hero-overlay" />
          <div className="absolute inset-x-0 bottom-0 -z-10 h-48 bg-hero-fade" />

          <div className="mx-auto w-full max-w-7xl px-4 pb-20 pt-32 sm:px-6 lg:pt-36">
            <div className="max-w-3xl">
              <p className="animate-rise inline-flex items-center gap-2 rounded-full bg-gold/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-gold ring-1 ring-gold/30">
                PSB {PSB_INFO.year} · Gelombang I dibuka
              </p>
              <div key={slide} className="animate-rise">
                <p className="mt-6 text-sm font-medium uppercase tracking-[0.18em] text-gold">{current.eyebrow}</p>
                <h1
                  className="mt-3 text-4xl font-extrabold leading-[1.12] text-white text-glow sm:text-5xl lg:text-[3.5rem]"
                  style={{ animationDelay: "120ms" }}
                >
                  {current.title}
                </h1>
                <p
                  className="mt-6 max-w-xl text-base leading-relaxed text-nav-muted sm:text-lg"
                  style={{ animationDelay: "240ms" }}
                >
                  {current.text}
                </p>
              </div>
              <div className="animate-rise mt-9 flex flex-wrap items-center gap-3" style={{ animationDelay: "360ms" }}>
                <Link
                  to="/$section/$slug"
                  params={{ section: "psb", slug: "formulir" }}
                  className="group inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-accent-foreground shadow-cta transition-all hover:-translate-y-0.5 hover:bg-terracotta-hover"
                >
                  Daftar PSB Online
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/$section/$slug"
                  params={{ section: "psb", slug: "biaya" }}
                  className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-nav-foreground ring-1 ring-nav-foreground/30 backdrop-blur-sm transition-colors hover:bg-nav-foreground/10"
                >
                  Rincian biaya
                </Link>
              </div>

              <div className="animate-rise mt-12 flex items-center gap-4" style={{ animationDelay: "440ms" }}>
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Slide sebelumnya"
                  className="grid h-11 w-11 place-items-center rounded-full text-nav-foreground ring-1 ring-nav-foreground/30 backdrop-blur-sm transition-colors hover:bg-nav-foreground/10"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-2" role="tablist" aria-label="Pilih slide">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      role="tab"
                      aria-label={`Slide ${i + 1}`}
                      aria-selected={i === slide}
                      onClick={() => setSlide(i)}
                      className={
                        i === slide
                          ? "h-2.5 w-8 rounded-full bg-gold transition-all"
                          : "h-2.5 w-2.5 rounded-full bg-nav-foreground/30 transition-all hover:bg-nav-foreground/50"
                      }
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={next}
                  aria-label="Slide berikutnya"
                  className="grid h-11 w-11 place-items-center rounded-full text-nav-foreground ring-1 ring-nav-foreground/30 backdrop-blur-sm transition-colors hover:bg-nav-foreground/10"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            <dl className="animate-rise mt-12 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3" style={{ animationDelay: "480ms" }}>
              {STATS.map(({ icon: Icon, value, label }) => (
                <div key={label} className="flex items-center gap-3 rounded-2xl bg-nav px-4 py-3.5 ring-1 ring-nav-foreground/10 backdrop-blur-md">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gold/15 text-gold">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <dt className="sr-only">{label}</dt>
                    <dd className="font-display text-xl font-semibold text-nav-foreground">{value}</dd>
                    <p className="text-xs text-nav-muted">{label}</p>
                  </div>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Info PSB */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
          <SectionHeading
            eyebrow="Penerimaan Santri Baru"
            title={`PSB ${PSB_INFO.year}`}
            description="Dua gelombang pendaftaran dalam setahun. Wali santri dapat menghubungi panitia lebih dulu untuk bertanya sebelum mengisi formulir."
            action={
              <Link
                to="/$section/$slug"
                params={{ section: "psb", slug: "alur-syarat" }}
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-colors hover:bg-terracotta-hover"
              >
                <RouteIcon className="h-4 w-4" />
                Alur & syarat
              </Link>
            }
          />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {PSB_INFO.waves.map((w) => (
              <div key={w.name} className="rounded-xl border border-border bg-card p-6">
                <p className="eyebrow">{w.name}</p>
                <p className="mt-3 font-display text-lg font-semibold text-foreground">Pendaftaran {w.period}</p>
                <dl className="mt-4 space-y-2 text-sm">
                  <div className="flex gap-2">
                    <dt className="text-muted-foreground">Tes seleksi:</dt>
                    <dd className="font-medium text-foreground">{w.test}</dd>
                  </div>
                </dl>
              </div>
            ))}
            <div className="rounded-xl bg-terracotta-deep p-6 text-accent-foreground">
              <p className="eyebrow text-accent-foreground">Kuota & kontak</p>
              <p className="mt-3 font-display text-lg font-semibold">{PSB_INFO.quota} santri baru</p>
              <p className="mt-2 text-sm text-accent-foreground/90">Panitia melayani {SITE.office}.</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href={`https://wa.me/${SITE.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-terracotta-hover"
                >
                  <MessageCircle className="h-4 w-4" />
                  Tanya panitia
                </a>
                <Link
                  to="/$section/$slug"
                  params={{ section: "psb", slug: "biaya" }}
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold ring-1 ring-accent-foreground/30 transition-colors hover:bg-accent-foreground/10"
                >
                  <Wallet className="h-4 w-4" />
                  Rincian biaya
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Program pendidikan */}
        <section className="bg-muted">
          <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
            <SectionHeading
              eyebrow="Program"
              title="Pilihan program santri baru"
              description="Empat jalur yang bisa dipilih saat mendaftar. Santri boleh mengikuti lebih dari satu program sesuai tes penempatan."
            />
            <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {PROGRAMS.map(({ icon: Icon, title, href, text, meta }) => (
                <Link
                  key={title}
                  to="/$section/$slug"
                  params={href}
                  className="group flex flex-col rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-lg"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-secondary text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-semibold text-foreground">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{text}</p>
                  <span className="mt-auto flex items-center justify-between pt-4 text-xs font-semibold text-accent">
                    {meta}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </section>

        {/* Agenda & pengumuman */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <SectionHeading eyebrow="Kalender" title="Agenda terdekat" />
              <ul className="mt-8 divide-y divide-border rounded-xl border border-border bg-card px-5">
                {AGENDA.slice(0, 4).map((a) => (
                  <AgendaRow key={a.title} item={a} compact />
                ))}
              </ul>
              <Link
                to="/$section/$slug"
                params={{ section: "informasi", slug: "agenda" }}
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
              >
                Seluruh agenda
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div>
              <SectionHeading eyebrow="Pengumuman" title="Info wali santri" />
              <ul className="mt-8 divide-y divide-border rounded-xl border border-border bg-card px-5">
                {NOTICES.slice(0, 3).map((n) => (
                  <NoticeRow key={n.title} item={n} />
                ))}
              </ul>
              <Link
                to="/$section/$slug"
                params={{ section: "informasi", slug: "pengumuman" }}
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
              >
                Seluruh pengumuman
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Berita terbaru */}
        <section className="bg-muted">
          <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
            <SectionHeading
              eyebrow="Berita"
              title="Kabar terbaru dari pondok"
              action={
                <Link
                  to="/$section/$slug"
                  params={{ section: "informasi", slug: "berita" }}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                >
                  Semua berita
                  <ArrowRight className="h-4 w-4" />
                </Link>
              }
            />
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {news.slice(0, 3).map((a) => (
                <ArticleCard key={a.title} article={a} to="berita" />
              ))}
            </div>
          </section>
        </section>

        {/* Galeri */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
          <SectionHeading
            eyebrow="Galeri"
            title="Suasana keseharian santri"
            action={
              <Link
                to="/galeri-kontak"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
              >
                Galeri lengkap
                <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
          <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3">
            {gallery.map((g, i) => (
              <figure key={i} className="group relative overflow-hidden rounded-xl">
                <img
                  src={g.src}
                  alt={g.caption}
                  loading="lazy"
                  width={1280}
                  height={864}
                  className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <figcaption className="absolute inset-x-0 bottom-0 bg-hero-fade px-4 pb-3 pt-10 text-sm font-medium text-deep-foreground">
                  {g.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* Testimoni */}
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:pb-20">
          <SectionHeading eyebrow="Wali santri & alumni" title="Kata mereka tentang Asasunnajaah" />
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {TESTIMONIALS.slice(0, 2).map((q) => (
              <QuoteCard key={q.name} item={q} />
            ))}
          </div>
        </section>

        {/* CTA akhir */}
        <section className="bg-deep text-deep-foreground">
          <div className="mx-auto flex max-w-7xl flex-col items-start gap-8 px-4 py-16 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:py-20">
            <div className="max-w-2xl">
              <p className="eyebrow text-gold">Kunjungi kami</p>
              <h2 className="mt-3 text-3xl font-extrabold leading-tight text-white text-glow sm:text-4xl">
                Mampir ke pondok sebelum mendaftar
              </h2>
              <p className="mt-4 leading-relaxed text-deep-muted">
                Wali santri dipersilakan melihat langsung asrama, kelas, dan masjid. Cukup konfirmasi hari
                kunjungan lewat WhatsApp panitia PSB · {SITE.office}.
              </p>
              <p className="mt-4 inline-flex items-center gap-2 text-sm text-deep-muted">
                <MapPin className="h-4 w-4 shrink-0 text-gold" />
                {SITE.address}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href={`https://wa.me/${SITE.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold shadow-cta transition-colors hover:bg-terracotta-hover"
              >
                <MessageCircle className="h-4 w-4" />
                Hubungi WhatsApp
              </a>
              <Link
                to="/galeri-kontak"
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold ring-1 ring-deep-foreground/30 transition-colors hover:bg-deep-foreground/10"
              >
                Peta & kontak
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
