import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { ChevronDown, Facebook, Instagram, LogIn, Menu, MessageCircle, Phone, Youtube } from "lucide-react";

import { cn } from "@/lib/utils";
import { SITE } from "@/content/site";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { navItemsFor, type NavGroupItem } from "./nav-data";
import { LogoMark } from "./LogoMark";

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="group flex shrink-0 items-center gap-2.5 sm:gap-3">
      <LogoMark
        className={cn(
          "shrink-0 transition-transform duration-300 group-hover:scale-105",
          compact ? "h-11" : "h-12 sm:h-14",
        )}
      />
      <span className="leading-[1.15]">
        <span
          className={cn(
            "block whitespace-nowrap font-display font-extrabold tracking-wide text-nav-foreground",
            compact ? "text-lg" : "text-lg sm:text-xl 2xl:text-2xl",
          )}
        >
          Asasunnajaah
        </span>
        <span className="block whitespace-nowrap text-[8px] font-semibold uppercase tracking-[0.18em] text-gold sm:text-[9px] sm:tracking-[0.2em] 2xl:text-[11px] 2xl:tracking-[0.24em]">
          Kesugihan · Cilacap
        </span>
      </span>
    </Link>
  );
}

function DropdownPanel({
  item,
  open,
  align,
  onNavigate,
}: {
  item: NavGroupItem;
  open: boolean;
  align: "center" | "right";
  onNavigate: () => void;
}) {
  const { pathname } = useLocation();
  const isCta = item.tone === "cta";
  return (
    <div
      className={cn(
        "absolute top-full z-50 pt-3 transition-all duration-200 ease-out",
        align === "center" ? "left-1/2 -translate-x-1/2" : "right-0",
        open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0 pointer-events-none",
      )}
    >
      <div
        role="menu"
        aria-label={item.label}
        className={cn(
          "w-80 rounded-2xl p-2 shadow-dropdown ring-1",
          isCta ? "bg-terracotta-deep ring-terracotta/40" : "bg-dropdown ring-dropdown-hover",
        )}
      >
        {item.children.map((child) => {
          const Icon = child.icon;
          const active = pathname === `/${item.section}/${child.slug}`;
          return (
            <Link
              key={child.label}
              to="/$section/$slug"
              params={{ section: item.section, slug: child.slug }}
              role="menuitem"
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex items-start gap-3 rounded-xl px-3 py-2.5 text-left text-dropdown-foreground transition-colors",
                isCta ? "hover:bg-terracotta" : "hover:bg-dropdown-hover",
                active && (isCta ? "bg-terracotta" : "bg-dropdown-hover"),
              )}
            >
              <span
                className={cn(
                  "mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg text-gold transition-colors",
                  isCta ? "bg-terracotta" : "bg-dropdown-icon group-hover:bg-dropdown",
                )}
              >
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{child.label}</span>
                <span className="block text-xs text-dropdown-muted">{child.description}</span>
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function DesktopNav() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const { pathname } = useLocation();
  const items = navItemsFor(pathname);

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpenIndex(null), 140);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenIndex(null);
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenIndex(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
      cancelClose();
    };
  }, []);

  return (
    <nav ref={navRef} aria-label="Menu utama" className="hidden min-w-0 lg:flex lg:justify-center">
      <ul className="flex items-center gap-0.5 2xl:gap-1">
        {items.map((item, i) => {
          const open = openIndex === i;
          const isCta = item.kind === "group" && item.tone === "cta";
          if (item.kind === "link") {
            return (
              <li key={item.label}>
                <Link
                  to={item.to}
                  activeOptions={{ exact: true }}
                  className="whitespace-nowrap px-2 py-2.5 text-sm font-semibold text-nav-foreground/90 transition-colors hover:text-gold data-[status=active]:text-gold 2xl:px-3.5 2xl:text-[15px]"
                >
                  {item.label}
                </Link>
              </li>
            );
          }
          const sectionActive = pathname.startsWith(`/${item.section}/`);
          return (
            <li
              key={item.label}
              className="relative"
              onMouseEnter={() => {
                cancelClose();
                setOpenIndex(i);
              }}
              onMouseLeave={scheduleClose}
            >
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={() => setOpenIndex(open ? null : i)}
                className={cn(
                  "flex items-center gap-1 whitespace-nowrap px-2 py-2.5 text-sm font-semibold transition-colors 2xl:px-3.5 2xl:text-[15px]",
                  isCta
                    ? "text-accent transition-colors hover:text-terracotta-hover"
                    : open || sectionActive
                      ? "text-gold"
                      : "text-nav-foreground/90 hover:text-gold",
                )}
              >
                {item.label}
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-200 2xl:h-4 2xl:w-4",
                    open && "rotate-180",
                  )}
                />
              </button>
              <DropdownPanel
                item={item}
                open={open}
                align={i >= items.length - 2 ? "right" : "center"}
                onNavigate={() => setOpenIndex(null)}
              />
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function MobileNav() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const { pathname } = useLocation();
  const items = navItemsFor(pathname);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <div className="shrink-0 lg:hidden">
        <SheetTrigger
          aria-label="Buka menu"
          className="grid h-11 w-11 place-items-center rounded-xl text-nav-foreground ring-1 ring-nav-foreground/20 transition-colors hover:bg-nav-foreground/10"
        >
          <Menu className="h-6 w-6" />
        </SheetTrigger>
      </div>
      <SheetContent
        side="right"
        className="flex w-[88%] flex-col gap-0 overflow-y-auto border-dropdown-hover bg-dropdown p-0 text-dropdown-foreground sm:max-w-sm [&>button]:text-dropdown-foreground"
      >
        <div className="border-b border-dropdown-hover px-5 py-5">
          <SheetTitle className="sr-only">Menu navigasi</SheetTitle>
          <BrandMark compact />
        </div>
        <nav aria-label="Menu seluler" className="flex-1 px-3 py-4">
          <ul className="space-y-1">
            {items.map((item) => {
              const isCta = item.kind === "group" && item.tone === "cta";
              if (item.kind === "link") {
                return (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      activeOptions={{ exact: true }}
                      onClick={() => setOpen(false)}
                      className="block rounded-xl px-3 py-3 text-[15px] font-semibold transition-colors hover:bg-dropdown-hover data-[status=active]:text-gold"
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              }
              const isOpen = expanded === item.label;
              return (
                <li key={item.label}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setExpanded(isOpen ? null : item.label)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-[15px] font-semibold transition-colors hover:bg-dropdown-hover",
                      isCta && "text-gold",
                      isOpen && "bg-dropdown-hover",
                    )}
                  >
                    {item.label}
                    <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isOpen && "rotate-180")} />
                  </button>
                  <div
                    className={cn(
                      "grid transition-all duration-300 ease-out",
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                    )}
                  >
                    <ul className={cn("overflow-hidden", isCta && "mb-1 rounded-xl bg-terracotta-deep")}>
                      {item.children.map((child) => {
                        const Icon = child.icon;
                        return (
                          <li key={child.label}>
                            <Link
                              to="/$section/$slug"
                              params={{ section: item.section, slug: child.slug }}
                              onClick={() => setOpen(false)}
                              className={cn(
                                "flex items-center gap-3 py-2.5 pl-4 pr-3 text-sm transition-colors",
                                isCta
                                  ? "mx-2 rounded-lg text-dropdown-foreground hover:bg-terracotta"
                                  : "rounded-lg text-dropdown-muted hover:bg-dropdown-hover hover:text-dropdown-foreground data-[status=active]:text-gold",
                              )}
                            >
                              <Icon className="h-4 w-4 shrink-0 text-gold" />
                              {child.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="border-t border-dropdown-hover px-5 py-5">
          <Link
            to="/masuk"
            onClick={() => setOpen(false)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-4 py-2.5 text-sm font-semibold text-nav transition-colors hover:opacity-90"
          >
            <LogIn className="h-4 w-4" />
            Masuk · Wali, Alumni &amp; Admin
          </Link>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-gold">Hubungi kami</p>
          <div className="mt-3 flex items-center gap-3">
            <a
              href={`https://wa.me/${SITE.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-terracotta-hover"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp PSB
            </a>
            <a
              href={`tel:+${SITE.whatsapp}`}
              className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-dropdown-foreground ring-1 ring-dropdown-hover transition-colors hover:bg-dropdown-hover"
            >
              <Phone className="h-4 w-4 text-gold" />
              Telepon
            </a>
          </div>
          <p className="mt-3 text-xs text-dropdown-muted">
            {SITE.location} · {SITE.office}
          </p>
          <div className="mt-4 flex items-center gap-4">
            {(
              [
                { label: "Instagram", href: SITE.socials.find((s) => s.label === "Instagram")?.href ?? "#", Icon: Instagram },
                { label: "Facebook", href: SITE.socials.find((s) => s.label === "Facebook")?.href ?? "#", Icon: Facebook },
                { label: "YouTube", href: SITE.socials.find((s) => s.label === "YouTube")?.href ?? "#", Icon: Youtube },
              ] as const
            ).map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={`Kunjungi ${label} kami`}
                title={label}
                className="text-dropdown-foreground transition-colors hover:text-gold"
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
            <a
              href={`https://wa.me/${SITE.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              aria-label="Hubungi kami via WhatsApp"
              title="WhatsApp"
              className="text-dropdown-foreground transition-colors hover:text-gold"
            >
              <MessageCircle className="h-5 w-5" />
            </a>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      // Sembunyikan header saat menggulir ke bawah, tampilkan lagi saat naik
      // atau saat kembali dekat dengan puncak halaman.
      if (y > lastY && y > 160) setHidden(true);
      else if (y < lastY || y <= 120) setHidden(false);
      lastY = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 border-b backdrop-blur-xl transition-all duration-300",
        scrolled ? "border-nav-foreground/10 bg-nav-scrolled" : "border-transparent bg-nav",
        hidden ? "-translate-y-full" : "translate-y-0",
      )}
    >
      <div className="mx-auto grid h-20 max-w-[1560px] grid-cols-[auto_1fr_auto] items-center gap-4 px-4 sm:px-6 xl:px-8">
        <BrandMark />
        <DesktopNav />
        <div className="flex shrink-0 items-center gap-1 justify-self-end">
          <div className="hidden items-center gap-1 md:flex">
            {(
              [
                { label: "Instagram", href: SITE.socials.find((s) => s.label === "Instagram")?.href ?? "#", Icon: Instagram },
                { label: "Facebook", href: SITE.socials.find((s) => s.label === "Facebook")?.href ?? "#", Icon: Facebook },
                { label: "YouTube", href: SITE.socials.find((s) => s.label === "YouTube")?.href ?? "#", Icon: Youtube },
              ] as const
            ).map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={`Kunjungi ${label} kami`}
                title={label}
                className="grid h-9 w-9 place-items-center text-nav-foreground transition-colors hover:text-gold"
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
            <a
              href={`https://wa.me/${SITE.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              aria-label="Hubungi kami via WhatsApp"
              title="WhatsApp"
              className="grid h-9 w-9 place-items-center text-nav-foreground transition-colors hover:text-gold"
            >
              <MessageCircle className="h-5 w-5" />
            </a>
          </div>
          <Link
            to="/masuk"
            className="hidden h-9 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-nav-foreground ring-1 ring-nav-foreground/20 transition-colors hover:text-gold md:inline-flex"
          >
            <LogIn className="h-4 w-4" />
            Masuk
          </Link>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
