import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { upload as uploadToBlob } from "@vercel/blob/client";
import {
  BadgeCheck,
  Check,
  ClipboardList,
  Eye,
  EyeOff,
  FileText,
  Home,
  ImageUp,
  Images,
  Layers,
  Loader2,
  Lock,
  LogIn,
  LogOut,
  Newspaper,
  Plus,
  ReceiptText,
  Save,
  Settings,
  Trash2,
  Upload,
  Users,
  Wallet,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { getAuth, loginDashboard, logoutDashboard } from "@/lib/auth";
import {
  addAlumni,
  addSantri,
  adminListAlumni,
  adminListSantri,
  createBill,
  createMember,
  decideBill,
  decideNeed,
  deleteAlumni,
  deleteBill,
  deleteMember,
  deleteNeed,
  deleteSantri,
  listAllBills,
  listAllNeeds,
  listMembers,
  type MemberItem,
} from "@/lib/members";
import {
  getSiteContent,
  saveSiteContent,
  uploadImage,
  GALLERY_PAGE_SLOTS,
  type NewsContent,
  type SiteContent,
} from "@/lib/content-store";
import {
  deletePageOverride,
  getPagesContent,
  getSiteLists,
  getSiteSettings,
  savePageOverride,
  saveSiteLists,
  saveSiteSettings,
  type SiteLists,
  type SiteSettings,
} from "@/lib/site-settings";
import { blocksToEditable, iconNames } from "@/lib/block-icons";
import { getPage } from "@/content/pages";
import { NAV_ITEMS } from "@/components/site/nav-data";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard Admin — Pondok Pesantren Asasunnajaah" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardPage,
});

type Tab =
  | "pengaturan"
  | "beranda"
  | "kabar"
  | "galeri"
  | "halaman"
  | "konten"
  | "logo"
  | "akun"
  | "bayar"
  | "kebutuhan";

const MENU: { key: Tab; label: string; desc: string; icon: typeof Home }[] = [
  { key: "pengaturan", label: "Pengaturan Situs", desc: "Nama, kontak, sosmed & teks footer", icon: Settings },
  { key: "beranda", label: "Gambar Beranda", desc: "Ganti 3 slide & teks hero", icon: Home },
  { key: "kabar", label: "Kabar Terbaru", desc: "Tulis berita + foto baru", icon: Newspaper },
  { key: "galeri", label: "Galeri", desc: "Foto beranda & halaman galeri", icon: Images },
  { key: "halaman", label: "Halaman Situs", desc: "Judul, ringkasan & isi halaman", icon: FileText },
  { key: "konten", label: "Konten Beranda & Daftar", desc: "Statistik, program, agenda, testimoni & PSB", icon: Layers },
  { key: "logo", label: "Logo Pondok", desc: "Unggah logo header & footer", icon: ImageUp },
  { key: "akun", label: "Wali & Alumni", desc: "Akun, daftar santri & alumni", icon: Users },
  { key: "bayar", label: "Pembayaran", desc: "Tagihan & verifikasi bukti", icon: Wallet },
  { key: "kebutuhan", label: "Kebutuhan", desc: "Aspirasi wali, alumni & santri", icon: ClipboardList },
];

const rupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

const ROLE_LABEL: Record<MemberItem["role"], string> = {
  admin: "Admin",
  wali: "Wali santri",
  alumni: "Alumni",
  santri: "Santri",
};

function uid() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Gagal membaca berkas."));
    reader.readAsDataURL(file);
  });
}

function normalize(c: Partial<SiteContent> | undefined): SiteContent {
  return {
    logo: c?.logo ?? null,
    hero: [0, 1, 2].map((i) => c?.hero?.[i] ?? { eyebrow: "", title: "", text: "", imageUrl: null }),
    gallery: [0, 1, 2, 3, 4, 5].map((i) => c?.gallery?.[i] ?? { caption: "", imageUrl: null }),
    siteGallery: [...Array(GALLERY_PAGE_SLOTS).keys()].map((i) => c?.siteGallery?.[i] ?? { caption: "", imageUrl: null }),
    news: c?.news ?? [],
  };
}

/** Bidang unggah gambar: pratinjau + tombol pilih berkas + tombol hapus. */
function ImageField({
  label,
  hint,
  value,
  aspect = "aspect-[16/10]",
  onChange,
}: {
  label: string;
  hint?: string;
  value: string | null;
  aspect?: string;
  onChange: (url: string | null) => void;
}) {
  const [error, setError] = useState("");
  const upload = useMutation({
    mutationFn: async (file: File) => {
      if (import.meta.env.PROD) {
        const name = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-") || "gambar";
        const blob = await uploadToBlob(`dashboard/${Date.now()}-${name}`, file, {
          access: "public",
          handleUploadUrl: "/api/blob-upload",
          clientPayload: "dashboard",
          contentType: file.type,
        });
        return { url: blob.url };
      }

      const dataUrl = await fileToDataUrl(file);
      return uploadImage({ data: { name: file.name, dataUrl } });
    },
  });

  const onPick = async (file: File | undefined) => {
    setError("");
    if (!file) return;
    if (file.size > 10_000_000) {
      setError("Ukuran maksimal 10 MB per gambar.");
      return;
    }
    try {
      const res = await upload.mutateAsync(file);
      onChange(res.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unggah gagal.");
    }
  };

  return (
    <div>
      <p className="text-sm font-semibold text-foreground">{label}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      <div className="mt-2 flex items-start gap-3">
        <div className={cn("relative w-44 shrink-0 overflow-hidden rounded-lg border border-border bg-muted", aspect)}>
          {value ? (
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="grid h-full place-items-center px-3 text-center text-xs text-muted-foreground">
              Belum ada — gambar bawaan dipakai
            </span>
          )}
          {upload.isPending && (
            <span className="absolute inset-0 grid place-items-center bg-background/70">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </span>
          )}
        </div>
        <div className="min-w-0 space-y-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground transition-colors hover:bg-terracotta-hover">
            <Upload className="h-3.5 w-3.5" />
            Unggah gambar di sini
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/avif"
              className="hidden"
              onChange={(e) => {
                void onPick(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </label>
          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-muted-foreground ring-1 ring-border transition-colors hover:bg-muted"
            >
              <X className="h-3.5 w-3.5" />
              Pakai bawaan
            </button>
          )}
          {error && <p className="text-xs font-medium text-destructive">{error}</p>}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  textarea?: boolean;
}) {
  const base =
    "mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-accent";
  return (
    <label className="block">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      {textarea ? (
        <textarea value={value} rows={3} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={base} />
      ) : (
        <input type="text" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={base} />
      )}
    </label>
  );
}

function LoginForm() {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const login = useMutation({
    mutationFn: (p: string) => loginDashboard({ data: { password: p } }),
  });
  const error = login.error instanceof Error ? login.error.message : "";

  return (
    <div className="grid min-h-screen place-items-center bg-muted px-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!login.isPending) login.mutate(password);
        }}
        className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-sm"
      >
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary">
          <Lock className="h-5 w-5" />
        </div>
        <h1 className="mt-3 font-display text-xl font-extrabold text-foreground">Dashboard Admin</h1>
        <p className="mt-1 text-sm text-muted-foreground">Masukkan password untuk mengelola konten situs.</p>
        <label className="mt-5 block">
          <span className="text-sm font-semibold text-foreground">Password</span>
          <span className="relative mt-1 block">
            <input
              type={show ? "text" : "password"}
              value={password}
              autoFocus
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 pr-20 text-sm text-foreground outline-none transition-colors focus:border-accent"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted"
            >
              {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {show ? "Sembunyi" : "Lihat"}
            </button>
          </span>
        </label>
        {error && <p className="mt-2 text-xs font-medium text-destructive">{error}</p>}
        <button
          type="submit"
          disabled={login.isPending || !password}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-cta transition-colors hover:bg-terracotta-hover disabled:opacity-60"
        >
          {login.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
          Masuk
        </button>
      </form>
    </div>
  );
}

/* ---------- Panel kelola: akun, santri, alumni, tagihan ---------- */

const errOf = (e: unknown) => (e instanceof Error ? e.message : "");

function MembersAdmin() {
  const queryClient = useQueryClient();
  const { data: members } = useQuery({ queryKey: ["members"], queryFn: listMembers });
  const [form, setForm] = useState({ name: "", username: "", password: "", role: "wali" as MemberItem["role"] });

  const create = useMutation({
    mutationFn: () => createMember({ data: form }),
    onSuccess: async () => {
      setForm({ name: "", username: "", password: "", role: "wali" });
      await queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });
  const del = useMutation({
    mutationFn: (id: number) => deleteMember({ data: { id } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["members"] }),
  });

  return (
    <Panel title="Akun wali santri & alumni" desc="Buat akun agar bisa masuk melihat tagihan, daftar santri, dan daftar alumni.">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Nama lengkap" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Contoh: Bpk. Sutrisno" />
        <Field label="Username" value={form.username} onChange={(v) => setForm({ ...form, username: v })} placeholder="huruf kecil, tanpa spasi" />
        <label className="block">
          <span className="text-sm font-semibold text-foreground">Password</span>
          <input
            type="text"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Minimal 4 karakter"
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-accent"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-foreground">Peran</span>
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value as MemberItem["role"] })}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-accent"
          >
            <option value="wali">Wali santri</option>
            <option value="alumni">Alumni</option>
            <option value="santri">Santri</option>
            <option value="admin">Admin</option>
          </select>
        </label>
      </div>
      {errOf(create.error) && <p className="text-xs font-medium text-destructive">{errOf(create.error)}</p>}
      <button
        type="button"
        disabled={create.isPending}
        onClick={() => create.mutate()}
        className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
      >
        <Plus className="h-4 w-4" />
        Buat akun
      </button>
      <ul className="space-y-2">
        {members?.map((m) => (
          <li key={m.id} className="flex items-center justify-between gap-3 rounded-lg border border-border px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {m.name} <span className="font-normal text-muted-foreground">· {m.username}</span>
              </p>
              <p className="text-xs text-muted-foreground">{ROLE_LABEL[m.role]}</p>
            </div>
            <button
              type="button"
              onClick={() => del.mutate(m.id)}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-destructive ring-1 ring-destructive/30 transition-colors hover:bg-destructive/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Hapus
            </button>
          </li>
        ))}
      </ul>
      {del.error && errOf(del.error) && <p className="text-xs font-medium text-destructive">{errOf(del.error)}</p>}
    </Panel>
  );
}

function SantriAdmin() {
  const queryClient = useQueryClient();
  const { data: items } = useQuery({ queryKey: ["admin-santri"], queryFn: adminListSantri });
  const [form, setForm] = useState({ name: "", kelas: "", angkatan: "", waliName: "", username: "", password: "" });
  const add = useMutation({
    mutationFn: () => addSantri({ data: form }),
    onSuccess: async () => {
      setForm({ name: "", kelas: "", angkatan: "", waliName: "", username: "", password: "" });
      await queryClient.invalidateQueries({ queryKey: ["admin-santri"] });
      await queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });
  const del = useMutation({
    mutationFn: (id: number) => deleteSantri({ data: { id } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-santri"] }),
  });

  return (
    <Panel title="Daftar santri" desc="Tampil di area terproteksi. Isi username & password agar santri bisa login melihat tagihan dan datanya.">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Nama santri" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Nama lengkap" />
        <Field label="Kelas" value={form.kelas} onChange={(v) => setForm({ ...form, kelas: v })} placeholder="Contoh: MTs 1A" />
        <Field label="Angkatan / tahun masuk" value={form.angkatan} onChange={(v) => setForm({ ...form, angkatan: v })} placeholder="2026" />
        <Field label="Nama wali (opsional)" value={form.waliName} onChange={(v) => setForm({ ...form, waliName: v })} placeholder="Bpk. Hamid" />
        <Field label="Username akun (opsional)" value={form.username} onChange={(v) => setForm({ ...form, username: v })} placeholder="huruf kecil, mis. santri02" />
        <Field label="Password akun (opsional)" value={form.password} onChange={(v) => setForm({ ...form, password: v })} placeholder="minimal 4 karakter" />
      </div>
      {errOf(add.error) && <p className="text-xs font-medium text-destructive">{errOf(add.error)}</p>}
      <button
        type="button"
        disabled={add.isPending}
        onClick={() => add.mutate()}
        className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
      >
        <Plus className="h-4 w-4" />
        Tambah santri
      </button>
      <ul className="space-y-2">
        {items?.map((s) => (
          <li key={s.id} className="flex items-center justify-between gap-3 rounded-lg border border-border px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{s.name}</p>
              <p className="text-xs text-muted-foreground">
                {s.kelas || "—"} · Angkatan {s.angkatan || "—"}
                {s.waliName ? ` · Wali: ${s.waliName}` : ""}
                {` · Akun: ${s.username ?? "belum ada"}`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => del.mutate(s.id)}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-destructive ring-1 ring-destructive/30 transition-colors hover:bg-destructive/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Hapus
            </button>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function AlumniAdmin() {
  const queryClient = useQueryClient();
  const { data: items } = useQuery({ queryKey: ["admin-alumni"], queryFn: adminListAlumni });
  const [form, setForm] = useState({ name: "", angkatan: "", nowStatus: "" });
  const add = useMutation({
    mutationFn: () => addAlumni({ data: form }),
    onSuccess: async () => {
      setForm({ name: "", angkatan: "", nowStatus: "" });
      await queryClient.invalidateQueries({ queryKey: ["admin-alumni"] });
    },
  });
  const del = useMutation({
    mutationFn: (id: number) => deleteAlumni({ data: { id } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-alumni"] }),
  });

  return (
    <Panel title="Daftar alumni" desc="Data ini tampil di area wali santri & alumni (terproteksi).">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Nama alumni" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Nama lengkap" />
        <Field label="Angkatan" value={form.angkatan} onChange={(v) => setForm({ ...form, angkatan: v })} placeholder="2020" />
        <Field label="Status kini" value={form.nowStatus} onChange={(v) => setForm({ ...form, nowStatus: v })} placeholder="Kuliah / bekerja" />
      </div>
      {errOf(add.error) && <p className="text-xs font-medium text-destructive">{errOf(add.error)}</p>}
      <button
        type="button"
        disabled={add.isPending}
        onClick={() => add.mutate()}
        className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
      >
        <Plus className="h-4 w-4" />
        Tambah alumni
      </button>
      <ul className="space-y-2">
        {items?.map((a) => (
          <li key={a.id} className="flex items-center justify-between gap-3 rounded-lg border border-border px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{a.name}</p>
              <p className="text-xs text-muted-foreground">
                Angkatan {a.angkatan || "—"}
                {a.nowStatus ? ` · ${a.nowStatus}` : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={() => del.mutate(a.id)}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-destructive ring-1 ring-destructive/30 transition-colors hover:bg-destructive/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Hapus
            </button>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

const BILL_STATUS: Record<string, { label: string; cls: string }> = {
  belum: { label: "Belum dibayar", cls: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
  menunggu: { label: "Menunggu verifikasi", cls: "bg-blue-500/15 text-blue-700 dark:text-blue-400" },
  lunas: { label: "Lunas", cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" },
};

function BillsAdmin() {
  const queryClient = useQueryClient();
  const { data: bills } = useQuery({ queryKey: ["all-bills"], queryFn: listAllBills });
  const { data: members } = useQuery({ queryKey: ["members"], queryFn: listMembers });
  const [form, setForm] = useState({ userId: 0, title: "", amount: "", dueDate: "" });

  const create = useMutation({
    mutationFn: () =>
      createBill({ data: { userId: form.userId, title: form.title, amount: Number(form.amount || 0), dueDate: form.dueDate } }),
    onSuccess: async () => {
      setForm({ userId: 0, title: "", amount: "", dueDate: "" });
      await queryClient.invalidateQueries({ queryKey: ["all-bills"] });
    },
  });
  const decide = useMutation({
    mutationFn: (v: { id: number; decision: "lunas" | "belum" }) => decideBill({ data: v }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["all-bills"] }),
  });
  const del = useMutation({
    mutationFn: (id: number) => deleteBill({ data: { id } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["all-bills"] }),
  });

  return (
    <Panel
      title="Tagihan & verifikasi pembayaran"
      desc="Buat tagihan, lalu setujui atau tolak bukti transfer yang dikirim wali/alumni. Tagihan 'menunggu verifikasi' tampil paling atas."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold text-foreground">Untuk akun</span>
          <select
            value={form.userId}
            onChange={(e) => setForm({ ...form, userId: Number(e.target.value) })}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-accent"
          >
            <option value={0}>— pilih akun santri —</option>
            {members
              ?.filter((m) => m.role === "santri")
              .map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.username})
                </option>
              ))}
          </select>
        </label>
        <Field label="Judul tagihan" value={form.title} onChange={(v) => setForm({ ...form, title: v })} placeholder="Contoh: SPP Bulan Desember 2026" />
        <label className="block">
          <span className="text-sm font-semibold text-foreground">Jumlah (Rp)</span>
          <input
            type="number"
            min={0}
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            placeholder="350000"
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-accent"
          />
        </label>
        <Field label="Jatuh tempo" value={form.dueDate} onChange={(v) => setForm({ ...form, dueDate: v })} placeholder="2026-12-25" />
      </div>
      {errOf(create.error) && <p className="text-xs font-medium text-destructive">{errOf(create.error)}</p>}
      <button
        type="button"
        disabled={create.isPending}
        onClick={() => create.mutate()}
        className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
      >
        <Plus className="h-4 w-4" />
        Buat tagihan
      </button>

      <ul className="space-y-3">
        {bills?.map((b) => {
          const st = BILL_STATUS[b.status] ?? BILL_STATUS.belum!;
          return (
            <li key={b.id} className="rounded-xl border border-border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {b.title} <span className="font-normal text-muted-foreground">· {b.memberName}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {rupiah(b.amount)} · Jatuh tempo {b.dueDate || "—"}
                    {b.paidAt ? ` · Lunas ${b.paidAt.slice(0, 10)}` : ""}
                  </p>
                </div>
                <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", st.cls)}>{st.label}</span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {b.proofUrl && (
                  <a
                    href={b.proofUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-primary underline"
                  >
                    Lihat bukti transfer
                  </a>
                )}
                {b.status === "menunggu" && (
                  <>
                    <button
                      type="button"
                      onClick={() => decide.mutate({ id: b.id, decision: "lunas" })}
                      className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
                    >
                      <BadgeCheck className="h-3.5 w-3.5" />
                      Setujui (lunas)
                    </button>
                    <button
                      type="button"
                      onClick={() => decide.mutate({ id: b.id, decision: "belum" })}
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-muted-foreground ring-1 ring-border transition-colors hover:bg-muted"
                    >
                      <X className="h-3.5 w-3.5" />
                      Tolak bukti
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => del.mutate(b.id)}
                  className="ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-destructive ring-1 ring-destructive/30 transition-colors hover:bg-destructive/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Hapus
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

const NEED_STATUS: Record<string, { label: string; cls: string }> = {
  baru: { label: "Baru", cls: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
  diproses: { label: "Diproses", cls: "bg-blue-500/15 text-blue-700 dark:text-blue-400" },
  selesai: { label: "Selesai", cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" },
};

function NeedsAdmin() {
  const queryClient = useQueryClient();
  const { data: needs } = useQuery({ queryKey: ["all-needs"], queryFn: listAllNeeds });
  const set = useMutation({
    mutationFn: (v: { id: number; status: "baru" | "diproses" | "selesai" }) => decideNeed({ data: v }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["all-needs"] }),
  });
  const del = useMutation({
    mutationFn: (id: number) => deleteNeed({ data: { id } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["all-needs"] }),
  });

  const count = (s: string) => needs?.filter((n) => n.status === s).length ?? 0;

  return (
    <Panel
      title="Kebutuhan dari wali, alumni & santri"
      desc="Keluhan, saran, atau permintaan yang dikirim dari Area Wali & Alumni. Yang masih 'Baru' tampil paling atas."
    >
      <div className="flex flex-wrap gap-2 text-xs font-semibold">
        <span className="rounded-full bg-amber-500/15 px-3 py-1 text-amber-700 dark:text-amber-400">
          {count("baru")} baru
        </span>
        <span className="rounded-full bg-blue-500/15 px-3 py-1 text-blue-700 dark:text-blue-400">
          {count("diproses")} diproses
        </span>
        <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-emerald-700 dark:text-emerald-400">
          {count("selesai")} selesai
        </span>
      </div>
      <ul className="space-y-3">
        {needs?.map((n) => {
          const st = NEED_STATUS[n.status] ?? NEED_STATUS.baru!;
          return (
            <li key={n.id} className="rounded-xl border border-border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{n.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {n.memberName} ({ROLE_LABEL[n.memberRole] ?? n.memberRole})
                    {n.createdAt ? ` · ${n.createdAt.slice(0, 10)}` : ""}
                  </p>
                  {n.detail && <p className="mt-2 text-sm text-muted-foreground">{n.detail}</p>}
                </div>
                <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", st.cls)}>{st.label}</span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {n.status !== "diproses" && n.status !== "selesai" && (
                  <button
                    type="button"
                    onClick={() => set.mutate({ id: n.id, status: "diproses" })}
                    className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
                  >
                    <ClipboardList className="h-3.5 w-3.5" />
                    Tandai diproses
                  </button>
                )}
                {n.status !== "selesai" && (
                  <button
                    type="button"
                    onClick={() => set.mutate({ id: n.id, status: "selesai" })}
                    className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Tandai selesai
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => del.mutate(n.id)}
                  className="ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-destructive ring-1 ring-destructive/30 transition-colors hover:bg-destructive/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Hapus
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      {needs?.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">Belum ada kebutuhan yang dikirim.</p>
      )}
    </Panel>
  );
}

/* ---------- Panel kelola: pengaturan situs & isi halaman ---------- */

function SettingsAdmin() {
  const queryClient = useQueryClient();
  const { data: saved } = useQuery({ queryKey: ["site-settings"], queryFn: () => getSiteSettings() });
  const [form, setForm] = useState<SiteSettings | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (saved && !form) setForm(saved);
  }, [saved, form]);

  const save = useMutation({
    mutationFn: () => saveSiteSettings({ data: form! }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      setStatus("Tersimpan — buka ulang halaman situs untuk melihat hasilnya.");
      window.setTimeout(() => setStatus(""), 4000);
    },
    onError: (e) => setStatus(e instanceof Error ? e.message : "Gagal menyimpan."),
  });

  if (!form) {
    return (
      <Panel title="Pengaturan Situs" desc="Nama pondok, kontak, tautan sosmed, dan teks header/footer.">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </Panel>
    );
  }

  const set = (patch: Partial<SiteSettings>) => setForm({ ...form, ...patch });
  const setSocial = (i: number, patch: Partial<{ label: string; href: string }>) =>
    set({ socials: form.socials.map((s, j) => (j === i ? { ...s, ...patch } : s)) });

  return (
    <>
      <Panel
        title="Identitas & tampilan teks"
        desc="Nama pondok dan teks di samping logo pada header & footer situs."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nama lengkap lembaga" value={form.name} onChange={(v) => set({ name: v })} placeholder="Pondok Pesantren Asasunnajaah" />
          <Field label="Nama pendek" value={form.short} onChange={(v) => set({ short: v })} placeholder="Asasunnajaah" />
          <Field label="Teks brand header" value={form.brandTitle} onChange={(v) => set({ brandTitle: v })} placeholder="Asasunnajaah" />
          <Field label="Teks kecil di bawah brand" value={form.brandSub} onChange={(v) => set({ brandSub: v })} placeholder="Kesugihan · Cilacap" />
          <Field label="Lokasi singkat" value={form.location} onChange={(v) => set({ location: v })} placeholder="Kesugihan, Cilacap" />
          <Field label="Tahun berdiri" value={form.founded} onChange={(v) => set({ founded: v })} placeholder="1987" />
        </div>
      </Panel>

      <Panel title="Kontak & lokasi" desc="Dipakai pada header, footer, halaman Galeri & Kontak, formulir PSB, dan tombol WhatsApp.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Alamat lengkap" textarea value={form.address} onChange={(v) => set({ address: v })} />
          <Field label="Nomor telepon (yang ditampilkan)" value={form.phone} onChange={(v) => set({ phone: v })} placeholder="+62 812-3456-7890" />
          <Field
            label="Nomor WhatsApp (format 62…)"
            value={form.whatsapp}
            onChange={(v) => set({ whatsapp: v.replace(/[^0-9]/g, "") })}
            placeholder="6281234567890"
          />
          <Field label="Email" value={form.email} onChange={(v) => set({ email: v })} placeholder="info@pondok.sch.id" />
          <Field label="Jam layanan kantor" value={form.office} onChange={(v) => set({ office: v })} placeholder="Senin–Sabtu, 08.00–15.00 WIB" />
          <Field label="Kata kunci peta Google Maps" value={form.mapQuery} onChange={(v) => set({ mapQuery: v })} placeholder="Kesugihan, Cilacap" />
        </div>
      </Panel>

      <Panel title="Media sosial" desc="Tautan tampil di header (desktop), menu seluler, dan halaman kontak.">
        <div className="space-y-3">
          {form.socials.map((s, i) => (
            <div key={i} className="grid gap-3 sm:grid-cols-[180px_minmax(0,1fr)]">
              <Field label={`Label ${i + 1}`} value={s.label} onChange={(v) => setSocial(i, { label: v })} placeholder="Facebook / Instagram / TikTok / YouTube" />
              <Field label="Tautan" value={s.href} onChange={(v) => setSocial(i, { href: v })} placeholder="https://…" />
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => set({ socials: [...form.socials, { label: "", href: "" }] })}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-3.5 w-3.5" />
            Tambah tautan
          </button>
          {form.socials.length > 1 && (
            <button
              type="button"
              onClick={() => set({ socials: form.socials.slice(0, -1) })}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-destructive ring-1 ring-destructive/30 transition-colors hover:bg-destructive/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Hapus tautan terakhir
            </button>
          )}
        </div>
      </Panel>

      <Panel title="Teks footer" desc="Bagian bawah setiap halaman situs.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Teks kecil di atas nama" value={form.footerEyebrow} onChange={(v) => set({ footerEyebrow: v })} />
          <Field label="Teks hak cipta" value={form.footerCopyright} onChange={(v) => set({ footerCopyright: v })} />
        </div>
        <Field label="Paragraf deskripsi" textarea value={form.footerDescription} onChange={(v) => set({ footerDescription: v })} />
      </Panel>

      <div className="flex items-center gap-4">
        <button
          type="button"
          disabled={save.isPending}
          onClick={() => save.mutate()}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-cta transition-colors hover:bg-terracotta-hover disabled:opacity-60"
        >
          {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Simpan pengaturan situs
        </button>
        {status && (
          <span className={cn("text-sm font-semibold", save.isError ? "text-destructive" : "text-primary")}>{status}</span>
        )}
      </div>
    </>
  );
}

/** Daftar semua halaman nav yang bisa diedit (sumber: nav-data.ts, sesuai aturan proyek). */
const PAGE_OPTIONS = NAV_ITEMS.flatMap((item) =>
  item.kind === "group"
    ? item.children.map((c) => ({ section: item.section, groupLabel: item.label, slug: c.slug, label: c.label }))
    : [],
);

function PageEditor({
  section,
  slug,
  groupLabel,
  label,
  savedTitle,
  savedSummary,
  savedBlocks,
}: {
  section: string;
  slug: string;
  groupLabel: string;
  label: string;
  savedTitle: string | null;
  savedSummary: string | null;
  savedBlocks: unknown[] | null;
}) {
  const queryClient = useQueryClient();
  const page = getPage(section, slug)!;
  const [title, setTitle] = useState(savedTitle?.trim() || page.title);
  const [summary, setSummary] = useState(savedSummary?.trim() || page.summary);
  const [blocksJson, setBlocksJson] = useState(() =>
    JSON.stringify(blocksToEditable(savedBlocks ?? page.blocks), null, 2),
  );
  const [status, setStatus] = useState("");

  const key = `${section}/${slug}`;
  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ["pages-content"] });
  };

  const save = useMutation({
    mutationFn: () => savePageOverride({ data: { section, slug, title, summary, blocksJson } }),
    onSuccess: async () => {
      await invalidate();
      setStatus("Tersimpan — halaman sudah tampil dengan isi baru.");
      window.setTimeout(() => setStatus(""), 4000);
    },
    onError: (e) => setStatus(e instanceof Error ? e.message : "Gagal menyimpan."),
  });
  const reset = useMutation({
    mutationFn: () => deletePageOverride({ data: { section, slug } }),
    onSuccess: async () => {
      await invalidate();
      setTitle(page.title);
      setSummary(page.summary);
      setBlocksJson(JSON.stringify(blocksToEditable(page.blocks), null, 2));
      setStatus("Dikembalikan ke konten bawaan.");
      window.setTimeout(() => setStatus(""), 4000);
    },
    onError: (e) => setStatus(e instanceof Error ? e.message : "Gagal mengembalikan."),
  });

  const isOverridden = savedTitle != null || savedSummary != null || savedBlocks != null;

  return (
    <Panel
      title={`${groupLabel} · ${label}`}
      desc={isOverridden ? "Halaman ini sudah dioverride — kosongkan bidang agar memakai bawaan." : "Belum dioverride; bidang berisi konten bawaan."}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Judul halaman" value={title} onChange={setTitle} />
        <div className="sm:col-span-2">
          <Field label="Ringkasan (untuk Google & Hero halaman)" textarea value={summary} onChange={setSummary} />
        </div>
        <div className="sm:col-span-2">
          <label className="block">
            <span className="text-sm font-semibold text-foreground">Blok konten (format JSON)</span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              Struktur mengikuti tipe blok: prose, facts, features, list, schedule, steps, table, people, chain,
              articles, agenda, notices, quotes, partners, callout. Ikon ditulis sebagai teks, mis.{" "}
              <code>"book-open"</code>, <code>"trophy"</code>.
            </span>
            <textarea
              value={blocksJson}
              rows={16}
              spellCheck={false}
              onChange={(e) => setBlocksJson(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs leading-relaxed text-foreground outline-none transition-colors focus:border-accent"
            />
          </label>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={save.isPending || reset.isPending}
          onClick={() => save.mutate()}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-cta transition-colors hover:bg-terracotta-hover disabled:opacity-60"
        >
          {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Simpan halaman ini
        </button>
        {isOverridden && (
          <button
            type="button"
            disabled={save.isPending || reset.isPending}
            onClick={() => reset.mutate()}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-3 text-sm font-semibold text-muted-foreground ring-1 ring-border transition-colors hover:bg-muted disabled:opacity-60"
          >
            {reset.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
            Kembalikan ke bawaan
          </button>
        )}
        {status && (
          <span className={cn("text-sm font-semibold", save.isError || reset.isError ? "text-destructive" : "text-primary")}>
            {status}
          </span>
        )}
      </div>
    </Panel>
  );
}

function PagesAdmin() {
  const { data: pagesContent, isPending } = useQuery({ queryKey: ["pages-content"], queryFn: () => getPagesContent() });
  const [selected, setSelected] = useState(PAGE_OPTIONS[0]!);

  if (isPending || !pagesContent) {
    return (
      <Panel title="Halaman Situs" desc="Pilih halaman, lalu ubah judul, ringkasan, dan isi bloknya.">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </Panel>
    );
  }

  const override = pagesContent[`${selected.section}/${selected.slug}`];

  return (
    <>
      <Panel title="Pilih halaman" desc={`Semua halaman menu navigasi (${PAGE_OPTIONS.length} halaman) bisa diedit di sini.`}>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {PAGE_OPTIONS.map((p) => {
            const key = `${p.section}/${p.slug}`;
            const ov = pagesContent[key];
            const edited = ov && (ov.title.trim() || ov.summary.trim() || ov.blocks);
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelected(p)}
                className={cn(
                  "flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                  selected.section === p.section && selected.slug === p.slug
                    ? "border-accent bg-secondary font-semibold text-primary"
                    : "border-border bg-background hover:bg-muted",
                )}
              >
                <span className="min-w-0 truncate">
                  <span className="block">{p.label}</span>
                  <span className="block text-xs font-normal text-muted-foreground">{p.groupLabel}</span>
                </span>
                {edited && (
                  <span className="shrink-0 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                    diedit
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </Panel>
      <PageEditor
        key={`${selected.section}/${selected.slug}`}
        section={selected.section}
        slug={selected.slug}
        groupLabel={selected.groupLabel}
        label={selected.label}
        savedTitle={override?.title ?? null}
        savedSummary={override?.summary ?? null}
        savedBlocks={override?.blocks ?? null}
      />
    </>
  );
}

/* ---------- Panel kelola: statistik, program, agenda, pengumuman, testimoni, mitra & PSB ---------- */

function IconSelect({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-accent"
      >
        {iconNames().map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
    </label>
  );
}

function RowRemove({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-destructive ring-1 ring-destructive/30 transition-colors hover:bg-destructive/10"
    >
      <Trash2 className="h-3.5 w-3.5" />
      Hapus
    </button>
  );
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
    >
      <Plus className="h-4 w-4" />
      {label}
    </button>
  );
}

function ListsAdmin() {
  const queryClient = useQueryClient();
  const { data: saved } = useQuery({ queryKey: ["site-lists"], queryFn: () => getSiteLists() });
  const [form, setForm] = useState<SiteLists | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (saved && !form) setForm(saved);
  }, [saved, form]);

  const save = useMutation({
    mutationFn: () => saveSiteLists({ data: form! }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["site-lists"] });
      setStatus("Tersimpan — buka ulang halaman situs untuk melihat hasilnya.");
      window.setTimeout(() => setStatus(""), 4000);
    },
    onError: (e) => setStatus(e instanceof Error ? e.message : "Gagal menyimpan."),
  });

  if (!form) {
    return (
      <Panel title="Konten Beranda & Daftar" desc="Statistik, program, agenda, pengumuman, testimoni, mitra & info PSB.">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </Panel>
    );
  }

  const set = (patch: Partial<SiteLists>) => setForm({ ...form, ...patch });

  return (
    <>
      <Panel title="Statistik beranda" desc="Tiga angka ringkas pada bagian bawah slide hero.">
        <div className="space-y-4">
          {form.stats.map((s, i) => (
            <div key={i} className="grid gap-3 rounded-xl border border-border p-4 sm:grid-cols-[180px_minmax(0,1fr)_minmax(0,1fr)]">
              <IconSelect label={`Ikon ${i + 1}`} value={s.icon} onChange={(v) => set({ stats: form.stats.map((x, j) => (j === i ? { ...x, icon: v } : x)) })} />
              <Field label="Angka" value={s.value} onChange={(v) => set({ stats: form.stats.map((x, j) => (j === i ? { ...x, value: v } : x)) })} placeholder="1.200+" />
              <Field label="Keterangan" value={s.label} onChange={(v) => set({ stats: form.stats.map((x, j) => (j === i ? { ...x, label: v } : x)) })} placeholder="Santri mukim" />
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Program pendidikan beranda" desc="Empat kartu program; tautannya tetap (Formal, Formal, Diniyah, Tahfizh), teksnya bebas.">
        <div className="space-y-4">
          {form.programs.map((p, i) => (
            <div key={i} className="space-y-3 rounded-xl border border-border p-4">
              <div className="grid gap-3 sm:grid-cols-[180px_minmax(0,1fr)_minmax(0,160px)]">
                <IconSelect label={`Ikon ${i + 1}`} value={p.icon} onChange={(v) => set({ programs: form.programs.map((x, j) => (j === i ? { ...x, icon: v } : x)) })} />
                <Field label="Judul" value={p.title} onChange={(v) => set({ programs: form.programs.map((x, j) => (j === i ? { ...x, title: v } : x)) })} placeholder="MTs (kelas VII–IX)" />
                <Field label="Catatan kecil" value={p.meta} onChange={(v) => set({ programs: form.programs.map((x, j) => (j === i ? { ...x, meta: v } : x)) })} placeholder="Akreditasi A" />
              </div>
              <Field label="Deskripsi" textarea value={p.text} onChange={(v) => set({ programs: form.programs.map((x, j) => (j === i ? { ...x, text: v } : x)) })} />
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Info PSB" desc="Tahun ajaran, kuota, dan jadwal gelombang — tampil di beranda, formulir PSB, dan halaman PSB.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tahun ajaran" value={form.psb.year} onChange={(v) => set({ psb: { ...form.psb, year: v } })} placeholder="2027/2028" />
          <Field label="Kuota" value={form.psb.quota} onChange={(v) => set({ psb: { ...form.psb, quota: v } })} placeholder="160 putra · 160 putri" />
        </div>
        <div className="space-y-4">
          {form.psb.waves.map((w, i) => (
            <div key={i} className="grid gap-3 rounded-xl border border-border p-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_minmax(0,1fr)]">
              <Field label={`Nama gelombang ${i + 1}`} value={w.name} onChange={(v) => set({ psb: { ...form.psb, waves: form.psb.waves.map((x, j) => (j === i ? { ...x, name: v } : x)) } })} placeholder="Gelombang I" />
              <Field label="Masa pendaftaran" value={w.period} onChange={(v) => set({ psb: { ...form.psb, waves: form.psb.waves.map((x, j) => (j === i ? { ...x, period: v } : x)) } })} placeholder="1 Nov 2026 – 31 Jan 2027" />
              <Field label="Tes seleksi" value={w.test} onChange={(v) => set({ psb: { ...form.psb, waves: form.psb.waves.map((x, j) => (j === i ? { ...x, test: v } : x)) } })} placeholder="8 Februari 2027" />
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Agenda" desc="Kalender kegiatan — 4 teratas tampil di beranda, seluruhnya di halaman Event & Agenda.">
        <div className="space-y-4">
          {form.agenda.map((a, i) => (
            <div key={i} className="space-y-3 rounded-xl border border-border p-4">
              <div className="grid gap-3 sm:grid-cols-[140px_minmax(0,1fr)_minmax(0,1fr)_140px]">
                <Field label="Tanggal" value={a.date} onChange={(v) => set({ agenda: form.agenda.map((x, j) => (j === i ? { ...x, date: v } : x)) })} placeholder="2026-11-21" />
                <Field label="Kegiatan" value={a.title} onChange={(v) => set({ agenda: form.agenda.map((x, j) => (j === i ? { ...x, title: v } : x)) })} />
                <Field label="Tempat" value={a.place} onChange={(v) => set({ agenda: form.agenda.map((x, j) => (j === i ? { ...x, place: v } : x)) })} />
                <Field label="Waktu" value={a.time} onChange={(v) => set({ agenda: form.agenda.map((x, j) => (j === i ? { ...x, time: v } : x)) })} placeholder="08.00 WIB" />
              </div>
              <RowRemove onClick={() => set({ agenda: form.agenda.filter((_, j) => j !== i) })} />
            </div>
          ))}
        </div>
        <AddButton
          label="Tambah agenda"
          onClick={() =>
            set({ agenda: [...form.agenda, { date: new Date().toISOString().slice(0, 10), title: "", place: "", time: "" }] })
          }
        />
      </Panel>

      <Panel title="Pengumuman" desc="Info untuk wali santri — 3 teratas tampil di beranda, seluruhnya di halaman Pengumuman.">
        <div className="space-y-4">
          {form.notices.map((n, i) => (
            <div key={i} className="space-y-3 rounded-xl border border-border p-4">
              <div className="grid gap-3 sm:grid-cols-[140px_140px_minmax(0,1fr)]">
                <Field label="Tanggal" value={n.date} onChange={(v) => set({ notices: form.notices.map((x, j) => (j === i ? { ...x, date: v } : x)) })} placeholder="2026-11-08" />
                <Field label="Tag" value={n.tag} onChange={(v) => set({ notices: form.notices.map((x, j) => (j === i ? { ...x, tag: v } : x)) })} placeholder="PSB / Keuangan" />
                <Field label="Judul" value={n.title} onChange={(v) => set({ notices: form.notices.map((x, j) => (j === i ? { ...x, title: v } : x)) })} />
              </div>
              <Field label="Isi pengumuman" textarea value={n.text} onChange={(v) => set({ notices: form.notices.map((x, j) => (j === i ? { ...x, text: v } : x)) })} />
              <RowRemove onClick={() => set({ notices: form.notices.filter((_, j) => j !== i) })} />
            </div>
          ))}
        </div>
        <AddButton
          label="Tambah pengumuman"
          onClick={() =>
            set({ notices: [...form.notices, { date: new Date().toISOString().slice(0, 10), tag: "", title: "", text: "" }] })
          }
        />
      </Panel>

      <Panel title="Testimoni" desc="Kata wali santri & alumni — 2 teratas tampil di beranda, seluruhnya di halaman Mitra & Alumni.">
        <div className="space-y-4">
          {form.testimonials.map((t, i) => (
            <div key={i} className="space-y-3 rounded-xl border border-border p-4">
              <Field label="Kutipan" textarea value={t.quote} onChange={(v) => set({ testimonials: form.testimonials.map((x, j) => (j === i ? { ...x, quote: v } : x)) })} />
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Nama" value={t.name} onChange={(v) => set({ testimonials: form.testimonials.map((x, j) => (j === i ? { ...x, name: v } : x)) })} />
                <Field label="Keterangan" value={t.role} onChange={(v) => set({ testimonials: form.testimonials.map((x, j) => (j === i ? { ...x, role: v } : x)) })} placeholder="Alumni 2019 · Al-Azhar" />
              </div>
              <RowRemove onClick={() => set({ testimonials: form.testimonials.filter((_, j) => j !== i) })} />
            </div>
          ))}
        </div>
        <AddButton label="Tambah testimoni" onClick={() => set({ testimonials: [...form.testimonials, { quote: "", name: "", role: "" }] })} />
      </Panel>

      <Panel title="Mitra & lembaga" desc="Daftar mitra pada halaman Mitra & Alumni.">
        <div className="space-y-3">
          {form.partners.map((p, i) => (
            <div key={i} className="flex items-end gap-3">
              <div className="min-w-0 flex-1">
                <Field label={`Mitra ${i + 1}`} value={p} onChange={(v) => set({ partners: form.partners.map((x, j) => (j === i ? v : x)) })} />
              </div>
              <RowRemove onClick={() => set({ partners: form.partners.filter((_, j) => j !== i) })} />
            </div>
          ))}
        </div>
        <AddButton label="Tambah mitra" onClick={() => set({ partners: [...form.partners, ""] })} />
      </Panel>

      <div className="flex items-center gap-4">
        <button
          type="button"
          disabled={save.isPending}
          onClick={() => save.mutate()}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-cta transition-colors hover:bg-terracotta-hover disabled:opacity-60"
        >
          {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Simpan semua daftar
        </button>
        {status && (
          <span className={cn("text-sm font-semibold", save.isError ? "text-destructive" : "text-primary")}>{status}</span>
        )}
      </div>
    </>
  );
}

function Panel({ title, desc, children }: { title: string; desc: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
      <h2 className="font-display text-lg font-semibold text-foreground">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      <div className="mt-5 space-y-6">{children}</div>
    </section>
  );
}

function DashboardPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("beranda");
  const [draft, setDraft] = useState<SiteContent | null>(null);
  const [message, setMessage] = useState("");
  const { data: saved } = useQuery({ queryKey: ["site-content"], queryFn: () => getSiteContent() });
  const { data: auth, isPending: authPending } = useQuery({ queryKey: ["dashboard-auth"], queryFn: getAuth });
  const panelRef = useRef<HTMLDivElement>(null);

  const login = useMutation({
    mutationFn: (password: string) => loginDashboard({ data: { password } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dashboard-auth"] }),
  });
  const logout = useMutation({
    mutationFn: () => logoutDashboard(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dashboard-auth"] }),
  });

  useEffect(() => {
    if (saved && !draft) setDraft(normalize(saved));
  }, [saved, draft]);

  const save = useMutation({
    mutationFn: (content: SiteContent) => saveSiteContent({ data: content }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["site-content"] });
      setMessage("Tersimpan — perubahan sudah tampil di situs.");
      window.setTimeout(() => setMessage(""), 4000);
    },
    onError: (e) => {
      setMessage(e instanceof Error ? e.message : "Gagal menyimpan.");
    },
  });

  if (authPending) {
    return (
      <div className="grid min-h-[70vh] place-items-center text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Memuat dashboard…
      </div>
    );
  }

  if (!auth?.authed) return <LoginForm />;

  if (!draft) {
    return (
      <div className="grid min-h-[70vh] place-items-center text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Memuat dashboard…
      </div>
    );
  }

  const set = (patch: Partial<SiteContent>) => setDraft((d) => (d ? { ...d, ...patch } : d));
  const setHero = (i: number, patch: Partial<SiteContent["hero"][number]>) =>
    setDraft((d) => (d ? { ...d, hero: d.hero.map((h, j) => (j === i ? { ...h, ...patch } : h)) } : d));
  const setGallery = (i: number, patch: Partial<SiteContent["gallery"][number]>) =>
    setDraft((d) => (d ? { ...d, gallery: d.gallery.map((g, j) => (j === i ? { ...g, ...patch } : g)) } : d));
  const setSiteGallery = (i: number, patch: Partial<SiteContent["siteGallery"][number]>) =>
    setDraft((d) => (d ? { ...d, siteGallery: d.siteGallery.map((g, j) => (j === i ? { ...g, ...patch } : g)) } : d));
  const setNews = (id: string, patch: Partial<NewsContent>) =>
    setDraft((d) => (d ? { ...d, news: d.news.map((n) => (n.id === id ? { ...n, ...patch } : n)) } : d));

  return (
    <div className="min-h-screen bg-muted">
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-accent">Panel pengelolaan situs</p>
            <h1 className="mt-1 font-display text-3xl font-extrabold text-foreground">Dashboard Admin</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Unggah gambar, tulis kabar terbaru, dan ganti tampilan beranda di sini — tanpa menyentuh kode.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {message && (
              <span className={cn("text-sm font-semibold", save.isError ? "text-destructive" : "text-primary")}>
                {save.isPending ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Menyimpan…
                  </span>
                ) : save.isError ? (
                  message
                ) : (
                  <span className="inline-flex items-center gap-1.5">
                    <Check className="h-4 w-4" /> {message}
                  </span>
                )}
              </span>
            )}
            <button
              type="button"
              disabled={save.isPending}
              onClick={() => draft && save.mutate(draft)}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-cta transition-colors hover:bg-terracotta-hover disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              Simpan semua perubahan
            </button>
            <button
              type="button"
              onClick={() => logout.mutate()}
              title="Keluar dari dashboard"
              className="inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-muted-foreground ring-1 ring-border transition-colors hover:bg-muted"
            >
              <LogOut className="h-4 w-4" />
              Keluar
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          {/* Menu dashboard */}
          <aside className="h-fit rounded-xl border border-border bg-card p-3 lg:sticky lg:top-24">
            <p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Menu dashboard
            </p>
            <ul className="space-y-1">
              {MENU.map(({ key, label, desc, icon: Icon }) => (
                <li key={key}>
                  <button
                    type="button"
                    onClick={() => {
                      setTab(key);
                      setMessage("");
                    }}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                      tab === key ? "bg-secondary" : "hover:bg-muted",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg",
                        tab === key ? "bg-primary text-primary-foreground" : "bg-muted text-primary",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className={cn("block text-sm font-semibold", tab === key ? "text-primary" : "text-foreground")}>
                        {label}
                      </span>
                      <span className="block text-xs text-muted-foreground">{desc}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          {/* Panel aktif */}
          <div ref={panelRef} className="space-y-6">
            {tab === "pengaturan" && <SettingsAdmin />}

            {tab === "beranda" && (
              <>
                <Panel title="Slide 1 · Sambutan utama" desc="Slide pertama yang tampil saat halaman beranda dibuka.">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Label kecil" value={draft.hero[0]?.eyebrow ?? ""} placeholder="Pondok Pesantren Asasunnajaah" onChange={(v) => setHero(0, { eyebrow: v })} />
                    <Field label="Judul besar" value={draft.hero[0]?.title ?? ""} placeholder="Madrasah, Tahfizh, dan Kitab Kuning" onChange={(v) => setHero(0, { title: v })} />
                  </div>
                  <Field label="Teks penjelasan" textarea value={draft.hero[0]?.text ?? ""} placeholder="Kosongkan untuk memakai teks bawaan." onChange={(v) => setHero(0, { text: v })} />
                  <ImageField
                    label="Unggah gambar slide 1"
                    hint="Foto kelas/santri yang terang, maksimal 10 MB."
                    value={draft.hero[0]?.imageUrl ?? null}
                    onChange={(url) => setHero(0, { imageUrl: url })}
                  />
                </Panel>
                <Panel title="Slide 2 · Tahfizh & Diniyah" desc="Slide kedua pada rotasi hero.">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Label kecil" value={draft.hero[1]?.eyebrow ?? ""} onChange={(v) => setHero(1, { eyebrow: v })} />
                    <Field label="Judul besar" value={draft.hero[1]?.title ?? ""} onChange={(v) => setHero(1, { title: v })} />
                  </div>
                  <Field label="Teks penjelasan" textarea value={draft.hero[1]?.text ?? ""} onChange={(v) => setHero(1, { text: v })} />
                  <ImageField label="Unggah gambar slide 2" value={draft.hero[1]?.imageUrl ?? null} onChange={(url) => setHero(1, { imageUrl: url })} />
                </Panel>
                <Panel title="Slide 3 · PSB" desc="Slide ketiga pada rotasi hero.">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Label kecil" value={draft.hero[2]?.eyebrow ?? ""} onChange={(v) => setHero(2, { eyebrow: v })} />
                    <Field label="Judul besar" value={draft.hero[2]?.title ?? ""} onChange={(v) => setHero(2, { title: v })} />
                  </div>
                  <Field label="Teks penjelasan" textarea value={draft.hero[2]?.text ?? ""} onChange={(v) => setHero(2, { text: v })} />
                  <ImageField label="Unggah gambar slide 3" value={draft.hero[2]?.imageUrl ?? null} onChange={(url) => setHero(2, { imageUrl: url })} />
                </Panel>
              </>
            )}

            {tab === "kabar" && (
              <Panel
                title="Kabar terbaru (berita beranda)"
                desc="Tulis kabar/berita terbaru beserta fotonya. Tiga kabar paling atas tampil di beranda."
              >
                {draft.news.length === 0 && (
                  <p className="rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">
                    Belum ada kabar — beranda masih memakai contoh bawaan. Tambahkan kabar pertama Anda di bawah.
                  </p>
                )}
                {draft.news.map((n, i) => (
                  <article key={n.id} className="rounded-xl border border-border p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">Kabar #{i + 1}</p>
                      <button
                        type="button"
                        onClick={() => set({ news: draft.news.filter((x) => x.id !== n.id) })}
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-destructive ring-1 ring-destructive/30 transition-colors hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Hapus
                      </button>
                    </div>
                    <div className="mt-3 grid gap-4 sm:grid-cols-2">
                      <Field label="Judul" value={n.title} onChange={(v) => setNews(n.id, { title: v })} placeholder="Contoh: Wisuda Akbar ke-38" />
                      <Field label="Kategori" value={n.category} onChange={(v) => setNews(n.id, { category: v })} placeholder="Kegiatan / Prestasi / Pengumuman" />
                      <Field label="Tanggal" value={n.date} onChange={(v) => setNews(n.id, { date: v })} placeholder="2026-11-12 (tahun-bulan-tanggal)" />
                      <Field label="Penulis (opsional)" value={n.author} onChange={(v) => setNews(n.id, { author: v })} placeholder="Humas Pondok" />
                    </div>
                    <div className="mt-4">
                      <Field label="Ringkasan" textarea value={n.excerpt} onChange={(v) => setNews(n.id, { excerpt: v })} placeholder="Tulis ringkasan 1–3 kalimat." />
                    </div>
                    <div className="mt-4">
                      <ImageField
                        label="Unggah foto kabar"
                        value={n.imageUrl}
                        onChange={(url) => setNews(n.id, { imageUrl: url })}
                      />
                    </div>
                  </article>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    set({
                      news: [
                        { id: uid(), title: "", excerpt: "", category: "Kegiatan", date: new Date().toISOString().slice(0, 10), author: "", imageUrl: null },
                        ...draft.news,
                      ],
                    })
                  }
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4" />
                  Tambah kabar terbaru
                </button>
              </Panel>
            )}

            {tab === "galeri" && (
              <>
                <Panel title="Galeri beranda" desc="Enam foto suasana santri. Unggah foto baru atau ubah keterangannya.">
                  <div className="grid gap-5 sm:grid-cols-2">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="rounded-xl border border-border p-4">
                        <p className="text-sm font-semibold text-foreground">Foto {i + 1}</p>
                        <div className="mt-3">
                          <ImageField
                            label="Unggah gambar di sini"
                            aspect="aspect-[4/3]"
                            value={draft.gallery[i]?.imageUrl ?? null}
                            onChange={(url) => setGallery(i, { imageUrl: url })}
                          />
                        </div>
                        <div className="mt-3">
                          <Field label="Keterangan" value={draft.gallery[i]?.caption ?? ""} placeholder="Contoh: Halaqah ba'da Subuh" onChange={(v) => setGallery(i, { caption: v })} />
                        </div>
                      </div>
                    ))}
                  </div>
                </Panel>
                <Panel
                  title="Galeri halaman «Galeri & Kontak»"
                  desc="Sembilan foto pada halaman /galeri-kontak beserta keterangannya."
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    {[...Array(GALLERY_PAGE_SLOTS).keys()].map((i) => (
                      <div key={i} className="rounded-xl border border-border p-4">
                        <p className="text-sm font-semibold text-foreground">Foto {i + 1}</p>
                        <div className="mt-3">
                          <ImageField
                            label="Unggah gambar di sini"
                            aspect="aspect-[4/3]"
                            value={draft.siteGallery[i]?.imageUrl ?? null}
                            onChange={(url) => setSiteGallery(i, { imageUrl: url })}
                          />
                        </div>
                        <div className="mt-3">
                          <Field label="Keterangan" value={draft.siteGallery[i]?.caption ?? ""} placeholder="Contoh: Wisuda Akbar ke-37" onChange={(v) => setSiteGallery(i, { caption: v })} />
                        </div>
                      </div>
                    ))}
                  </div>
                </Panel>
              </>
            )}

            {tab === "halaman" && <PagesAdmin />}

            {tab === "konten" && <ListsAdmin />}

            {tab === "logo" && (
              <Panel title="Logo pondok" desc="Logo tampil di header dan footer. Gunakan berkas PNG dengan latar transparan agar rapi di tema gelap.">
                <div className="rounded-xl bg-deep p-5">
                  <ImageField
                    label="Unggah logo di sini"
                    hint="Disarankan PNG transparan, sisi terpanjang ±600px."
                    aspect="aspect-square"
                    value={draft.logo}
                    onChange={(url) => set({ logo: url })}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Tekan tombol <strong>Simpan semua perubahan</strong> di kanan atas setelah selesai mengunggah.
                </p>
              </Panel>
            )}

            {tab === "akun" && (
              <>
                <MembersAdmin />
                <SantriAdmin />
                <AlumniAdmin />
              </>
            )}

            {tab === "bayar" && <BillsAdmin />}

            {tab === "kebutuhan" && <NeedsAdmin />}

            <p className="text-xs text-muted-foreground">
              Konten disimpan di database MySQL (<code>alhidayah_admissions</code>); gambar disimpan di Vercel Blob
              saat deployment dan di <code>public/uploads</code> saat berjalan lokal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
