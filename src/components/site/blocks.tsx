import { Link } from "@tanstack/react-router";
import { CheckCircle2, Clock, MapPin, Quote } from "lucide-react";

import { cn } from "@/lib/utils";
import { IMAGES } from "@/lib/images";
import type { Block } from "@/content/blocks";
import { dateParts, formatDate, type AgendaItem, type Article, type Notice, type Testimonial } from "@/content/site";
import { PsbForm } from "./PsbForm";

function BlockHeading({ children, intro }: { children: React.ReactNode; intro?: string | undefined }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold text-foreground sm:text-[1.75rem]">{children}</h2>
      {intro && <p className="mt-2 max-w-2xl text-muted-foreground">{intro}</p>}
    </div>
  );
}

function initials(name: string) {
  const clean = name.replace(/^(KH\.|K\.|Dr\.|Drs\.|dr\.|Ust\.|Ustadzah|Nyai|Hj\.|H\.|Ibu)\s+/g, "").replace(/^(Hj\.|H\.)\s+/, "");
  return clean
    .split(/\s+/)
    .filter((w) => /^[A-Za-z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function ArticleCard({ article, showAuthor, to }: { article: Article; showAuthor?: boolean | undefined; to?: "berita" | "kajian" | undefined }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-lg">
      <div className="aspect-[16/10] overflow-hidden">
        <img
          src={article.imageUrl ?? (article.image ? IMAGES[article.image] : "")}
          alt=""
          loading="lazy"
          width={1280}
          height={864}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-semibold text-accent">{article.category}</span>
          <span aria-hidden>·</span>
          <time dateTime={article.date}>{formatDate(article.date)}</time>
          {article.readMinutes && (
            <>
              <span aria-hidden>·</span>
              <span>{article.readMinutes} menit baca</span>
            </>
          )}
        </div>
        <h3 className="mt-2 font-display text-lg font-semibold leading-snug text-foreground">
          {to ? (
            <Link to="/$section/$slug" params={{ section: "informasi", slug: to }} className="hover:text-primary">
              {article.title}
            </Link>
          ) : (
            article.title
          )}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{article.excerpt}</p>
        {showAuthor && article.author && (
          <p className="mt-auto pt-4 text-sm font-medium text-foreground">{article.author}</p>
        )}
      </div>
    </article>
  );
}

export function AgendaRow({ item, compact }: { item: AgendaItem; compact?: boolean }) {
  const { day, month } = dateParts(item.date);
  return (
    <li className={cn("flex gap-4", compact ? "py-3" : "py-5")}>
      <div className="grid h-14 w-14 shrink-0 place-content-center rounded-lg bg-primary text-center text-primary-foreground">
        <span className="font-display text-xl font-semibold leading-none">{day}</span>
        <span className="eyebrow mt-1 text-[10px] tracking-[0.12em] text-gold">{month}</span>
      </div>
      <div className="min-w-0">
        <p className="font-semibold leading-snug text-foreground">{item.title}</p>
        <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            {item.place}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {item.time}
          </span>
        </p>
      </div>
    </li>
  );
}

export function NoticeRow({ item }: { item: Notice }) {
  return (
    <li className="py-5">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full bg-secondary px-2.5 py-0.5 font-semibold text-secondary-foreground">{item.tag}</span>
        <time dateTime={item.date} className="text-muted-foreground">
          {formatDate(item.date)}
        </time>
      </div>
      <p className="mt-2 font-semibold text-foreground">{item.title}</p>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
    </li>
  );
}

export function QuoteCard({ item, tone = "light" }: { item: Testimonial; tone?: "light" | "dark" }) {
  const dark = tone === "dark";
  return (
    <figure
      className={cn(
        "flex h-full flex-col rounded-xl p-6",
        dark ? "bg-deep-border/40 ring-1 ring-deep-border" : "border border-border bg-card",
      )}
    >
      <Quote className={cn("h-7 w-7", dark ? "text-gold" : "text-accent")} />
      <blockquote className={cn("mt-4 flex-1 leading-relaxed", dark ? "text-deep-foreground" : "text-foreground")}>
        {item.quote}
      </blockquote>
      <figcaption className="mt-6 flex items-center gap-3">
        <span
          className={cn(
            "grid h-10 w-10 shrink-0 place-items-center rounded-full font-display text-sm font-semibold",
            dark ? "bg-gold text-gold-foreground" : "bg-primary text-primary-foreground",
          )}
        >
          {initials(item.name)}
        </span>
        <span className="min-w-0">
          <span className={cn("block text-sm font-semibold", dark ? "text-deep-foreground" : "text-foreground")}>
            {item.name}
          </span>
          <span className={cn("block text-xs", dark ? "text-deep-muted" : "text-muted-foreground")}>{item.role}</span>
        </span>
      </figcaption>
    </figure>
  );
}

function RenderBlock({ block }: { block: Block }) {
  switch (block.type) {
    case "prose":
      return (
        <section className={cn(block.image && "grid gap-8 lg:grid-cols-2 lg:items-start")}>
          <div>
            {block.heading && <BlockHeading>{block.heading}</BlockHeading>}
            <div className="space-y-4 text-[17px] leading-relaxed text-foreground/85">
              {block.paragraphs.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
          </div>
          {block.image && (
            <figure>
              <img
                src={IMAGES[block.image]}
                alt={block.caption ?? ""}
                loading="lazy"
                width={1280}
                height={864}
                className="aspect-[4/3] w-full rounded-xl object-cover"
              />
              {block.caption && <figcaption className="mt-2 text-sm text-muted-foreground">{block.caption}</figcaption>}
            </figure>
          )}
        </section>
      );
    case "facts":
      return (
        <dl className="grid grid-cols-2 border-y border-border md:grid-flow-col md:auto-cols-fr md:grid-cols-none">
          {block.items.map((f, i) => (
            <div
              key={f.label}
              className={cn(
                "flex flex-col-reverse px-4 py-6 md:px-6",
                i % 2 === 1 && "border-l border-border",
                i > 0 && "md:border-l",
                i > 1 && "border-t border-border md:border-t-0",
              )}
            >
              <dt className="mt-1 text-sm text-muted-foreground">{f.label}</dt>
              <dd className="font-display text-3xl font-semibold text-primary sm:text-4xl">{f.value}</dd>
            </div>
          ))}
        </dl>
      );
    case "features":
      return (
        <section>
          {block.heading && <BlockHeading intro={block.intro}>{block.heading}</BlockHeading>}
          <div className={cn("grid gap-4 sm:grid-cols-2", block.columns === 3 && "xl:grid-cols-3")}>
            {block.items.map(({ icon: Icon, title, text, meta }) => (
              <div key={title} className="flex flex-col rounded-xl border border-border bg-card p-5">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-secondary text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-semibold text-foreground">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{text}</p>
                {meta && <p className="mt-auto pt-4 text-xs font-semibold text-accent">{meta}</p>}
              </div>
            ))}
          </div>
        </section>
      );
    case "list":
      return (
        <section>
          <BlockHeading intro={block.intro}>{block.heading}</BlockHeading>
          <ol className="divide-y divide-border rounded-xl border border-border bg-card">
            {block.items.map((item, i) => (
              <li key={item} className="flex gap-4 px-5 py-4">
                {block.style === "numbered" ? (
                  <span className="w-7 shrink-0 font-display text-lg font-semibold tabular-nums text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                ) : (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                )}
                <span className="leading-relaxed text-foreground/90">{item}</span>
              </li>
            ))}
          </ol>
        </section>
      );
    case "schedule":
      return (
        <section>
          <BlockHeading intro={block.intro}>{block.heading}</BlockHeading>
          <ol className="relative border-l-2 border-border pl-0">
            {block.items.map((item) => (
              <li key={item.time + item.title} className="relative grid grid-cols-[88px_minmax(0,1fr)] gap-4 py-3 pl-6">
                <span className="absolute -left-[7px] top-[18px] h-3 w-3 rounded-full border-2 border-background bg-accent" />
                <span className="pt-0.5 text-sm font-semibold tabular-nums text-accent">{item.time}</span>
                <span>
                  <span className="block font-semibold text-foreground">{item.title}</span>
                  {item.text && <span className="block text-sm text-muted-foreground">{item.text}</span>}
                </span>
              </li>
            ))}
          </ol>
        </section>
      );
    case "steps":
      return (
        <section>
          <BlockHeading>{block.heading}</BlockHeading>
          <ol className="grid gap-4 md:grid-cols-2">
            {block.items.map((s, i) => (
              <li key={s.title} className="flex gap-4 rounded-xl border border-border bg-card p-5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent font-display font-semibold text-accent-foreground">
                  {i + 1}
                </span>
                <span>
                  <span className="block font-semibold text-foreground">{s.title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{s.text}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      );
    case "table":
      return (
        <section>
          <BlockHeading intro={block.intro}>{block.heading}</BlockHeading>
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="bg-muted text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  {block.columns.map((c) => (
                    <th key={c} scope="col" className="px-5 py-3 font-semibold">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {block.rows.map((row) => (
                  <tr key={row.join("|")}>
                    {row.map((cell, i) => (
                      <td key={i} className={cn("px-5 py-3.5 align-top", i === 0 ? "font-medium text-foreground" : "text-foreground/80")}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              {block.totalRow && (
                <tfoot>
                  <tr className="border-t-2 border-primary/30 bg-secondary">
                    {block.totalRow.map((cell, i) => (
                      <td key={i} className="px-5 py-3.5 font-semibold text-secondary-foreground">
                        {cell}
                      </td>
                    ))}
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
          {block.note && <p className="mt-3 text-sm text-muted-foreground">{block.note}</p>}
        </section>
      );
    case "people":
      return (
        <section>
          <BlockHeading intro={block.intro}>{block.heading}</BlockHeading>
          <ul className="grid gap-3 sm:grid-cols-2">
            {block.items.map((p) => (
              <li key={p.name} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary font-display font-semibold text-primary-foreground">
                  {initials(p.name)}
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold text-foreground">{p.name}</span>
                  <span className="block text-sm text-muted-foreground">{p.role}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      );
    case "chain":
      return (
        <section>
          <BlockHeading intro={block.intro}>{block.heading}</BlockHeading>
          <ol className="rounded-xl border border-border bg-card p-6">
            {block.items.map((item, i) => {
              const last = i === block.items.length - 1;
              return (
                <li key={item.name} className="relative flex gap-4 pb-6 last:pb-0">
                  {!last && <span className="absolute left-[11px] top-7 h-[calc(100%-20px)] w-px bg-border" />}
                  <span
                    className={cn(
                      "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-semibold",
                      i === 0 || last ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground",
                    )}
                  >
                    {i + 1}
                  </span>
                  <span>
                    <span className="block font-semibold text-foreground">{item.name}</span>
                    <span className="block text-sm text-muted-foreground">{item.note}</span>
                  </span>
                </li>
              );
            })}
          </ol>
        </section>
      );
    case "articles":
      return (
        <section>
          {block.heading && <BlockHeading>{block.heading}</BlockHeading>}
          <div className="grid gap-5 sm:grid-cols-2">
            {block.items.map((a) => (
              <ArticleCard key={a.title} article={a} showAuthor={block.showAuthor} />
            ))}
          </div>
        </section>
      );
    case "agenda":
      return (
        <section>
          {block.heading && <BlockHeading>{block.heading}</BlockHeading>}
          <ul className="divide-y divide-border rounded-xl border border-border bg-card px-5">
            {block.items.map((a) => (
              <AgendaRow key={a.title} item={a} />
            ))}
          </ul>
        </section>
      );
    case "notices":
      return (
        <section>
          {block.heading && <BlockHeading>{block.heading}</BlockHeading>}
          <ul className="divide-y divide-border rounded-xl border border-border bg-card px-5">
            {block.items.map((n) => (
              <NoticeRow key={n.title} item={n} />
            ))}
          </ul>
        </section>
      );
    case "quotes":
      return (
        <section>
          <BlockHeading>{block.heading}</BlockHeading>
          <div className="grid gap-4 md:grid-cols-2">
            {block.items.map((q) => (
              <QuoteCard key={q.name} item={q} />
            ))}
          </div>
        </section>
      );
    case "partners":
      return (
        <section>
          <BlockHeading intro={block.intro}>{block.heading}</BlockHeading>
          <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3">
            {block.items.map((p) => (
              <li key={p} className="grid min-h-20 place-items-center bg-card px-4 py-5 text-center text-sm font-semibold text-foreground/80">
                {p}
              </li>
            ))}
          </ul>
        </section>
      );
    case "callout":
      return (
        <aside className="rounded-xl bg-deep p-6 sm:p-8">
          <p className="eyebrow text-gold">{block.title}</p>
          <p className="mt-3 font-display text-xl leading-relaxed text-deep-foreground sm:text-2xl">{block.text}</p>
        </aside>
      );
    case "psb-form":
      return <PsbForm />;
  }
}

export function BlockRenderer({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-14">
      {blocks.map((b, i) => (
        <RenderBlock key={i} block={b} />
      ))}
    </div>
  );
}

