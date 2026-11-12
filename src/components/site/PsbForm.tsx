import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, MessageCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { PSB_INFO, SITE } from "@/content/site";

const phone = /^(\+62|62|0)8[0-9]{8,12}$/;

export const psbSchema = z.object({
  nama: z.string().trim().min(3, "Tulis nama lengkap sesuai akta").max(100),
  jenisKelamin: z.enum(["Putra", "Putri"], { errorMap: () => ({ message: "Pilih salah satu" }) }),
  tempatLahir: z.string().trim().min(2, "Wajib diisi").max(60),
  tanggalLahir: z.string().min(1, "Wajib diisi"),
  program: z.enum(["MTs (kelas VII)", "MA (kelas X)", "Takhassus Tahfizh"], {
    errorMap: () => ({ message: "Pilih program" }),
  }),
  asalSekolah: z.string().trim().min(3, "Wajib diisi").max(100),
  namaWali: z.string().trim().min(3, "Wajib diisi").max(100),
  hpWali: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s-]/g, ""))
    .refine((v) => phone.test(v), "Nomor HP tidak valid, contoh 081234567890"),
  alamat: z.string().trim().min(10, "Tulis alamat lengkap").max(300),
});

export type PsbValues = z.infer<typeof psbSchema>;

export function buildWhatsappMessage(v: PsbValues) {
  return [
    `Assalamu'alaikum, saya ingin mendaftar PSB ${PSB_INFO.year}.`,
    "",
    `Nama: ${v.nama}`,
    `Jenis kelamin: ${v.jenisKelamin}`,
    `TTL: ${v.tempatLahir}, ${v.tanggalLahir}`,
    `Program: ${v.program}`,
    `Asal sekolah: ${v.asalSekolah}`,
    `Wali: ${v.namaWali} (${v.hpWali})`,
    `Alamat: ${v.alamat}`,
  ].join("\n");
}

const inputCls =
  "w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/25";

function Field({
  label,
  error,
  children,
  className,
  htmlFor,
}: {
  label: string;
  error?: string | undefined;
  children: React.ReactNode;
  className?: string | undefined;
  htmlFor?: string | undefined;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}

export function PsbForm() {
  const [submitted, setSubmitted] = useState<PsbValues | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PsbValues>({ resolver: zodResolver(psbSchema) });

  if (submitted) {
    const href = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(buildWhatsappMessage(submitted))}`;
    return (
      <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
        <CheckCircle2 className="h-10 w-10 text-primary" />
        <h2 className="mt-4 text-2xl font-semibold text-foreground">Data {submitted.nama} sudah lengkap</h2>
        <p className="mt-2 max-w-xl text-muted-foreground">
          Langkah terakhir: kirim data ini ke panitia PSB melalui WhatsApp. Panitia akan membalas dengan nomor
          pendaftaran dan informasi pembayaran.
        </p>
        <dl className="mt-6 grid gap-x-8 gap-y-3 rounded-lg bg-muted p-5 text-sm sm:grid-cols-2">
          {[
            ["Program", submitted.program],
            ["Jenis kelamin", submitted.jenisKelamin],
            ["Asal sekolah", submitted.asalSekolah],
            ["Wali", `${submitted.namaWali} · ${submitted.hpWali}`],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="font-medium text-foreground">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground hover:bg-terracotta-hover"
          >
            <MessageCircle className="h-4 w-4" />
            Kirim ke WhatsApp panitia
          </a>
          <button
            type="button"
            onClick={() => {
              setSubmitted(null);
              reset();
            }}
            className="rounded-full px-5 py-3 text-sm font-semibold text-foreground ring-1 ring-border hover:bg-muted"
          >
            Daftarkan santri lain
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit((v) => setSubmitted(v))}
      className="rounded-xl border border-border bg-card p-6 sm:p-8"
    >
      <fieldset>
        <legend className="eyebrow text-accent">Data calon santri</legend>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field label="Nama lengkap" htmlFor="nama" error={errors.nama?.message} className="sm:col-span-2">
            <input id="nama" autoComplete="name" className={inputCls} placeholder="Sesuai akta kelahiran" {...register("nama")} />
          </Field>
          <Field label="Jenis kelamin" error={errors.jenisKelamin?.message}>
            <div className="grid grid-cols-2 gap-2">
              {(["Putra", "Putri"] as const).map((v) => (
                <label
                  key={v}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm has-[:checked]:border-primary has-[:checked]:bg-secondary"
                >
                  <input type="radio" value={v} className="accent-primary" {...register("jenisKelamin")} />
                  {v}
                </label>
              ))}
            </div>
          </Field>
          <Field label="Program yang dipilih" htmlFor="program" error={errors.program?.message}>
            <select id="program" defaultValue="" className={inputCls} {...register("program")}>
              <option value="" disabled>
                Pilih program
              </option>
              <option>MTs (kelas VII)</option>
              <option>MA (kelas X)</option>
              <option>Takhassus Tahfizh</option>
            </select>
          </Field>
          <Field label="Tempat lahir" htmlFor="tempatLahir" error={errors.tempatLahir?.message}>
            <input id="tempatLahir" className={inputCls} {...register("tempatLahir")} />
          </Field>
          <Field label="Tanggal lahir" htmlFor="tanggalLahir" error={errors.tanggalLahir?.message}>
            <input id="tanggalLahir" type="date" className={inputCls} {...register("tanggalLahir")} />
          </Field>
          <Field label="Asal sekolah" htmlFor="asalSekolah" error={errors.asalSekolah?.message} className="sm:col-span-2">
            <input id="asalSekolah" className={inputCls} placeholder="Contoh: SDN Kesugihan 1" {...register("asalSekolah")} />
          </Field>
        </div>
      </fieldset>

      <fieldset className="mt-8 border-t border-border pt-8">
        <legend className="eyebrow text-accent">Data orang tua / wali</legend>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field label="Nama wali" htmlFor="namaWali" error={errors.namaWali?.message}>
            <input id="namaWali" className={inputCls} {...register("namaWali")} />
          </Field>
          <Field label="No. HP / WhatsApp wali" htmlFor="hpWali" error={errors.hpWali?.message}>
            <input id="hpWali" type="tel" inputMode="tel" autoComplete="tel" className={inputCls} placeholder="081234567890" {...register("hpWali")} />
          </Field>
          <Field label="Alamat lengkap" htmlFor="alamat" error={errors.alamat?.message} className="sm:col-span-2">
            <textarea id="alamat" rows={3} className={cn(inputCls, "resize-y")} placeholder="Jalan, RT/RW, desa, kecamatan, kabupaten" {...register("alamat")} />
          </Field>
        </div>
      </fieldset>

      <div className="mt-8 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">Biaya pendaftaran Rp 250.000 dibayarkan setelah konfirmasi panitia.</p>
        <button
          type="submit"
          disabled={isSubmitting}
          className="shrink-0 rounded-full bg-accent px-7 py-3 text-sm font-semibold text-accent-foreground shadow-cta transition-colors hover:bg-terracotta-hover disabled:opacity-60"
        >
          Lanjutkan pendaftaran
        </button>
      </div>
    </form>
  );
}
