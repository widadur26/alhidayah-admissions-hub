import { createServerFn } from "@tanstack/react-start";
import { dbErrorMessage, getPool } from "@/lib/db";
import { saveUploadFile } from "@/lib/uploads";

/**
 * Penyimpanan konten yang bisa dikelola lewat dashboard admin (/dashboard).
 * - Teks & referensi gambar disimpan di MySQL/MariaDB XAMPP (lihat src/lib/db.ts):
 *   tabel hero_slides, news_items, gallery_photos, site_settings.
 * - Gambar disimpan di Vercel Blob saat deploy, atau public/uploads saat lokal.
 * - Jika database belum terisi, beranda memakai konten bawaan — situs tidak pernah kosong.
 * Semua akses berkas/database hanya berjalan di server (dynamic import).
 */

export type HeroContent = { eyebrow: string; title: string; text: string; imageUrl: string | null };
export type NewsContent = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  author: string;
  imageUrl: string | null;
};
export type GalleryContent = { caption: string; imageUrl: string | null };

export type SiteContent = {
  logo: string | null;
  hero: HeroContent[];
  news: NewsContent[];
  gallery: GalleryContent[];
  /** Galeri pada halaman /galeri-kontak (9 slot). */
  siteGallery: GalleryContent[];
};

export const EMPTY_CONTENT: SiteContent = {
  logo: null,
  hero: [],
  news: [],
  gallery: [],
  siteGallery: [],
};

export const GALLERY_PAGE_SLOTS = 9;

const readContent = async (): Promise<SiteContent> => {
  try {
    const pool = await getPool();
    const [heroRows] = await pool.query(
      "SELECT slot, eyebrow, title, body, image_url FROM hero_slides ORDER BY slot",
    );
    const [newsRows] = await pool.query(
      "SELECT id, title, category, published_at, author, excerpt, image_url FROM news_items ORDER BY position ASC",
    );
    const [galleryRows] = await pool.query(
      "SELECT slot, caption, image_url FROM gallery_photos ORDER BY slot",
    );
    const [siteGalleryRows] = await pool.query(
      "SELECT slot, caption, image_url FROM page_gallery ORDER BY slot",
    );
    const [settingRows] = await pool.query(
      "SELECT value FROM site_settings WHERE name = 'logo' LIMIT 1",
    );
    type HeroRow = { slot: number; eyebrow: string; title: string; body: string | null; image_url: string | null };
    type NewsRow = { id: string; title: string; category: string; published_at: string; author: string; excerpt: string | null; image_url: string | null };
    type GalleryRow = { slot: number; caption: string; image_url: string | null };
    type SettingRow = { value: string | null };

    const heroList = heroRows as unknown as HeroRow[];
    const newsList = newsRows as unknown as NewsRow[];
    const galleryList = galleryRows as unknown as GalleryRow[];
    const siteGalleryList = siteGalleryRows as unknown as GalleryRow[];
    const settingList = settingRows as unknown as SettingRow[];

    return {
      logo: settingList[0]?.value ?? null,
      hero: [0, 1, 2].map((i) => {
        const r = heroList.find((h) => Number(h.slot) === i);
        return {
          eyebrow: r?.eyebrow ?? "",
          title: r?.title ?? "",
          text: r?.body ?? "",
          imageUrl: r?.image_url ?? null,
        };
      }),
      news: newsList.map((r) => ({
        id: String(r.id),
        title: r.title,
        category: r.category,
        date: r.published_at ?? "",
        author: r.author,
        excerpt: r.excerpt ?? "",
        imageUrl: r.image_url ?? null,
      })),
      gallery: [0, 1, 2, 3, 4, 5].map((i) => {
        const r = galleryList.find((g) => Number(g.slot) === i);
        return {
          caption: r?.caption ?? "",
          imageUrl: r?.image_url ?? null,
        };
      }),
      siteGallery: [...Array(GALLERY_PAGE_SLOTS).keys()].map((i) => {
        const r = siteGalleryList.find((g) => Number(g.slot) === i);
        return {
          caption: r?.caption ?? "",
          imageUrl: r?.image_url ?? null,
        };
      }),
    };
  } catch {
    // Database belum siap → kembalikan kosong; beranda memakai konten bawaan.
    return EMPTY_CONTENT;
  }
};

/** Baca konten tersimpan (dipakai beranda & dashboard). */
export const getSiteContent = createServerFn({ method: "GET" }).handler(() => readContent());

/** Simpan seluruh konten dari dashboard ke MySQL (transaksi: semua berhasil atau tidak sama sekali). */
export const saveSiteContent = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as SiteContent)
  .handler(async ({ data }) => {
    const { requireDashboardAuth } = await import("@/lib/auth-helpers");
    await requireDashboardAuth();
    const pool = await getPool();
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query("DELETE FROM hero_slides");
      for (let i = 0; i < 3; i++) {
        const h = data.hero[i];
        if (h) {
          await conn.query("INSERT INTO hero_slides (slot, eyebrow, title, body, image_url) VALUES (?, ?, ?, ?, ?)", [
            i,
            h.eyebrow ?? "",
            h.title ?? "",
            h.text ?? "",
            h.imageUrl ?? null,
          ]);
        }
      }
      await conn.query("DELETE FROM gallery_photos");
      for (let i = 0; i < 6; i++) {
        const g = data.gallery[i];
        if (g) {
          await conn.query("INSERT INTO gallery_photos (slot, caption, image_url) VALUES (?, ?, ?)", [
            i,
            g.caption ?? "",
            g.imageUrl ?? null,
          ]);
        }
      }
      await conn.query("DELETE FROM page_gallery");
      for (let i = 0; i < GALLERY_PAGE_SLOTS; i++) {
        const g = data.siteGallery?.[i];
        if (g) {
          await conn.query("INSERT INTO page_gallery (slot, caption, image_url) VALUES (?, ?, ?)", [
            i,
            g.caption ?? "",
            g.imageUrl ?? null,
          ]);
        }
      }
      await conn.query("DELETE FROM news_items");
      for (let i = 0; i < data.news.length; i++) {
        const n = data.news[i];
        await conn.query(
          "INSERT INTO news_items (id, position, title, category, published_at, author, excerpt, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          [n.id, i, n.title ?? "", n.category ?? "", n.date ?? "", n.author ?? "", n.excerpt ?? "", n.imageUrl ?? null],
        );
      }
      await conn.query("DELETE FROM site_settings WHERE name = 'logo'");
      if (data.logo) {
        await conn.query("INSERT INTO site_settings (name, value) VALUES ('logo', ?)", [data.logo]);
      }
      await conn.commit();
      return { ok: true as const };
    } catch (e) {
      await conn.rollback();
      throw new Error(dbErrorMessage(e));
    } finally {
      conn.release();
    }
  });

/** Unggah satu gambar (dikirim sebagai data URL base64 dari dashboard) → disimpan sebagai berkas. */
export const uploadImage = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as { name?: string; dataUrl?: string })
  .handler(async ({ data }) => {
    const { requireDashboardAuth } = await import("@/lib/auth-helpers");
    await requireDashboardAuth();
    const url = await saveUploadFile(data?.name ?? "gambar", data?.dataUrl ?? "");
    return { url };
  });
