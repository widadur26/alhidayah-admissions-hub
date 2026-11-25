import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { IMAGES, type ImageKey } from "@/lib/images";
import { getSiteContent } from "@/lib/content-store";
import { useSiteSettings } from "@/lib/site-settings";
import { PageHero } from "@/components/site/PageHero";

export const Route = createFileRoute("/galeri-kontak")({
  head: () => ({
    meta: [
      { title: "Galeri & Kontak — Pondok Pesantren Asasunnajaah" },
      { name: "description", content: "Dokumentasi kegiatan santri dan informasi kontak Pondok Pesantren Asasunnajaah, Kesugihan, Cilacap." },
      { property: "og:title", content: "Galeri & Kontak — Pondok Pesantren Asasunnajaah" },
      { property: "og:description", content: "Dokumentasi kegiatan santri dan informasi kontak pesantren." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: "https://pp-asasunnajaah.vercel.app/galeri-kontak" },
    ],
  }),
  component: GaleriKontak,
});

const GALLERY: { image: ImageKey; caption: string }[] = [
  { image: "tahfizh", caption: "Tadarrus Al-Qur'an" },
  { image: "kitab", caption: "Ngaji kitab kuning" },
  { image: "kelas", caption: "Sekolah formal" },
  { image: "ekskul", caption: "Ekstrakurikuler santri" },
  { image: "asrama", caption: "Asrama santri" },
  { image: "halaqah", caption: "Kegiatan santri putri" },
  { image: "wisuda", caption: "Haflah Akhirussanah" },
  { image: "prestasi", caption: "Kegiatan santri" },
  { image: "hero", caption: "Kompleks Pondok Pesantren Asaasunnajaah" },
];

function GaleriKontak() {
  const site = useSiteSettings();
  const { data: saved } = useQuery({
    queryKey: ["site-content"],
    queryFn: () => getSiteContent(),
    staleTime: 30_000,
  });

  const gallery = GALLERY.map((d, i) => ({
    caption: saved?.siteGallery?.[i]?.caption?.trim() || d.caption,
    src: saved?.siteGallery?.[i]?.imageUrl || IMAGES[d.image],
  }));

  const contacts = [
    { icon: MapPin, label: "Alamat", value: site.address },
    { icon: Phone, label: "Telepon / WhatsApp", value: site.phone, href: `https://wa.me/${site.whatsapp}` },
    { icon: Mail, label: "Email", value: site.email, href: `mailto:${site.email}` },
    { icon: Clock, label: "Jam layanan kantor", value: site.office },
  ];
  return (
    <main>
      <PageHero
        title="Galeri & Kontak"
        summary="Potret keseharian santri dan cara menghubungi kantor pesantren."
        image="hero"
        trail={["Galeri & Kontak"]}
      />
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
        <h2 className="text-3xl font-semibold text-foreground">Galeri kegiatan</h2>
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3">
          {gallery.map((g, i) => (
            <figure key={i} className="group relative overflow-hidden rounded-xl">
              <img src={g.src} alt={g.caption} loading="lazy" width={1280} height={864} className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
              <figcaption className="absolute inset-x-0 bottom-0 bg-hero-fade px-4 pb-3 pt-10 text-sm font-medium text-deep-foreground">{g.caption}</figcaption>
            </figure>
          ))}
        </div>
      </section>
      <section className="bg-muted">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
          <h2 className="text-3xl font-semibold text-foreground">Narahubung</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Hubungi contact person sesuai jenjang santri. Semoga bermanfaat.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {(
              [
                { key: "putra", title: "Contact person pondok putra", people: site.contactPersons.putra },
                { key: "putri", title: "Contact person pondok putri", people: site.contactPersons.putri },
              ] as const
            ).map((group) => (
              <div key={group.key} className="rounded-xl border border-border bg-card p-6">
                <p className="eyebrow text-muted-foreground">{group.title}</p>
                <ul className="mt-4 space-y-4">
                  {group.people.map((p) => (
                    <li key={p.name} className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">{p.name}</p>
                        <p className="text-sm text-muted-foreground">{p.phone}</p>
                      </div>
                      <a
                        href={`https://wa.me/${p.whatsapp}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                      >
                        <MessageCircle className="h-4 w-4" />
                        WhatsApp
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-background">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-20">
          <div>
            <h2 className="text-3xl font-semibold text-foreground">Hubungi kami</h2>
            <ul className="mt-8 space-y-5">
              {contacts.map(({ icon: Icon, label, value, href }) => (
                <li key={label} className="flex gap-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary text-gold"><Icon className="h-5 w-5" /></span>
                  <span>
                    <span className="block text-sm text-muted-foreground">{label}</span>
                    {href ? <a href={href} className="font-semibold text-foreground hover:text-primary">{value}</a> : <span className="font-semibold text-foreground">{value}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <iframe
            title="Peta lokasi Pondok Pesantren Asasunnajaah"
            src={`https://www.google.com/maps?q=${encodeURIComponent(site.mapQuery)}&output=embed`}
            loading="lazy"
            className="h-80 w-full rounded-xl border border-border lg:h-full"
          />
        </div>
      </section>
    </main>
  );
}
