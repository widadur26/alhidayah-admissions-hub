import { createServerFn } from "@tanstack/react-start";

/**
 * Proteksi dashboard admin (/dashboard) + sesi akun wali santri/alumni.
 * Berkas ini HANYA berisi pembungkus createServerFn — semua logika sesi/cookie/kripto
 * ada di @/lib/auth-helpers dan diimpor dinamis DI DALAM handler, sehingga
 * tidak pernah masuk bundel peramban (tidak memicu import-protection TanStack Start).
 */

export type AuthStatus = { authed: boolean };
export type { MemberRole, MemberUser } from "@/lib/auth-helpers";

/** Status login dashboard — cookie password admin ATAU akun admin dari tabel users. */
export const getAuth = createServerFn({ method: "GET" }).handler(async (): Promise<AuthStatus> => {
  const h = await import("@/lib/auth-helpers");
  return { authed: await h.isDashboardAuthed() };
});

/** Login dengan password tunggal (pintu cadangan admin) → cookie sesi dashboard. */
export const loginDashboard = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as { password?: string })
  .handler(async ({ data }) => {
    const h = await import("@/lib/auth-helpers");
    await h.loginWithAdminPassword((data?.password ?? "").trim());
    return { ok: true as const };
  });

/** Keluar dari sesi dashboard. */
export const logoutDashboard = createServerFn({ method: "POST" }).handler(async () => {
  const h = await import("@/lib/auth-helpers");
  h.clearSessions("dash");
  return { ok: true as const };
});

/** Login dengan username & password dari tabel users (wali/alumni/admin). */
export const loginMember = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as { username?: string; password?: string })
  .handler(async ({ data }) => {
    const h = await import("@/lib/auth-helpers");
    return h.loginWithAccount((data?.username ?? "").trim().toLowerCase(), data?.password ?? "");
  });

/** Keluar dari sesi member. */
export const logoutMember = createServerFn({ method: "POST" }).handler(async () => {
  const h = await import("@/lib/auth-helpers");
  h.clearSessions("member");
  return { ok: true as const };
});

/** Data akun yang sedang login (null bila belum masuk). */
export const getMember = createServerFn({ method: "GET" }).handler(async () => {
  const h = await import("@/lib/auth-helpers");
  return h.getMemberFromCookie();
});
