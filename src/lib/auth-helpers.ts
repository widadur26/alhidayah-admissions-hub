import { deleteCookie, getCookie, setCookie } from "@tanstack/react-start/server";
import { getPool } from "@/lib/db";
import { encodePassword, verifyPassword } from "@/lib/hash";

/**
 * Logika sesi & cookie dashboard/wali/alumni — berjalan HANYA di server.
 *
 * PENTING: modul ini sengaja tidak pernah diimpor di tingkat atas berkas mana pun
 * yang ikut bundel client. Semua pemanggilnya (handler createServerFn) mengimpornya
 * secara dinamis DI DALAM handler, sehingga kode ini tidak pernah masuk bundel
 * peramban dan tidak memicu import-protection TanStack Start.
 */

export const DASH_COOKIE = "dashboard_session";
export const MEMBER_COOKIE = "member_session";
export const MAX_AGE = 7 * 24 * 60 * 60; // detik

export type MemberRole = "admin" | "wali" | "alumni" | "santri";
export type MemberUser = { id: number; name: string; username: string; role: MemberRole };

export const sessionCookieOptions = () => ({
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: MAX_AGE,
  secure: false, // berjalan lokal (http); set true saat di-hosting https
});

/* ==================== Kripto & token ==================== */

const loadCrypto = () => import("node:crypto");

const adminPassword = () => process.env.ADMIN_PASSWORD || "admin123";
const sessionSecret = () => process.env.ADMIN_SECRET || `${adminPassword()}#dashboard-asasunnajaah`;

const sign = async (payload: string): Promise<string> => {
  const { createHmac } = await loadCrypto();
  return createHmac("sha256", sessionSecret()).update(payload).digest("hex");
};

const tokenValid = async (token: string | undefined): Promise<boolean> => {
  if (!token) return false;
  const dot = token.indexOf(".");
  if (dot < 1) return false;
  const exp = Number(token.slice(0, dot));
  const sig = token.slice(dot + 1);
  if (!Number.isFinite(exp) || exp < Date.now() || !sig) return false;
  const expected = await sign(`dashboard:${exp}`);
  if (sig.length !== expected.length) return false;
  const { timingSafeEqual } = await loadCrypto();
  return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
};

/** Token member: "<userId>.<exp>.<tanda-tangan>" */
const memberTokenUserId = async (token: string | undefined): Promise<number | null> => {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [idRaw, expRaw, sig] = parts;
  const id = Number(idRaw);
  const exp = Number(expRaw);
  if (!Number.isFinite(id) || id < 1 || !Number.isFinite(exp) || exp < Date.now() || !sig) return null;
  const expected = await sign(`member:${id}:${exp}`);
  if (sig.length !== expected.length) return false;
  const { timingSafeEqual } = await loadCrypto();
  if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  return id;
};

/** Bandingkan password pintu cadangan admin tanpa membocorkan lewat waktu eksekusi. */
const sameAdminPassword = async (given: string): Promise<boolean> => {
  const { createHmac, timingSafeEqual } = await loadCrypto();
  const a = createHmac("sha256", "pw-check").update(given).digest();
  const b = createHmac("sha256", "pw-check").update(adminPassword()).digest();
  return timingSafeEqual(a, b);
};

const makeDashboardToken = async (): Promise<string> => {
  const exp = Date.now() + MAX_AGE * 1000;
  return `${exp}.${await sign(`dashboard:${exp}`)}`;
};

const makeMemberToken = async (id: number): Promise<string> => {
  const exp = Date.now() + MAX_AGE * 1000;
  return `${id}.${exp}.${await sign(`member:${id}:${exp}`)}`;
};

/* ==================== Operasi sesi ==================== */

/** true bila cookie dashboard valid ATAU akun ber-peran admin sedang login. */
export const isDashboardAuthed = async (): Promise<boolean> => {
  if (await tokenValid(getCookie(DASH_COOKIE))) return true;
  const userId = await memberTokenUserId(getCookie(MEMBER_COOKIE));
  if (!userId) return false;
  try {
    const pool = await getPool();
    const [rows] = await pool.query("SELECT role FROM users WHERE id = ? LIMIT 1", [userId]);
    return (rows as unknown as Array<{ role: string }>)[0]?.role === "admin";
  } catch {
    return false;
  }
};

/** Login admin lewat password tunggal (pintu cadangan). */
export const loginWithAdminPassword = async (password: string): Promise<{ ok: true }> => {
  if (!password || !(await sameAdminPassword(password))) throw new Error("Password salah.");
  setCookie(DASH_COOKIE, await makeDashboardToken(), sessionCookieOptions());
  return { ok: true };
};

/** Login akun wali/alumni/admin dari tabel users. */
export const loginWithAccount = async (
  username: string,
  password: string,
): Promise<{ ok: true; role: MemberRole }> => {
  if (!username || !password) throw new Error("Isi username dan password.");
  const pool = await getPool();
  const [rows] = await pool.query(
    "SELECT id, name, username, role, password_hash FROM users WHERE username = ? LIMIT 1",
    [username],
  );
  const user = (rows as unknown as Array<{ id: number; name: string; username: string; role: MemberRole; password_hash: string }>)[0];
  if (!user) throw new Error("Username atau password salah.");
  if (!(await verifyPassword(password, user.password_hash))) throw new Error("Username atau password salah.");
  setCookie(MEMBER_COOKIE, await makeMemberToken(user.id), sessionCookieOptions());
  return { ok: true, role: user.role };
};

/** Data akun yang sedang login member (null bila belum masuk). */
export const getMemberFromCookie = async (): Promise<MemberUser | null> => {
  const userId = await memberTokenUserId(getCookie(MEMBER_COOKIE));
  if (!userId) return null;
  try {
    const pool = await getPool();
    const [rows] = await pool.query("SELECT id, name, username, role FROM users WHERE id = ? LIMIT 1", [userId]);
    return (rows as unknown as MemberUser[])[0] ?? null;
  } catch {
    return null;
  }
};

/** Wajib login member (wali/alumni/admin) → data akun. */
export const requireMemberAuth = async (): Promise<MemberUser> => {
  const userId = await memberTokenUserId(getCookie(MEMBER_COOKIE));
  if (!userId) throw new Error("Silakan masuk terlebih dahulu.");
  const pool = await getPool();
  const [rows] = await pool.query("SELECT id, name, username, role FROM users WHERE id = ? LIMIT 1", [userId]);
  const user = (rows as unknown as MemberUser[])[0];
  if (!user) throw new Error("Akun tidak ditemukan — masuk kembali.");
  return user;
};

/** Wajib peran tertentu. */
export const requireMemberRole = async (roles: MemberRole[]): Promise<MemberUser> => {
  const user = await requireMemberAuth();
  if (!roles.includes(user.role)) throw new Error("Anda tidak punya akses ke data ini.");
  return user;
};

/** Wajib login dashboard — cookie password admin ATAU akun ber-peran admin. */
export const requireDashboardAuth = async (): Promise<void> => {
  if (await tokenValid(getCookie(DASH_COOKIE))) return;
  const user = await requireMemberRole(["admin"]);
  if (user.role !== "admin") throw new Error("Sesi berakhir — masuk kembali ke dashboard.");
};

/** Keluar: hapus kedua cookie sesi. */
export const clearSessions = (which: "dash" | "member"): void => {
  deleteCookie(which === "dash" ? DASH_COOKIE : MEMBER_COOKIE, { path: "/" });
};


