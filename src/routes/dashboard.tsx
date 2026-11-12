import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BadgeCheck,
  Check,
  ClipboardList,
  Eye,
  EyeOff,
  Home,
  ImageUp,
  Images,
  Loader2,
  Lock,
  LogIn,
  LogOut,
  Newspaper,
  Plus,
  ReceiptText,
  Save,
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
  type NewsContent,
  type SiteContent,
} from "@/lib/content-store";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard Admin — Pondok Pesantren Asasunnajaah" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardPage,
});

type Tab = "beranda" | "kabar" | "galeri" | "logo" | "akun" | "bayar" | "kebutuhan";

const MENU: { key: Tab; label: string; desc: string; icon: typeof Home }[] = [
  { key: "beranda", label: "Gambar Beranda", desc: "Ganti 3 slide & teks hero", icon: Home },
  { key: "kabar", label: "Kabar Terbaru", desc: "Tulis berita + foto baru", icon: Newspaper },
  { key: "galeri", label: "Galeri Beranda", desc: "Ganti 6 foto & keterangan", icon: Images },
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
    mutationFn: (v: { name: string; dataUrl: string }) => uploadImage({ data: v }),
  });

  const onPick = async (file: File | undefined) => {
    setError("");
    if (!file) return;
    if (file.size > 10_000_000) {
      setError("Ukuran maksimal 10 MB per gambar.");
      return;
    }
    try {
      const dataUrl = await fileToDataUrl(file);
      const res = await upload.mutateAsync({ name: file.name, dataUrl });
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
            )}

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
              Konten disimpan di database MySQL XAMPP (<code>alhidayah_admissions</code>), gambar unggahan di folder{" "}
              <code>public/uploads</code> pada komputer server ini.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
