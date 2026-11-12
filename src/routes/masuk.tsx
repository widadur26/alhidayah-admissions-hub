import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, LogIn, LockKeyhole } from "lucide-react";

import { getMember, loginMember, logoutMember } from "@/lib/auth";

export const Route = createFileRoute("/masuk")({
  head: () => ({
    meta: [{ title: "Masuk — Pondok Pesantren Asasunnajaah" }],
  }),
  component: MasukPage,
});

function MasukPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { data: member } = useQuery({ queryKey: ["member"], queryFn: getMember });

  const login = useMutation({
    mutationFn: () => loginMember({ data: { username, password } }),
    onSuccess: async (res) => {
      await queryClient.invalidateQueries({ queryKey: ["member"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-auth"] });
      navigate({ to: res.role === "admin" ? "/dashboard" : "/area" });
    },
    onError: (e) => setError(e instanceof Error ? e.message : "Gagal masuk."),
  });

  const logout = useMutation({
    mutationFn: () => logoutMember(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["member"] }),
  });

  if (member) {
    return (
      <div className="grid min-h-screen place-items-center bg-muted px-4">
        <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 text-center shadow-sm">
          <div className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary">
            <LockKeyhole className="h-5 w-5" />
          </div>
          <h1 className="mt-3 font-display text-xl font-extrabold text-foreground">Anda sudah masuk</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {member.name} · <span className="uppercase">{member.role}</span>
          </p>
          <div className="mt-5 space-y-2">
            <Link
              to={member.role === "admin" ? "/dashboard" : "/area"}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-cta transition-colors hover:bg-terracotta-hover"
            >
              Buka {member.role === "admin" ? "Dashboard Admin" : "Area Wali & Alumni"}
            </Link>
            <button
              type="button"
              onClick={() => logout.mutate()}
              className="inline-flex w-full items-center justify-center rounded-full px-6 py-2.5 text-sm font-semibold text-muted-foreground ring-1 ring-border transition-colors hover:bg-muted"
            >
              Keluar dari akun ini
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen place-items-center bg-muted px-4">
      <div className="w-full max-w-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setError("");
            if (!login.isPending) login.mutate();
          }}
          className="rounded-xl border border-border bg-card p-6 shadow-sm"
        >
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary">
            <LogIn className="h-5 w-5" />
          </div>
          <h1 className="mt-3 font-display text-xl font-extrabold text-foreground">Masuk</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Wali santri, alumni, dan pengelola pondok.
          </p>
          <label className="mt-5 block">
            <span className="text-sm font-semibold text-foreground">Username</span>
            <input
              type="text"
              value={username}
              autoFocus
              autoComplete="username"
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-accent"
            />
          </label>
          <label className="mt-3 block">
            <span className="text-sm font-semibold text-foreground">Password</span>
            <input
              type="password"
              value={password}
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-accent"
            />
          </label>
          {error && <p className="mt-2 text-xs font-medium text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={login.isPending || !username || !password}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-cta transition-colors hover:bg-terracotta-hover disabled:opacity-60"
          >
            {login.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
            Masuk
          </button>
          <Link
            to="/"
            className="mt-3 block text-center text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            ← Kembali ke beranda
          </Link>
        </form>
        <div className="mt-4 rounded-xl border border-border bg-card/60 p-4 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground">Akun contoh (data awal):</p>
          <p className="mt-1">
            Admin: <code>admin</code> / <code>admin123</code> · Wali: <code>wali01</code> / <code>wali123</code> ·
            Alumni: <code>alumni01</code> / <code>alumni123</code> · Santri: <code>santri01</code> /{" "}
            <code>santri123</code>
          </p>
          <p className="mt-1">Akun wali/alumni/santri ditambahkan oleh admin lewat Dashboard → Wali &amp; Alumni.</p>
        </div>
      </div>
    </div>
  );
}
