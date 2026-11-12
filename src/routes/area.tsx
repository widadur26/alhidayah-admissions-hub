import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BadgeCheck,
  CircleAlert,
  Clock3,
  FileUp,
  GraduationCap,
  Loader2,
  LogIn,
  LogOut,
  MessageSquarePlus,
  ReceiptText,
  Send,
  User,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { getMember, logoutMember } from "@/lib/auth";
import {
  getAlumniList,
  getMyBills,
  getMyNeeds,
  getMySantriProfile,
  getSantriList,
  submitNeed,
  submitPayment,
  type BillItem,
} from "@/lib/members";

export const Route = createFileRoute("/area")({
  head: () => ({
    meta: [{ title: "Area Wali & Alumni — Pondok Pesantren Asasunnajaah" }],
  }),
  component: AreaPage,
});

const rupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

const STATUS: Record<BillItem["status"], { label: string; cls: string }> = {
  belum: { label: "Belum dibayar", cls: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
  menunggu: { label: "Menunggu verifikasi", cls: "bg-blue-500/15 text-blue-700 dark:text-blue-400" },
  lunas: { label: "Lunas", cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" },
};

type Tab = "tagihan" | "saya" | "alumni" | "santri" | "kebutuhan";

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Gagal membaca berkas."));
    reader.readAsDataURL(file);
  });
}

/* ---------- Kartu tagihan + dialog pembayaran ---------- */

function BillCard({ bill }: { bill: BillItem }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [proof, setProof] = useState<{ name: string; dataUrl: string } | null>(null);
  const [error, setError] = useState("");

  const submit = useMutation({
    mutationFn: () => submitPayment({ data: { billId: bill.id, name: proof?.name, dataUrl: proof?.dataUrl } }),
    onSuccess: async () => {
      setOpen(false);
      setProof(null);
      await queryClient.invalidateQueries({ queryKey: ["my-bills"] });
    },
    onError: (e) => setError(e instanceof Error ? e.message : "Gagal mengirim bukti."),
  });

  const pick = async (file: File | undefined) => {
    setError("");
    if (!file) return;
    if (file.size > 10_000_000) {
      setError("Ukuran maksimal 10 MB per gambar.");
      return;
    }
    try {
      setProof({ name: file.name, dataUrl: await fileToDataUrl(file) });
    } catch {
      setError("Gagal membaca berkas.");
    }
  };

  const st = STATUS[bill.status];

  return (
    <article className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-foreground">{bill.title}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Jatuh tempo {bill.dueDate || "—"}
          </p>
        </div>
        <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", st.cls)}>{st.label}</span>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="font-display text-xl font-extrabold text-primary">{rupiah(bill.amount)}</p>
        {bill.status === "belum" && (
          <button
            type="button"
            onClick={() => {
              setError("");
              setProof(null);
              setOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-terracotta-hover"
          >
            <Send className="h-4 w-4" />
            Bayar
          </button>
        )}
        {bill.status === "menunggu" && bill.proofUrl && (
          <a href={bill.proofUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold text-primary underline">
            Lihat bukti yang dikirim
          </a>
        )}
        {bill.status === "lunas" && bill.paidAt && (
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <BadgeCheck className="h-4 w-4" />
            Diverifikasi {bill.paidAt.slice(0, 10)}
          </p>
        )}
      </div>

      {/* Dialog pengiriman bukti transfer */}
      {open && (
        <div className="mt-4 rounded-xl border border-border bg-muted p-4">
          <p className="text-sm font-semibold text-foreground">Kirim bukti transfer</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Transfer ke rekening pondok (info rekening dari panitia/WA humas), lalu unggah foto buktinya.
            Admin akan memverifikasi maksimal 1×24 jam.
          </p>
          <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-full bg-card px-4 py-2 text-xs font-semibold text-foreground ring-1 ring-border transition-colors hover:bg-accent/10">
            <FileUp className="h-3.5 w-3.5" />
            {proof ? "Ganti foto bukti" : "Pilih foto bukti transfer"}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/avif"
              className="hidden"
              onChange={(e) => {
                void pick(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </label>
          {proof && <p className="mt-2 text-xs text-muted-foreground">Dipilih: {proof.name}</p>}
          {error && <p className="mt-2 text-xs font-medium text-destructive">{error}</p>}
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              disabled={!proof || submit.isPending}
              onClick={() => submit.mutate()}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {submit.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              Kirim bukti
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full px-4 py-2 text-xs font-semibold text-muted-foreground ring-1 ring-border transition-colors hover:bg-muted"
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

/* ---------- Form & daftar kebutuhan ---------- */

const NEED_STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  baru: { label: "Baru", cls: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
  diproses: { label: "Diproses", cls: "bg-blue-500/15 text-blue-700 dark:text-blue-400" },
  selesai: { label: "Selesai", cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" },
};

function NeedsSection() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [error, setError] = useState("");

  const submit = useMutation({
    mutationFn: () => submitNeed({ data: { title, detail } }),
    onSuccess: async () => {
      setTitle("");
      setDetail("");
      await queryClient.invalidateQueries({ queryKey: ["my-needs"] });
    },
    onError: (e) => setError(e instanceof Error ? e.message : "Gagal mengirim kebutuhan."),
  });

  return (
    <>
      <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <p className="text-sm font-semibold text-foreground">Sampaikan kebutuhan Anda</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Tulis kebutuhan, keluhan, atau saran untuk pondok — misalnya kebutuhan belajar, kegiatan, atau
          fasilitas. Pengelola akan membacanya di dashboard admin.
        </p>
        <input
          type="text"
          value={title}
          maxLength={200}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ringkasan singkat, mis. Perlu tambahan buku tahfizh"
          className="mt-3 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-accent"
        />
        <textarea
          value={detail}
          rows={3}
          onChange={(e) => setDetail(e.target.value)}
          placeholder="Jelaskan lebih rinci (opsional)…"
          className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-accent"
        />
        {error && <p className="mt-2 text-xs font-medium text-destructive">{error}</p>}
        <button
          type="button"
          disabled={!title.trim() || submit.isPending}
          onClick={() => {
            setError("");
            submit.mutate();
          }}
          className="mt-3 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-terracotta-hover disabled:opacity-60"
        >
          {submit.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Kirim kebutuhan
        </button>
      </div>

      <div className="space-y-3">
        {needs.isPending && (
          <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Memuat kebutuhan Anda…
          </p>
        )}
        {needs.data?.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">Belum ada kebutuhan yang Anda kirim.</p>
        )}
        {needs.data?.map((n) => {
          const st = NEED_STATUS_LABEL[n.status] ?? NEED_STATUS_LABEL.baru!;
          return (
            <article key={n.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{n.title}</p>
                  {n.detail && <p className="mt-1 text-sm text-muted-foreground">{n.detail}</p>}
                  {n.createdAt && (
                    <p className="mt-1 text-xs text-muted-foreground">Dikirim {n.createdAt.slice(0, 10)}</p>
                  )}
                </div>
                <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", st.cls)}>{st.label}</span>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}

/* ---------- Halaman ---------- */

function AreaPage() {
  const queryClient = useQueryClient();
  const { data: member, isPending } = useQuery({ queryKey: ["member"], queryFn: getMember });
  const [tab, setTab] = useState<Tab>("tagihan");

  const isSantri = member?.role === "santri";
  const bills = useQuery({
    queryKey: ["my-bills"],
    queryFn: getMyBills,
    enabled: isSantri,
  });
  const alumni = useQuery({ queryKey: ["alumni-list"], queryFn: getAlumniList, enabled: !!member });
  const canSeeSantri = !!member && (member.role === "wali" || member.role === "admin");
  const santri = useQuery({ queryKey: ["santri-list"], queryFn: getSantriList, enabled: canSeeSantri });
  const myProfile = useQuery({ queryKey: ["my-santri-profile"], queryFn: getMySantriProfile, enabled: isSantri });
  const needs = useQuery({ queryKey: ["my-needs"], queryFn: getMyNeeds, enabled: !!member });

  const logout = useMutation({
    mutationFn: () => logoutMember(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["member"] }),
  });

  if (isPending) {
    return (
      <div className="grid min-h-[70vh] place-items-center text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Memuat…
      </div>
    );
  }

  if (!member) {
    return (
      <div className="grid min-h-screen place-items-center bg-muted px-4">
        <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 text-center shadow-sm">
          <div className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary">
            <LogIn className="h-5 w-5" />
          </div>
          <h1 className="mt-3 font-display text-xl font-extrabold text-foreground">Anda belum masuk</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Data tagihan, daftar alumni, dan daftar santri hanya tampil setelah masuk sebagai wali santri,
            alumni, santri, atau pengelola pondok. Informasi pembayaran hanya untuk akun santri.
          </p>
          <Link
            to="/masuk"
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-cta transition-colors hover:bg-terracotta-hover"
          >
            <LogIn className="h-4 w-4" />
            Masuk sekarang
          </Link>
        </div>
      </div>
    );
  }

  if (member.role === "admin") {
    return (
      <div className="grid min-h-screen place-items-center bg-muted px-4">
        <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 text-center shadow-sm">
          <h1 className="font-display text-xl font-extrabold text-foreground">Masuk sebagai admin</h1>
          <p className="mt-1 text-sm text-muted-foreground">Kelola situs lewat Dashboard Admin.</p>
          <Link
            to="/dashboard"
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-cta transition-colors hover:bg-terracotta-hover"
          >
            Buka Dashboard Admin
          </Link>
          <button
            type="button"
            onClick={() => logout.mutate()}
            className="mt-2 inline-flex w-full items-center justify-center rounded-full px-6 py-2.5 text-sm font-semibold text-muted-foreground ring-1 ring-border transition-colors hover:bg-muted"
          >
            Keluar
          </button>
        </div>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: typeof ReceiptText; show: boolean }[] = [
    { key: "tagihan", label: "Tagihan Saya", icon: ReceiptText, show: member.role === "santri" },
    { key: "saya", label: "Data Saya", icon: User, show: member.role === "santri" },
    { key: "alumni", label: "Daftar Alumni", icon: GraduationCap, show: true },
    { key: "santri", label: "Daftar Santri", icon: Users, show: canSeeSantri },
    { key: "kebutuhan", label: "Sampaikan Kebutuhan", icon: MessageSquarePlus, show: true },
  ];
  const activeTabs = tabs.filter((t) => t.show);
  const activeKey = activeTabs.some((t) => t.key === tab) ? tab : activeTabs[0].key;

  return (
    <div className="min-h-screen bg-muted">
      <div className="mx-auto max-w-5xl px-4 pb-20 pt-28 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-accent">Area terbatas · data dijaga server</p>
            <h1 className="mt-1 font-display text-3xl font-extrabold text-foreground">Assalamu'alaikum, {member.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Anda masuk sebagai <span className="font-semibold capitalize">{member.role}</span>. Data hanya
              tampil setelah masuk — tidak bisa diakses pengunjung biasa.
            </p>
          </div>
          <button
            type="button"
            onClick={() => logout.mutate()}
            className="inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-muted-foreground ring-1 ring-border transition-colors hover:bg-muted"
          >
            <LogOut className="h-4 w-4" />
            Keluar
          </button>
        </div>

        {/* Tab */}
        <div className="mt-6 flex flex-wrap gap-2">
          {activeTabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors",
                activeKey === key
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-foreground ring-1 ring-border hover:bg-accent/10",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          {activeKey === "tagihan" && (
            <>
              {bills.isPending && (
                <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Memuat tagihan…
                </p>
              )}
              {bills.data?.length === 0 && (
                <div className="rounded-xl border border-border bg-card p-6 text-center">
                  <Clock3 className="mx-auto h-6 w-6 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">Belum ada tagihan untuk akun Anda.</p>
                </div>
              )}
              {bills.data?.map((b) => <BillCard key={b.id} bill={b} />)}
            </>
          )}

          {activeKey === "saya" && (
            <>
              {myProfile.isPending && (
                <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Memuat data…
                </p>
              )}
              {myProfile.data && (
                <div className="rounded-xl border border-border bg-card p-5">
                  <p className="font-display text-lg font-extrabold text-foreground">{myProfile.data.name}</p>
                  <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-xs font-semibold text-muted-foreground">Kelas</dt>
                      <dd className="text-foreground">{myProfile.data.kelas || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold text-muted-foreground">Angkatan</dt>
                      <dd className="text-foreground">{myProfile.data.angkatan || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold text-muted-foreground">Wali</dt>
                      <dd className="text-foreground">{myProfile.data.waliName || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold text-muted-foreground">Username</dt>
                      <dd className="text-foreground">{myProfile.data.username ?? "—"}</dd>
                    </div>
                  </dl>
                </div>
              )}
              {!myProfile.isPending && !myProfile.data && (
                <div className="rounded-xl border border-border bg-card p-6 text-center">
                  <CircleAlert className="mx-auto h-6 w-6 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Akun Anda belum tertaut ke profil santri — hubungi admin.
                  </p>
                </div>
              )}
            </>
          )}

          {activeKey === "kebutuhan" && <NeedsSection />}

          {activeKey === "alumni" && (
            <>
              {alumni.isPending && (
                <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Memuat daftar alumni…
                </p>
              )}
              {alumni.data?.length === 0 && (
                <div className="rounded-xl border border-border bg-card p-6 text-center">
                  <CircleAlert className="mx-auto h-6 w-6 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">Daftar alumni belum diisi admin.</p>
                </div>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                {alumni.data?.map((a) => (
                  <div key={a.id} className="rounded-xl border border-border bg-card p-4">
                    <p className="font-semibold text-foreground">{a.name}</p>
                    <p className="mt-0.5 text-xs font-semibold text-accent">Angkatan {a.angkatan || "—"}</p>
                    {a.nowStatus && <p className="mt-1 text-sm text-muted-foreground">{a.nowStatus}</p>}
                  </div>
                ))}
              </div>
            </>
          )}

          {activeKey === "santri" && canSeeSantri && (
            <>
              {santri.isPending && (
                <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Memuat daftar santri…
                </p>
              )}
              {santri.data?.length === 0 && (
                <div className="rounded-xl border border-border bg-card p-6 text-center">
                  <CircleAlert className="mx-auto h-6 w-6 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">Daftar santri belum diisi admin.</p>
                </div>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                {santri.data?.map((s) => (
                  <div key={s.id} className="rounded-xl border border-border bg-card p-4">
                    <p className="font-semibold text-foreground">{s.name}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {s.kelas || "—"} · Angkatan {s.angkatan || "—"}
                    </p>
                    {s.waliName && (
                      <p className="mt-1 text-xs text-muted-foreground">Wali: {s.waliName}</p>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <p className="mt-10 text-xs text-muted-foreground">
          Data dijaga di sisi server: tanpa login, tagihan, daftar alumni, dan daftar santri tidak pernah
          dikirim ke peramban — dan informasi pembayaran hanya untuk akun santri. Status{" "}
          <em>menunggu verifikasi</em> berarti bukti transfer sedang diperiksa admin.
        </p>
      </div>
    </div>
  );
}
