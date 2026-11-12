import { Link } from "@tanstack/react-router";
import { Clock, Mail, MapPin, Phone } from "lucide-react";

import { SITE } from "@/content/site";
import { NAV_GROUPS } from "./nav-data";
import { LogoMark } from "./LogoMark";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-deep text-deep-foreground">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.3fr_2fr]">
        <div>
          <div className="flex items-center gap-3">
            <LogoMark className="h-11 shrink-0" />
            <span className="leading-tight">
              <span className="eyebrow block text-[11px] text-gold">Pondok Pesantren Kesugihan · Cilacap</span>
              <span className="block font-display text-xl font-semibold">{SITE.short}</span>
            </span>
          </div>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-deep-muted">
            Lembaga pendidikan Islam berasrama di {SITE.location}, sejak {SITE.founded}. Memadukan kitab kuning,
            tahfizh Al-Qur'an, dan madrasah formal.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-deep-muted">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              {SITE.address}
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              <a href={`https://wa.me/${SITE.whatsapp}`} className="hover:text-deep-foreground">{SITE.phone}</a>
            </li>
            <li className="flex gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              <a href={`mailto:${SITE.email}`} className="hover:text-deep-foreground">{SITE.email}</a>
            </li>
            <li className="flex gap-3">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              {SITE.office}
            </li>
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 xl:grid-cols-5">
          {NAV_GROUPS.map((g) => (
            <div key={g.section}>
              <p className="eyebrow text-gold">{g.label}</p>
              <ul className="mt-4 space-y-2.5 text-sm">
                {g.children.map((c) => (
                  <li key={c.slug}>
                    <Link
                      to="/$section/$slug"
                      params={{ section: g.section, slug: c.slug }}
                      className="text-deep-muted transition-colors hover:text-deep-foreground"
                    >
                      {c.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-deep-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-deep-muted sm:flex-row sm:justify-between sm:px-6">
          <p>© {year} Yayasan Asasunnajaah Kesugihan. Hak cipta dilindungi.</p>
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-muted-foreground transition-colors hover:text-deep-foreground">
              Dashboard Admin
            </Link>
            <Link to="/galeri-kontak" className="hover:text-deep-foreground">Galeri & Kontak</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
