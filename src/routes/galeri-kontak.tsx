import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, MapPin, Phone } from "lucide-react";

import { IMAGES, type ImageKey } from "@/lib/images";
import { SITE } from "@/content/site";
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
  }),
  component: GaleriKontak,
});

const GALLERY: { image: ImageKey; caption: string }[] = [
  { image: "wisuda", caption: "Wisuda Akbar ke-37" },
  { image: "tahfizh", caption: "Halaqah tahfizh ba'da Subuh" },
  { image: "kitab", caption: "Pengajian kitab bandongan" },
  { image: "kelas", caption: "Kelas MA peminatan IPA" },
  { image: "ekskul", caption: "Perkemahan Pramuka" },
  { image: "halaqah", caption: "Halaqah santriwati" },
  { image: "asrama", caption: "Asrama putra blok C" },
  { image: "prestasi", caption: "Juara MTQ Provinsi" },
  { image: "hero", caption: "Masjid Jami' Asasunnajaah" },
];

function GaleriKontak() {
  const contacts = [
    { icon: MapPin, label: "Alamat", value: SITE.address },
    { icon: Phone, label: "Telepon / WhatsApp", value: SITE.phone, href: `https://wa.me/${SITE.whatsapp}` },
    { icon: Mail, label: "Email", value: SITE.email, href: `mailto:${SITE.email}` },
    { icon: Clock, label: "Jam layanan kantor", value: SITE.office },
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
          {GALLERY.map((g) => (
            <figure key={g.caption} className="group relative overflow-hidden rounded-xl">
              <img src={IMAGES[g.image]} alt={g.caption} loading="lazy" width={1280} height={864} className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
              <figcaption className="absolute inset-x-0 bottom-0 bg-hero-fade px-4 pb-3 pt-10 text-sm font-medium text-deep-foreground">{g.caption}</figcaption>
            </figure>
          ))}
        </div>
      </section>
      <section className="bg-muted">
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
            src={`https://www.google.com/maps?q=${encodeURIComponent(SITE.mapQuery)}&output=embed`}
            loading="lazy"
            className="h-80 w-full rounded-xl border border-border lg:h-full"
          />
        </div>
      </section>
    </main>
  );
}
