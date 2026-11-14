import { useQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";

import { SITE } from "@/content/site";
import { AGENDA, NOTICES, PARTNERS, PSB_INFO, TESTIMONIALS } from "@/content/site";
import { dbErrorMessage, getPool } from "@/lib/db";

/**
 * Pengaturan identitas & teks situs yang bisa dikelola lewat dashboard admin
 * (/dashboard → menu "Pengaturan Situs").
 * - Disimpan sebagai JSON di tabel site_settings (name = 'site').
 * - Jika database belum terisi, dipakai nilai bawaan dari src/content/site.ts
 *   — situs tidak pernah kosong.
 */

export type SocialSetting = { label: string; href: string };

export type SiteSettings = {
  /** Nama lengkap lembaga (dipakai untuk teks SEO & alt logo). */
  name: string;
  /** Nama pendek pada header & footer. */
  short: string;
  /** Teks brand utama pada header (di samping logo). */
  brandTitle: string;
  /** Teks kecil di bawah brand header. */
  brandSub: string;
  /** Lokasi singkat, mis. "Kesugihan, Cilacap". */
  location: string;
  /** Tahun berdiri (teks bebas). */
  founded: string;
  /** Alamat lengkap pada footer & halaman kontak. */
  address: string;
  /** Nomor telepon yang ditampilkan. */
  phone: string;
  /** Nomor WhatsApp internasional tanpa "+", mis. 6281234567890. */
  whatsapp: string;
  email: string;
  /** Jam layanan kantor. */
  office: string;
  /** Kata kunci peta Google Maps. */
  mapQuery: string;
  /** Tautan media sosial (label: Facebook, Instagram, TikTok, YouTube). */
  socials: SocialSetting[];
  /** Teks kecil di atas nama pondok pada footer. */
  footerEyebrow: string;
  /** Paragraf deskripsi pada footer. */
  footerDescription: string;
  /** Teks hak cipta pada baris paling bawah footer. */
  footerCopyright: string;
};

const text = (v: unknown, fallback: string): string =>
  typeof v === "string" && v.trim() !== "" ? v.trim() : fallback;

/** Nilai bawaan — diambil dari konstanta SITE agar selalu konsisten dengan konten bawaan. */
export const DEFAULT_SETTINGS: SiteSettings = {
  name: SITE.name,
  short: SITE.short,
  brandTitle: SITE.short,
  brandSub: SITE.location,
  location: SITE.location,
  founded: String(SITE.founded),
  address: SITE.address,
  phone: SITE.phone,
  whatsapp: SITE.whatsapp,
  email: SITE.email,
  office: SITE.office,
  mapQuery: SITE.mapQuery,
  socials: SITE.socials.map((s) => ({ label: s.label, href: s.href })),
  footerEyebrow: `Pondok Pesantren Kesugihan · Cilacap`,
  footerDescription: `Lembaga pendidikan Islam berasrama di ${SITE.location}, sejak ${SITE.founded}. Memadukan kitab kuning, tahfizh Al-Qur'an, dan madrasah formal.`,
  footerCopyright: "Yayasan Asasunnajaah Kesugihan. Hak cipta dilindungi.",
};

/** Gabungkan data mentah dari database dengan nilai bawaan agar tidak ada field kosong. */
export const normalizeSettings = (raw: unknown): SiteSettings => {
  const d = (raw ?? {}) as Record<string, unknown>;
  const rawSocials = Array.isArray(d["socials"]) ? (d["socials"] as unknown[]) : [];
  const socials = rawSocials
    .filter((s): s is Record<string, unknown> => !!s && typeof s === "object")
    .map((s) => ({ label: text(s["label"], ""), href: text(s["href"], "") }))
    .filter((s) => s.label && s.href);
  return {
    name: text(d["name"], DEFAULT_SETTINGS.name),
    short: text(d["short"], DEFAULT_SETTINGS.short),
    brandTitle: text(d["brandTitle"], DEFAULT_SETTINGS.brandTitle),
    brandSub: text(d["brandSub"], DEFAULT_SETTINGS.brandSub),
    location: text(d["location"], DEFAULT_SETTINGS.location),
    founded: text(d["founded"], DEFAULT_SETTINGS.founded),
    address: text(d["address"], DEFAULT_SETTINGS.address),
    phone: text(d["phone"], DEFAULT_SETTINGS.phone),
    whatsapp: text(d["whatsapp"], DEFAULT_SETTINGS.whatsapp),
    email: text(d["email"], DEFAULT_SETTINGS.email),
    office: text(d["office"], DEFAULT_SETTINGS.office),
    mapQuery: text(d["mapQuery"], DEFAULT_SETTINGS.mapQuery),
    socials: socials.length > 0 ? socials : DEFAULT_SETTINGS.socials,
    footerEyebrow: text(d["footerEyebrow"], DEFAULT_SETTINGS.footerEyebrow),
    footerDescription: text(d["footerDescription"], DEFAULT_SETTINGS.footerDescription),
    footerCopyright: text(d["footerCopyright"], DEFAULT_SETTINGS.footerCopyright),
  };
};

const readSettings = async (): Promise<SiteSettings> => {
  try {
    const pool = await getPool();
    const [rows] = await pool.query("SELECT value FROM site_settings WHERE name = 'site' LIMIT 1");
    type SettingRow = { value: string | null };
    const list = rows as unknown as SettingRow[];
    const raw = list[0]?.value;
    return raw ? normalizeSettings(JSON.parse(raw)) : DEFAULT_SETTINGS;
  } catch {
    // Database belum siap → pakai nilai bawaan.
    return DEFAULT_SETTINGS;
  }
};

/** Baca pengaturan situs (dipakai header, footer, halaman kontak & dashboard). */
export const getSiteSettings = createServerFn({ method: "GET" }).handler(() => readSettings());

/** Simpan pengaturan situs dari dashboard (JSON tunggal pada tabel site_settings). */
export const saveSiteSettings = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as Partial<SiteSettings>)
  .handler(async ({ data }) => {
    const { requireDashboardAuth } = await import("@/lib/auth-helpers");
    await requireDashboardAuth();
    const pool = await getPool();
    try {
      const value = JSON.stringify(normalizeSettings(data));
      await pool.query(
        "INSERT INTO site_settings (name, value) VALUES ('site', ?) ON DUPLICATE KEY UPDATE value = VALUES(value)",
        [value],
      );
      return { ok: true as const };
    } catch (e) {
      throw new Error(dbErrorMessage(e));
    }
  });

/* ---------- Override isi halaman (judul, ringkasan, blok konten) ---------- */

/** Nilai JSON apa pun yang boleh lewat serialisasi server function. */
export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export type PageOverride = {
  title: string;
  summary: string;
  /** Blok konten hasil parse JSON dari database; null → pakai blok bawaan. */
  blocks: JsonValue[] | null;
};

const pageKey = (section: string, slug: string) => `${section}/${slug}`;

const readPages = async (): Promise<Record<string, PageOverride>> => {
  try {
    const pool = await getPool();
    const [rows] = await pool.query("SELECT section, slug, title, summary, blocks FROM page_overrides");
    type Row = { section: string; slug: string; title: string; summary: string; blocks: string | null };
    const list = rows as unknown as Row[];
    const map: Record<string, PageOverride> = {};
    for (const r of list) {
      let blocks: JsonValue[] | null = null;
      if (r.blocks) {
        try {
          const parsed: unknown = JSON.parse(r.blocks);
          blocks = Array.isArray(parsed) ? (parsed as JsonValue[]) : null;
        } catch {
          blocks = null;
        }
      }
      map[pageKey(r.section, r.slug)] = { title: r.title ?? "", summary: r.summary ?? "", blocks };
    }
    return map;
  } catch {
    return {};
  }
};

/** Baca semua override isi halaman (dipakai halaman konten & dashboard). */
export const getPagesContent = createServerFn({ method: "GET" }).handler(() => readPages());

/** Baca judul & ringkasan override satu halaman (dipakai loader route untuk meta/SEO). */
export const getPageMeta = createServerFn({ method: "GET" })
  .validator((d: unknown) => d as { section: string; slug: string })
  .handler(async ({ data }) => {
    try {
      const pool = await getPool();
      const [rows] = await pool.query(
        "SELECT title, summary FROM page_overrides WHERE section = ? AND slug = ? LIMIT 1",
        [data.section, data.slug],
      );
      type Row = { title: string; summary: string };
      const r = (rows as unknown as Row[])[0];
      return r ? { title: r.title ?? "", summary: r.summary ?? "" } : null;
    } catch {
      return null;
    }
  });

/** Simpan override satu halaman dari dashboard. Blok dikirim sebagai JSON siap-parse. */
export const savePageOverride = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as { section: string; slug: string; title: string; summary: string; blocksJson: string })
  .handler(async ({ data }) => {
    const { requireDashboardAuth } = await import("@/lib/auth-helpers");
    await requireDashboardAuth();
    const pool = await getPool();
    try {
      let blocksJson: string | null = null;
      const trimmed = (data.blocksJson ?? "").trim();
      if (trimmed !== "" && trimmed !== "[]") {
        const parsed = JSON.parse(trimmed); // gagal parse → error jelas untuk admin
        if (!Array.isArray(parsed)) throw new Error("Blok konten harus berupa array JSON.");
        blocksJson = JSON.stringify(parsed);
      }
      await pool.query(
        `INSERT INTO page_overrides (section, slug, title, summary, blocks)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE title = VALUES(title), summary = VALUES(summary), blocks = VALUES(blocks)`,
        [data.section, data.slug, data.title ?? "", data.summary ?? "", blocksJson],
      );
      return { ok: true as const };
    } catch (e) {
      if (e instanceof SyntaxError) throw new Error("Format JSON blok konten tidak valid — periksa kembali.");
      throw new Error(e instanceof Error ? e.message : "Gagal menyimpan halaman.");
    }
  });

/** Hapus override satu halaman → halaman kembali memakai konten bawaan. */
export const deletePageOverride = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as { section: string; slug: string })
  .handler(async ({ data }) => {
    const { requireDashboardAuth } = await import("@/lib/auth-helpers");
    await requireDashboardAuth();
    const pool = await getPool();
    try {
      await pool.query("DELETE FROM page_overrides WHERE section = ? AND slug = ?", [data.section, data.slug]);
      return { ok: true as const };
    } catch (e) {
      throw new Error(dbErrorMessage(e));
    }
  });

/* ---------- Daftar konten: statistik, program, agenda, pengumuman, dll. ---------- */

export type StatItem = { icon: string; value: string; label: string };
export type ProgramItem = { icon: string; title: string; text: string; meta: string };
export type WaveItem = { name: string; period: string; test: string };
export type AgendaEntry = { date: string; title: string; place: string; time: string };
export type NoticeEntry = { date: string; tag: string; title: string; text: string };
export type TestimonialEntry = { quote: string; name: string; role: string };

export type SiteLists = {
  /** 3 kartu statistik pada hero beranda. */
  stats: StatItem[];
  /** 4 kartu program pada beranda (tautan slot tetap: formal, formal, diniyah, tahfizh). */
  programs: ProgramItem[];
  agenda: AgendaEntry[];
  notices: NoticeEntry[];
  testimonials: TestimonialEntry[];
  partners: string[];
  psb: { year: string; quota: string; waves: WaveItem[] };
};

const str = (v: unknown, fallback = ""): string => (typeof v === "string" ? v : fallback);

const DEFAULT_PSB = { year: PSB_INFO.year, quota: PSB_INFO.quota, waves: PSB_INFO.waves.map((w) => ({ ...w })) };

export const DEFAULT_LISTS: SiteLists = {
  stats: [
    { icon: "users", value: "1.200+", label: "Santri mukim" },
    { icon: "graduation-cap", value: "86", label: "Asatidz & musyrif" },
    { icon: "book-open", value: "37", label: "Angkatan wisuda" },
  ],
  programs: [
    { icon: "graduation-cap", title: "MTs (kelas VII–IX)", text: "Madrasah Tsanawiyah dengan Kurikulum Merdeka, pendalaman bahasa Arab–Inggris, dan tahsin harian.", meta: "Akreditasi A" },
    { icon: "graduation-cap", title: "MA (kelas X–XII)", text: "Peminatan IPA, IPS, dan Keagamaan. Bimbingan melanjutkan ke PTN maupun LPTQ Kairo dan Timur Tengah.", meta: "Akreditasi A" },
    { icon: "book-open", title: "Madrasah Diniyah", text: "Jenjang ula, wustha, dan ulya sore-hari. Kitab pokok: Mabadi Fiqih sampai Bulughul Maram.", meta: "3 jenjang" },
    { icon: "scroll-text", title: "Tahfizh & Takhassus", text: "Tahfizh reguler 3 tahun untuk santri MTs/MA, atau Takhassus 30 juz penuh dengan ijazah sanad.", meta: "Kuota takhassus 40" },
  ],
  agenda: AGENDA.map((a) => ({ ...a })),
  notices: NOTICES.map((n) => ({ ...n })),
  testimonials: TESTIMONIALS.map((t) => ({ ...t })),
  partners: [...PARTNERS],
  psb: DEFAULT_PSB,
};

const iconOr = (v: unknown): string => {
  const s = str(v);
  return s.trim() !== "" ? s : "book-open";
};

/** Gabungkan data mentah dari database dengan daftar bawaan. */
export const normalizeLists = (raw: unknown): SiteLists => {
  const d = (raw ?? {}) as Record<string, unknown>;
  const statsRaw = Array.isArray(d["stats"]) ? d["stats"] : [];
  const programsRaw = Array.isArray(d["programs"]) ? d["programs"] : [];
  const agendaRaw = Array.isArray(d["agenda"]) ? d["agenda"] : [];
  const noticesRaw = Array.isArray(d["notices"]) ? d["notices"] : [];
  const testimonialsRaw = Array.isArray(d["testimonials"]) ? d["testimonials"] : [];
  const partnersRaw = Array.isArray(d["partners"]) ? d["partners"] : [];
  const psbRaw = (d["psb"] ?? {}) as Record<string, unknown>;
  const wavesRaw = Array.isArray(psbRaw["waves"]) ? psbRaw["waves"] : [];

  const stats = (statsRaw as unknown[])
    .map((it) => {
      const o = (it ?? {}) as Record<string, unknown>;
      return { icon: iconOr(o["icon"]), value: str(o["value"]), label: str(o["label"]) };
    })
    .filter((s) => s.value || s.label);

  const programs = (programsRaw as unknown[])
    .map((it) => {
      const o = (it ?? {}) as Record<string, unknown>;
      return { icon: iconOr(o["icon"]), title: str(o["title"]), text: str(o["text"]), meta: str(o["meta"]) };
    })
    .filter((p) => p.title);

  const agenda = (agendaRaw as unknown[])
    .map((it) => {
      const o = (it ?? {}) as Record<string, unknown>;
      return { date: str(o["date"]), title: str(o["title"]), place: str(o["place"]), time: str(o["time"]) };
    })
    .filter((a) => a.title);

  const notices = (noticesRaw as unknown[])
    .map((it) => {
      const o = (it ?? {}) as Record<string, unknown>;
      return { date: str(o["date"]), tag: str(o["tag"]), title: str(o["title"]), text: str(o["text"]) };
    })
    .filter((n) => n.title);

  const testimonials = (testimonialsRaw as unknown[])
    .map((it) => {
      const o = (it ?? {}) as Record<string, unknown>;
      return { quote: str(o["quote"]), name: str(o["name"]), role: str(o["role"]) };
    })
    .filter((t) => t.quote || t.name);

  const partners = partnersRaw.filter((p): p is string => typeof p === "string" && p.trim() !== "");

  const waves = (wavesRaw as unknown[])
    .map((it) => {
      const o = (it ?? {}) as Record<string, unknown>;
      return { name: str(o["name"]), period: str(o["period"]), test: str(o["test"]) };
    })
    .filter((w) => w.name);

  return {
    stats: stats.length > 0 ? stats : DEFAULT_LISTS.stats,
    programs: programs.length > 0 ? programs : DEFAULT_LISTS.programs,
    agenda: agenda.length > 0 ? agenda : DEFAULT_LISTS.agenda,
    notices: notices.length > 0 ? notices : DEFAULT_LISTS.notices,
    testimonials: testimonials.length > 0 ? testimonials : DEFAULT_LISTS.testimonials,
    partners: partners.length > 0 ? partners : DEFAULT_LISTS.partners,
    psb: {
      year: str(psbRaw["year"], DEFAULT_PSB.year) || DEFAULT_PSB.year,
      quota: str(psbRaw["quota"], DEFAULT_PSB.quota) || DEFAULT_PSB.quota,
      waves: waves.length > 0 ? waves : DEFAULT_PSB.waves,
    },
  };
};

const readLists = async (): Promise<SiteLists> => {
  try {
    const pool = await getPool();
    const [rows] = await pool.query("SELECT value FROM site_settings WHERE name = 'lists' LIMIT 1");
    type SettingRow = { value: string | null };
    const list = rows as unknown as SettingRow[];
    const raw = list[0]?.value;
    return raw ? normalizeLists(JSON.parse(raw)) : DEFAULT_LISTS;
  } catch {
    return DEFAULT_LISTS;
  }
};

/** Baca daftar konten (dipakai beranda, halaman konten & dashboard). */
export const getSiteLists = createServerFn({ method: "GET" }).handler(() => readLists());

/** Simpan daftar konten dari dashboard (JSON tunggal pada tabel site_settings, name = 'lists'). */
export const saveSiteLists = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as Partial<SiteLists>)
  .handler(async ({ data }) => {
    const { requireDashboardAuth } = await import("@/lib/auth-helpers");
    await requireDashboardAuth();
    const pool = await getPool();
    try {
      const value = JSON.stringify(normalizeLists(data));
      await pool.query(
        "INSERT INTO site_settings (name, value) VALUES ('lists', ?) ON DUPLICATE KEY UPDATE value = VALUES(value)",
        [value],
      );
      return { ok: true as const };
    } catch (e) {
      throw new Error(dbErrorMessage(e));
    }
  });

/** Hook klien: daftar konten terbaru (fallback ke bawaan saat database kosong). */
export function useSiteLists(): SiteLists {
  const { data } = useQuery({
    queryKey: ["site-lists"],
    queryFn: () => getSiteLists(),
    staleTime: 60_000,
  });
  return data ?? DEFAULT_LISTS;
}

/** Hook klien: pengaturan situs terbaru (fallback ke bawaan saat database kosong). */
export function useSiteSettings(): SiteSettings {
  const { data } = useQuery({
    queryKey: ["site-settings"],
    queryFn: () => getSiteSettings(),
    staleTime: 60_000,
  });
  return data ?? DEFAULT_SETTINGS;
}
