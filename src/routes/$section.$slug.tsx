import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowRight, MessageCircle } from "lucide-react";

import { getPage } from "@/content/pages";
import { PSB_INFO, SITE } from "@/content/site";
import { BlockRenderer } from "@/components/site/blocks";
import { PageHero } from "@/components/site/PageHero";
import { findNavPage } from "@/components/site/nav-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/$section/$slug")({
  loader: ({ params }) => {
    const nav = findNavPage(params.section, params.slug);
    const page = getPage(params.section, params.slug);
    if (!nav || !page) throw notFound();
    return { section: params.section, slug: params.slug, title: page.title, summary: page.summary, groupLabel: nav.group.label };
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
  const { section, slug, groupLabel } = Route.useLoaderData();
  const page = getPage(section, slug)!;
  const nav = findNavPage(section, slug)!;
  const isPsb = section === "psb";

  return (
    <main>
      <PageHero title={page.title} summary={page.summary} image={page.image} trail={[groupLabel, page.title]} />
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:py-20">
        <div className="min-w-0">
          <BlockRenderer blocks={page.blocks} />
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
              <p className="eyebrow text-accent-foreground">PSB {PSB_INFO.year}</p>
              <p className="mt-2 font-display text-xl font-semibold leading-snug">Pendaftaran Gelombang I dibuka hingga 31 Januari 2027</p>
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
              <p className="mt-1 text-sm text-muted-foreground">Panitia PSB melayani konsultasi {SITE.office}.</p>
              <a
                href={`https://wa.me/${SITE.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
              >
                <MessageCircle className="h-4 w-4" />
                {SITE.phone}
              </a>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
