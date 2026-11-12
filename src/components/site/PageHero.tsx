import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { IMAGES, type ImageKey } from "@/lib/images";

export function PageHero({
  title,
  summary,
  image,
  trail,
}: {
  title: string;
  summary: string;
  image: ImageKey;
  trail: string[];
}) {
  return (
    <section className="relative isolate overflow-hidden bg-deep">
      <img src={IMAGES[image]} alt="" width={1280} height={864} className="absolute inset-0 -z-20 h-full w-full object-cover" />
      <div className="absolute inset-0 -z-10 bg-page-overlay" />
      <div className="mx-auto max-w-7xl px-4 pb-14 pt-32 sm:px-6 sm:pb-16 sm:pt-36">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-deep-muted">
            <li>
              <Link to="/" className="hover:text-deep-foreground">Beranda</Link>
            </li>
            {trail.map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <ChevronRight className="h-3.5 w-3.5" />
                <span>{t}</span>
              </li>
            ))}
          </ol>
        </nav>
        <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-tight text-white text-glow sm:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-deep-muted text-glow">{summary}</p>
      </div>
    </section>
  );
}
