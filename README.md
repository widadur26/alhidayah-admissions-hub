# PP Asasunnajaah

Build a modern Pondok Pesantren website landing page using React, Tailwind CSS, and Lucide Icons.

Key Focus - Header Navigation:

Create a sticky/fixed top navigation bar with a dark translucent background (backdrop-blur). The header layout should feature:

- Brand Logo & Name ("PP Asasunnajaah") on the left.

- Navigation Menu on the right with smooth dropdown cards on hover/click.

- Dropdown styling: solid dark green/terracotta background color, rounded corners (rounded-2xl), subtle shadow, and clean padding. Teks inside dropdown should align left with icons next to each item.

Menu Structure & Submenus:

1. Beranda (Single link)

2. Tentang Kami (Dropdown: Profil Pesantren, Visi & Misi, Struktur Organisasi & Sanad, Fasilitas, Mitra & Alumni)

3. Pendidikan (Dropdown: Pendidikan Formal, Madrasah Diniyah, Tahfizh Al-Qur'an, Pengajian Kitab Kuning, Kurikulum)

4. Kesantrian (Dropdown: Kegiatan Harian Santri, Ekstrakurikuler, Organisasi Santri OSIP, Prestasi Santri, Tata Tertib)

5. Informasi (Dropdown: Berita Pesantren, Event & Agenda, Pengumuman, Kajian & Artikel Islam)

6. PSB Online : Alur & Syarat, Rincian Biaya, Formulir Online)

7. Galeri & Kontak (Single link)

Hero Section Below Header:

- Background image of an Islamic building/pesantren with a dark overlay.

- Headline text like "Mencetak Generasi Rabbani, Berakhlaq Mulia & Berwawasan Global".

- Call to Action (CTA) button: "Daftar PSB Online".

Make sure the navbar is fully responsive with a mobile hamburger menu drawer for smaller screens.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://pp-asasunnajaah.vercel.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/5475e9c8-ca2a-4361-b77d-a05467d8d04a).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Deploy to Railway

The `main` branch can be deployed automatically by connecting this GitHub
repository to a Railway service. In the Railway service settings, set the
build command to `NITRO_PRESET=node-server npm run build` and the start command
to `node .output/server/index.mjs`. Vercel continues to use its Vercel preset.

The service also needs production environment variables:

- `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, and
  `MYSQL_DATABASE`, linked to the Railway MySQL service values.
- `ADMIN_PASSWORD` and `ADMIN_SECRET`, set to unique, strong secrets (do not
  use the local development defaults).
- `BLOB_READ_WRITE_TOKEN`, linked to a Vercel Blob token, so uploaded images
  remain available after Railway redeploys.
- `COOKIE_SECURE=1` to mark authentication cookies as secure over HTTPS.

Select `main` as the deploy branch and add these variables in Railway's service
settings. Pushes to `main` then trigger deployments automatically. Do not
commit secret values.
