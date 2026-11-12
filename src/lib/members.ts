import { createServerFn } from "@tanstack/react-start";
import { dbErrorMessage, getPool } from "@/lib/db";
import type { MemberRole } from "@/lib/auth";
import { encodePassword } from "@/lib/hash";
import { saveUploadFile } from "@/lib/uploads";

/**
 * Data keanggotaan: akun, daftar santri, daftar alumni, dan tagihan/pembayaran.
 * Aturan akses diberlakukan di SERVER (data tidak pernah dikirim tanpa login):
 * - Belum login   → tidak bisa melihat apa pun.
 * - Wali santri   → tagihan miliknya, daftar alumni, daftar santri.
 * - Alumni        → tagihan miliknya, daftar alumni (bukan daftar santri).
 * - Admin         → semua data + kelola lewat dashboard.
 */

export type MemberItem = { id: number; name: string; username: string; role: MemberRole };
export type AlumniItem = { id: number; name: string; angkatan: string; nowStatus: string };
export type SantriItem = { id: number; name: string; kelas: string; angkatan: string; waliName: string; username: string | null };
export type BillStatus = "belum" | "menunggu" | "lunas";
export type BillItem = {
  id: number;
  userId: number;
  memberName: string;
  title: string;
  amount: number;
  dueDate: string;
  status: BillStatus;
  proofUrl: string | null;
  paidAt: string | null;
};
export type NeedStatus = "baru" | "diproses" | "selesai";
export type NeedItem = {
  id: number;
  userId: number;
  memberName: string;
  memberRole: MemberRole;
  title: string;
  detail: string;
  status: NeedStatus;
  createdAt: string | null;
};

/* ==================== Data untuk wali & alumni (butuh login member) ==================== */

/** Daftar alumni — wali, alumni, dan admin yang sedang login. */
export const getAlumniList = createServerFn({ method: "GET" }).handler(async (): Promise<AlumniItem[]> => {
  const { requireMemberAuth } = await import("@/lib/auth-helpers");
  await requireMemberAuth();
  const pool = await getPool();
  const [rows] = await pool.query("SELECT id, name, angkatan, now_status FROM alumni_list ORDER BY angkatan DESC, name ASC");
  return (rows as unknown as Array<{ id: number; name: string; angkatan: string; now_status: string }>).map((r) => ({
    id: r.id,
    name: r.name,
    angkatan: r.angkatan ?? "",
    nowStatus: r.now_status ?? "",
  }));
});

/** Daftar santri — hanya wali santri & admin. */
export const getSantriList = createServerFn({ method: "GET" }).handler(async (): Promise<SantriItem[]> => {
  const { requireMemberRole } = await import("@/lib/auth-helpers");
  await requireMemberRole(["wali", "admin"]);
  const pool = await getPool();
  const [rows] = await pool.query(
    "SELECT s.id, s.name, s.kelas, s.angkatan, s.wali_name, u.username FROM santri_list s LEFT JOIN users u ON u.id = s.user_id ORDER BY s.name ASC",
  );
  return (rows as unknown as Array<{ id: number; name: string; kelas: string; angkatan: string; wali_name: string; username: string | null }>).map((r) => ({
    id: r.id,
    name: r.name,
    kelas: r.kelas ?? "",
    angkatan: r.angkatan ?? "",
    waliName: r.wali_name ?? "",
    username: r.username ?? null,
  }));
});

/** Tagihan milik akun santri yang sedang login — informasi pembayaran hanya untuk peran santri. */
export const getMyBills = createServerFn({ method: "GET" }).handler(async (): Promise<BillItem[]> => {
  const { requireMemberAuth } = await import("@/lib/auth-helpers");
  const user = await requireMemberAuth();
  if (user.role !== "santri") throw new Error("Informasi pembayaran hanya tampil untuk akun santri.");
  const pool = await getPool();
  const [rows] = await pool.query(
    "SELECT id, user_id, title, amount, due_date, status, proof_url, paid_at FROM bills WHERE user_id = ? ORDER BY id DESC",
    [user.id],
  );
  return (rows as unknown as Array<Record<string, unknown>>).map((r) => ({
    id: Number(r.id),
    userId: Number(r.user_id),
    memberName: user.name,
    title: String(r.title ?? ""),
    amount: Number(r.amount ?? 0),
    dueDate: String(r.due_date ?? ""),
    status: (r.status as BillStatus) ?? "belum",
    proofUrl: (r.proof_url as string | null) ?? null,
    paidAt: (r.paid_at as string | null) ?? null,
  }));
});

/** Kirim bukti transfer untuk tagihan milik sendiri → berstatus "menunggu verifikasi". */
export const submitPayment = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as { billId?: number; name?: string; dataUrl?: string })
  .handler(async ({ data }) => {
    const { requireMemberAuth } = await import("@/lib/auth-helpers");
    const user = await requireMemberAuth();
    const pool = await getPool();
    const [rows] = await pool.query("SELECT id, status FROM bills WHERE id = ? AND user_id = ? LIMIT 1", [
      data?.billId,
      user.id,
    ]);
    const bill = (rows as unknown as Array<{ id: number; status: BillStatus }>)[0];
    if (!bill) throw new Error("Tagihan tidak ditemukan.");
    if (bill.status === "lunas") throw new Error("Tagihan ini sudah lunas.");
    const proofUrl = await saveUploadFile(data?.name ?? "bukti-transfer", data?.dataUrl ?? "");
    await pool.query("UPDATE bills SET status = 'menunggu', proof_url = ?, paid_at = NULL WHERE id = ?", [
      proofUrl,
      bill.id,
    ]);
    return { ok: true as const };
  });

/** Profil santri milik akun yang sedang login — hanya peran santri. */
export const getMySantriProfile = createServerFn({ method: "GET" }).handler(async (): Promise<SantriItem | null> => {
  const { requireMemberRole } = await import("@/lib/auth-helpers");
  const user = await requireMemberRole(["santri"]);
  const pool = await getPool();
  const [rows] = await pool.query(
    "SELECT id, name, kelas, angkatan, wali_name FROM santri_list WHERE user_id = ? LIMIT 1",
    [user.id],
  );
  const r = (rows as unknown as Array<{ id: number; name: string; kelas: string; angkatan: string; wali_name: string }>)[0];
  if (!r) return null;
  return {
    id: r.id,
    name: r.name,
    kelas: r.kelas ?? "",
    angkatan: r.angkatan ?? "",
    waliName: r.wali_name ?? "",
    username: user.username,
  };
});

/* ==================== Kebutuhan (permintaan wali/alumni/santri → admin) ==================== */

/** Kirim kebutuhan/permintaan baru dari akun yang sedang login. */
export const submitNeed = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as { title?: string; detail?: string })
  .handler(async ({ data }) => {
    const { requireMemberAuth } = await import("@/lib/auth-helpers");
    const user = await requireMemberAuth();
    const title = (data?.title ?? "").trim();
    if (!title) throw new Error("Tulis ringkasan kebutuhan terlebih dahulu.");
    if (title.length > 200) throw new Error("Ringkasan maksimal 200 karakter.");
    const pool = await getPool();
    await pool.query("INSERT INTO needs_items (user_id, title, detail) VALUES (?, ?, ?)", [
      user.id,
      title,
      (data?.detail ?? "").trim(),
    ]);
    return { ok: true as const };
  });

/** Daftar kebutuhan milik akun yang sedang login. */
export const getMyNeeds = createServerFn({ method: "GET" }).handler(async (): Promise<NeedItem[]> => {
  const { requireMemberAuth } = await import("@/lib/auth-helpers");
  const user = await requireMemberAuth();
  const pool = await getPool();
  const [rows] = await pool.query(
    "SELECT id, title, detail, status, created_at FROM needs_items WHERE user_id = ? ORDER BY id DESC",
    [user.id],
  );
  return (rows as unknown as Array<Record<string, unknown>>).map((r) => ({
    id: Number(r.id),
    userId: user.id,
    memberName: user.name,
    memberRole: user.role,
    title: String(r.title ?? ""),
    detail: String(r.detail ?? ""),
    status: (r.status as NeedStatus) ?? "baru",
    createdAt: (r.created_at as string | Date | null)
      ? new Date(r.created_at as string).toISOString()
      : null,
  }));
});

/** Semua kebutuhan dari seluruh akun — untuk dashboard admin. */
export const listAllNeeds = createServerFn({ method: "GET" }).handler(async (): Promise<NeedItem[]> => {
  const { requireDashboardAuth } = await import("@/lib/auth-helpers");
  await requireDashboardAuth();
  const pool = await getPool();
  const [rows] = await pool.query(
    `SELECT n.id, n.user_id, n.title, n.detail, n.status, n.created_at, u.name AS member_name, u.role AS member_role
     FROM needs_items n LEFT JOIN users u ON u.id = n.user_id
     ORDER BY n.status = 'baru' DESC, n.id DESC`,
  );
  return (rows as unknown as Array<Record<string, unknown>>).map((r) => ({
    id: Number(r.id),
    userId: Number(r.user_id),
    memberName: String(r.member_name ?? "—"),
    memberRole: (r.member_role as MemberRole) ?? "wali",
    title: String(r.title ?? ""),
    detail: String(r.detail ?? ""),
    status: (r.status as NeedStatus) ?? "baru",
    createdAt: (r.created_at as string | Date | null)
      ? new Date(r.created_at as string).toISOString()
      : null,
  }));
});

/** Ubah status kebutuhan: baru → diproses → selesai. */
export const decideNeed = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as { id?: number; status?: NeedStatus })
  .handler(async ({ data }) => {
    const { requireDashboardAuth } = await import("@/lib/auth-helpers");
    await requireDashboardAuth();
    const status = (["baru", "diproses", "selesai"] as const).includes(data?.status as NeedStatus)
      ? (data?.status as NeedStatus)
      : "baru";
    const pool = await getPool();
    await pool.query("UPDATE needs_items SET status = ? WHERE id = ?", [status, data?.id]);
    return { ok: true as const };
  });

export const deleteNeed = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as { id?: number })
  .handler(async ({ data }) => {
    const { requireDashboardAuth } = await import("@/lib/auth-helpers");
    await requireDashboardAuth();
    const pool = await getPool();
    await pool.query("DELETE FROM needs_items WHERE id = ?", [data?.id]);
    return { ok: true as const };
  });

/* ==================== Kelola lewat dashboard (butuh admin) ==================== */

export const listMembers = createServerFn({ method: "GET" }).handler(async (): Promise<MemberItem[]> => {
  const { requireDashboardAuth } = await import("@/lib/auth-helpers");
  await requireDashboardAuth();
  const pool = await getPool();
  const [rows] = await pool.query("SELECT id, name, username, role FROM users ORDER BY role ASC, name ASC");
  return rows as unknown as MemberItem[];
});

export const createMember = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as { name?: string; username?: string; password?: string; role?: MemberRole })
  .handler(async ({ data }) => {
    const { requireDashboardAuth } = await import("@/lib/auth-helpers");
    await requireDashboardAuth();
    const name = (data?.name ?? "").trim();
    const username = (data?.username ?? "").trim().toLowerCase();
    const password = data?.password ?? "";
    const role = (["admin", "wali", "alumni", "santri"] as const).includes(data?.role as MemberRole)
      ? (data?.role as MemberRole)
      : "wali";
    if (!name || !username || !password) throw new Error("Nama, username, dan sandi wajib diisi.");
    if (!/^[a-z0-9._-]{3,60}$/.test(username))
      throw new Error("Username 3–60 karakter, hanya huruf kecil, angka, titik, garis.");
    if (password.length < 4) throw new Error("Sandi minimal 4 karakter.");
    const pool = await getPool();
    try {
      await pool.query("INSERT INTO users (name, username, password_hash, role) VALUES (?, ?, ?, ?)", [
        name,
        username,
        await encodePassword(password),
        role,
      ]);
    } catch (e) {
      if ((e as { code?: string })?.code === "ER_DUP_ENTRY") throw new Error("Username sudah dipakai.");
      throw new Error(dbErrorMessage(e));
    }
    return { ok: true as const };
  });

export const deleteMember = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as { id?: number })
  .handler(async ({ data }) => {
    const { requireDashboardAuth } = await import("@/lib/auth-helpers");
    await requireDashboardAuth();
    const pool = await getPool();
    try {
      await pool.query("DELETE FROM users WHERE id = ?", [data?.id]);
    } catch (e) {
      throw new Error(dbErrorMessage(e));
    }
    return { ok: true as const };
  });

export const addAlumni = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as { name?: string; angkatan?: string; nowStatus?: string })
  .handler(async ({ data }) => {
    const { requireDashboardAuth } = await import("@/lib/auth-helpers");
    await requireDashboardAuth();
    const name = (data?.name ?? "").trim();
    if (!name) throw new Error("Nama alumni wajib diisi.");
    const pool = await getPool();
    await pool.query("INSERT INTO alumni_list (name, angkatan, now_status) VALUES (?, ?, ?)", [
      name,
      (data?.angkatan ?? "").trim(),
      (data?.nowStatus ?? "").trim(),
    ]);
    return { ok: true as const };
  });

export const deleteAlumni = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as { id?: number })
  .handler(async ({ data }) => {
    const { requireDashboardAuth } = await import("@/lib/auth-helpers");
    await requireDashboardAuth();
    const pool = await getPool();
    await pool.query("DELETE FROM alumni_list WHERE id = ?", [data?.id]);
    return { ok: true as const };
  });

export const addSantri = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as { name?: string; kelas?: string; angkatan?: string; waliName?: string; username?: string; password?: string })
  .handler(async ({ data }) => {
    const { requireDashboardAuth } = await import("@/lib/auth-helpers");
    await requireDashboardAuth();
    const name = (data?.name ?? "").trim();
    if (!name) throw new Error("Nama santri wajib diisi.");
    const username = (data?.username ?? "").trim().toLowerCase();
    const password = data?.password ?? "";
    let userId: number | null = null;
    if (username || password) {
      if (!/^[a-z0-9._-]{3,60}$/.test(username))
        throw new Error("Username santri 3–60 karakter, hanya huruf kecil, angka, titik, garis.");
      if (password.length < 4) throw new Error("Sandi santri minimal 4 karakter.");
      const pool = await getPool();
      try {
        const [res] = await pool.query(
          "INSERT INTO users (name, username, password_hash, role) VALUES (?, ?, ?, 'santri')",
          [name, username, await encodePassword(password)],
        );
        userId = (res as unknown as { insertId: number }).insertId;
      } catch (e) {
        if ((e as { code?: string })?.code === "ER_DUP_ENTRY") throw new Error("Username sudah dipakai.");
        throw new Error(dbErrorMessage(e));
      }
    }
    const pool = await getPool();
    await pool.query(
      "INSERT INTO santri_list (name, kelas, angkatan, wali_name, user_id) VALUES (?, ?, ?, ?, ?)",
      [name, (data?.kelas ?? "").trim(), (data?.angkatan ?? "").trim(), (data?.waliName ?? "").trim(), userId],
    );
    return { ok: true as const };
  });

export const deleteSantri = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as { id?: number })
  .handler(async ({ data }) => {
    const { requireDashboardAuth } = await import("@/lib/auth-helpers");
    await requireDashboardAuth();
    const pool = await getPool();
    await pool.query("DELETE FROM santri_list WHERE id = ?", [data?.id]);
    return { ok: true as const };
  });

export const adminListSantri = createServerFn({ method: "GET" }).handler(async (): Promise<SantriItem[]> => {
  const { requireDashboardAuth } = await import("@/lib/auth-helpers");
  await requireDashboardAuth();
  const pool = await getPool();
  const [rows] = await pool.query(
    "SELECT s.id, s.name, s.kelas, s.angkatan, s.wali_name, u.username FROM santri_list s LEFT JOIN users u ON u.id = s.user_id ORDER BY s.name ASC",
  );
  return (rows as unknown as Array<{ id: number; name: string; kelas: string; angkatan: string; wali_name: string; username: string | null }>).map((r) => ({
    id: r.id,
    name: r.name,
    kelas: r.kelas ?? "",
    angkatan: r.angkatan ?? "",
    waliName: r.wali_name ?? "",
    username: r.username ?? null,
  }));
});

export const adminListAlumni = createServerFn({ method: "GET" }).handler(async (): Promise<AlumniItem[]> => {
  const { requireDashboardAuth } = await import("@/lib/auth-helpers");
  await requireDashboardAuth();
  const pool = await getPool();
  const [rows] = await pool.query("SELECT id, name, angkatan, now_status FROM alumni_list ORDER BY angkatan DESC, name ASC");
  return (rows as unknown as Array<{ id: number; name: string; angkatan: string; now_status: string }>).map((r) => ({
    id: r.id,
    name: r.name,
    angkatan: r.angkatan ?? "",
    nowStatus: r.now_status ?? "",
  }));
});

export const listAllBills = createServerFn({ method: "GET" }).handler(async (): Promise<BillItem[]> => {
  const { requireDashboardAuth } = await import("@/lib/auth-helpers");
  await requireDashboardAuth();
  const pool = await getPool();
  const [rows] = await pool.query(
    `SELECT b.id, b.user_id, b.title, b.amount, b.due_date, b.status, b.proof_url, b.paid_at, u.name AS member_name
     FROM bills b LEFT JOIN users u ON u.id = b.user_id
     ORDER BY b.status = 'menunggu' DESC, b.id DESC`,
  );
  return (rows as unknown as Array<Record<string, unknown>>).map((r) => ({
    id: Number(r.id),
    userId: Number(r.user_id),
    memberName: String(r.member_name ?? "—"),
    title: String(r.title ?? ""),
    amount: Number(r.amount ?? 0),
    dueDate: String(r.due_date ?? ""),
    status: (r.status as BillStatus) ?? "belum",
    proofUrl: (r.proof_url as string | null) ?? null,
    paidAt: (r.paid_at as string | null) ?? null,
  }));
});

export const createBill = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as { userId?: number; title?: string; amount?: number; dueDate?: string })
  .handler(async ({ data }) => {
    const { requireDashboardAuth } = await import("@/lib/auth-helpers");
    await requireDashboardAuth();
    const userId = Number(data?.userId ?? 0);
    const title = (data?.title ?? "").trim();
    const amount = Math.round(Number(data?.amount ?? 0));
    if (!userId) throw new Error("Pilih akun santri.");
    if (!title) throw new Error("Judul tagihan wajib diisi.");
    if (!Number.isFinite(amount) || amount <= 0) throw new Error("Jumlah harus lebih dari 0.");
    const pool = await getPool();
    const [targetRows] = await pool.query("SELECT role FROM users WHERE id = ? LIMIT 1", [userId]);
    const targetRole = (targetRows as unknown as Array<{ role: string }>)[0]?.role;
    if (targetRole !== "santri") throw new Error("Tagihan hanya bisa dibuat untuk akun santri.");
    await pool.query("INSERT INTO bills (user_id, title, amount, due_date) VALUES (?, ?, ?, ?)", [
      userId,
      title,
      amount,
      (data?.dueDate ?? "").trim(),
    ]);
    return { ok: true as const };
  });

export const deleteBill = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as { id?: number })
  .handler(async ({ data }) => {
    const { requireDashboardAuth } = await import("@/lib/auth-helpers");
    await requireDashboardAuth();
    const pool = await getPool();
    await pool.query("DELETE FROM bills WHERE id = ?", [data?.id]);
    return { ok: true as const };
  });

/** Verifikasi bukti transfer: setujui (lunas) atau tolak (kembali ke "belum"). */
export const decideBill = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as { id?: number; decision?: "lunas" | "belum" })
  .handler(async ({ data }) => {
    const { requireDashboardAuth } = await import("@/lib/auth-helpers");
    await requireDashboardAuth();
    const decision = data?.decision === "lunas" ? "lunas" : "belum";
    const pool = await getPool();
    if (decision === "lunas") {
      await pool.query("UPDATE bills SET status = 'lunas', paid_at = CURRENT_TIMESTAMP WHERE id = ?", [data?.id]);
    } else {
      await pool.query("UPDATE bills SET status = 'belum', proof_url = NULL, paid_at = NULL WHERE id = ?", [
        data?.id,
      ]);
    }
    return { ok: true as const };
  });
