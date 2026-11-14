import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, MessageCircle } from "lucide-react";

import { getPage } from "@/content/pages";
import { getPagesContent, getPageMeta, useSiteLists, useSiteSettings, DEFAULT_LISTS } from "@/lib/site-settings";
import { normalizeBlocks } from "@/lib/block-icons";
import type { Block } from "@/content/blocks";
import { BlockRenderer } from "@/components/site/blocks";
import { PageHero } from "@/components/site/PageHero";
import { findNavPage } from "@/components/site/nav-data";
import { cn } from "@/lib/utils";

/**
 * Saat halaman memakai blok bawaan (tidak dioverride lewat menu "Halaman Situs"),
 * daftar agenda/pengumuman/testimoni/mitra & jadwal gelombang PSB diambil dari
 * dashboard (menu "Konten Beranda & Daftar") agar tidak pernah lama.
 */
const patchListBlocks = (blocks: Block[], section: string, lists: ReturnType<typeof useSiteLists>): Block[] =>
  blocks.map((b) => {
    if (b.type === "agenda") return { ...b, items: lists.agenda };
    if (b.type === "notices") return { ...b, items: lists.notices };
    if (b.type === "quotes") return { ...b, items: lists.testimonials };
    if (b.type === "partners") return { ...b, items: [...lists.partners] };
    if (section === "psb" && b.type === "table" && b.heading === "Jadwal gelombang") {
      return { ...b, rows: lists.psb.waves.map((w) => [w.name, w.period, w.test]) };
    }
    return b;
  });

export const Route = createFileRoute("/$section/$slug")({
  loader: async ({ params }) => {
    const nav = findNavPage(params.section, params.slug);
    const page = getPage(params.section, params.slug);
    if (!nav || !page) throw notFound();
    // Judul/ringkasan bisa dioverride dari dashboard admin (/dashboard → menu "Halaman").
    const meta = await getPageMeta({ data: { section: params.section, slug: params.slug } });
    const title = meta?.title?.trim() || page.title;
    const summary = meta?.summary?.trim() || page.summary;
    return { section: params.section, slug: params.slug, title, summary, groupLabel: nav.group.label };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Halaman tidak ditemukan — Asasunnajaah" }, { name: "robots", content: "noindex" }] };
    const title = `${loaderData.title} — Pondok Pesantren Asasunnajaah`;
    return {
      meta: [
        { title },
        { name: "description", content: loaderData.summary },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData.summary },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ContentRoute,
});

function ContentRoute() {
  const { section, slug, title: loaderTitle, summary: loaderSummary, groupLabel } = Route.useLoaderData();
  const site = useSiteSettings();
  const lists = useSiteLists();
  const page = getPage(section, slug)!;
  const nav = findNavPage(section, slug)!;
  const isPsb = section === "psb";

  // Blok konten halaman bisa dioverride dari dashboard admin.
  const { data: pagesContent } = useQuery({
    queryKey: ["pages-content"],
    queryFn: () => getPagesContent(),
    staleTime: 60_000,
  });
  const override = pagesContent?.[`${section}/${slug}`];
  const blocks = normalizeBlocks(override?.blocks ?? page.blocks);

  // Daftar dari dashboard diterapkan hanya pada blok bawaan.
  const patchedBlocks = override?.blocks ? blocks : patchListBlocks(blocks, section, lists);

  // Ringkasan halaman PSB bawaan memuat tahun ajaran — ikuti pengaturan PSB terbaru.
  const title = override?.title?.trim() || loaderTitle;
  const summary =
    override?.summary?.trim() ||
    (isPsb ? loaderSummary.replaceAll(DEFAULT_LISTS.psb.year, lists.psb.year) : loaderSummary);

  return (
    <main>
      <PageHero title={title} summary={summary} image={page.image} trail={[groupLabel, title]} />
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:py-20">
        <div className="min-w-0">
          <BlockRenderer blocks={patchedBlocks} />
        </div>

        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <nav aria-label={`Halaman ${groupLabel}`} className="rounded-xl border border-border bg-card p-2">
            <p className="eyebrow px-3 pb-2 pt-3 text-muted-foreground">{groupLabel}</p>
            <ul>
              {nav.group.children.map((c) => {
                const Icon = c.icon;
                const active = c.slug === slug;
                return (
                  <li key={c.slug}>
                    <Link
                      to="/$section/$slug"
                      params={{ section, slug: c.slug }}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                        active ? "bg-primary font-semibold text-primary-foreground" : "text-foreground/80 hover:bg-muted",
                      )}
                    >
                      <Icon className={cn("h-4 w-4 shrink-0", active ? "text-gold" : "text-primary")} />
                      {c.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {!isPsb ? (
            <div className="rounded-xl bg-terracotta-deep p-6 text-accent-foreground">
              <p className="eyebrow text-accent-foreground">PSB {lists.psb.year}</p>
              <p className="mt-2 font-display text-xl font-semibold leading-snug">
                Pendaftaran Gelombang I dibuka{lists.psb.waves[0]?.period ? ` · ${lists.psb.waves[0].period}` : ""}
              </p>
              <Link
                to="/$section/$slug"
                params={{ section: "psb", slug: "formulir" }}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent-foreground px-5 py-2.5 text-sm font-semibold text-terracotta-deep hover:bg-gold"
              >
                Daftar sekarang
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card p-6">
              <p className="font-semibold text-foreground">Ada pertanyaan?</p>
              <p className="mt-1 text-sm text-muted-foreground">Panitia PSB melayani konsultasi {site.office}.</p>
              <a
                href={`https://wa.me/${site.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
              >
                <MessageCircle className="h-4 w-4" />
                {site.phone}
              </a>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
