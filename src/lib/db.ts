/**
 * Koneksi MySQL/MariaDB milik XAMPP untuk menyimpan konten dashboard admin.
 * - Default mengikuti pengaturan bawaan XAMPP: 127.0.0.1:3306, user "root", tanpa password.
 * - Bisa ditimpa lewat variabel lingkungan:
 *   MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE
 * - Database & tabel dibuat otomatis saat pertama kali dipakai.
 * Semua akses database hanya berjalan di server (dynamic import).
 */

const cfg = {
  host: process.env.MYSQL_HOST || "127.0.0.1",
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD ?? "",
  database: process.env.MYSQL_DATABASE || "alhidayah_admissions",
};

type Pool = {
  query: (sql: string, values?: unknown[]) => Promise<[{ constructor: Function }, unknown]>;
  getConnection: () => Promise<Connection>;
};
type Connection = {
  query: (sql: string, values?: unknown[]) => Promise<unknown>;
  beginTransaction: () => Promise<void>;
  commit: () => Promise<void>;
  rollback: () => Promise<void>;
  release: () => void;
};

let poolPromise: Promise<Pool> | null = null;

/** Ambil pool koneksi (dibuat sekali, dipakai ulang; gagal saat init boleh dicoba ulang). */
export const getPool = (): Promise<Pool> =>
  (poolPromise ??= initPool().catch((e) => {
    poolPromise = null;
    throw e;
  }));

async function initPool(): Promise<Pool> {
  const mysql = await import("mysql2/promise");
  // Pastikan database ada — koneksi awal tanpa memilih database.
  const server = await mysql.createConnection({
    host: cfg.host,
    port: cfg.port,
    user: cfg.user,
    password: cfg.password,
  });
  await server.query(
    `CREATE DATABASE IF NOT EXISTS \`${cfg.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  );
  await server.end();

  const pool = await mysql.createPool({ ...cfg, connectionLimit: 5 });
  await ensureSchema(pool as unknown as Pool);
  return pool as unknown as Pool;
}

/** Ubah error MySQL jadi pesan yang mudah dipahami pengguna dashboard. */
export const dbErrorMessage = (e: unknown): string => {
  const code = (e as { code?: string })?.code ?? "";
  if (code === "ECONNREFUSED" || code === "ER_BAD_DB_ERROR") {
    return "Tidak bisa terhubung ke MySQL — nyalakan MySQL di XAMPP Control Panel lalu coba lagi.";
  }
  if (code === "ER_ACCESS_DENIED_ERROR") {
    return "Akses MySQL ditolak — periksa MYSQL_USER / MYSQL_PASSWORD.";
  }
  return e instanceof Error ? e.message : "Terjadi kesalahan pada database.";
};

async function ensureSchema(pool: Pool): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS hero_slides (
      slot      TINYINT UNSIGNED PRIMARY KEY,
      eyebrow   VARCHAR(255) NOT NULL DEFAULT '',
      title     VARCHAR(255) NOT NULL DEFAULT '',
      body      TEXT NULL,
      image_url VARCHAR(500) NULL
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS news_items (
      id           VARCHAR(64) PRIMARY KEY,
      position     INT UNSIGNED NOT NULL DEFAULT 0,
      title        VARCHAR(255) NOT NULL DEFAULT '',
      category     VARCHAR(100) NOT NULL DEFAULT '',
      published_at VARCHAR(20)  NOT NULL DEFAULT '',
      author       VARCHAR(120) NOT NULL DEFAULT '',
      excerpt      TEXT NULL,
      image_url    VARCHAR(500) NULL
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS gallery_photos (
      slot      TINYINT UNSIGNED PRIMARY KEY,
      caption   VARCHAR(255) NOT NULL DEFAULT '',
      image_url VARCHAR(500) NULL
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS site_settings (
      name  VARCHAR(50) PRIMARY KEY,
      value TEXT NULL
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      name          VARCHAR(120) NOT NULL,
      username      VARCHAR(60) NOT NULL UNIQUE,
      password_hash VARCHAR(140) NOT NULL,
      role          ENUM('admin','wali','alumni','santri') NOT NULL DEFAULT 'wali',
      created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS alumni_list (
      id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      name       VARCHAR(120) NOT NULL,
      angkatan   VARCHAR(20) NOT NULL DEFAULT '',
      now_status VARCHAR(255) NOT NULL DEFAULT ''
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS santri_list (
      id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      name       VARCHAR(120) NOT NULL,
      kelas      VARCHAR(60) NOT NULL DEFAULT '',
      angkatan   VARCHAR(20) NOT NULL DEFAULT '',
      wali_name  VARCHAR(120) NOT NULL DEFAULT '',
      user_id    INT UNSIGNED NULL
    )
  `);
  // Peningkatan skema untuk database lama (aman diulang; gagal → diabaikan).
  await pool
    .query("ALTER TABLE users MODIFY COLUMN role ENUM('admin','wali','alumni','santri') NOT NULL DEFAULT 'wali'")
    .catch(() => {});
  await pool.query("ALTER TABLE santri_list ADD COLUMN user_id INT UNSIGNED NULL").catch(() => {});
  await pool
    .query(
      "ALTER TABLE santri_list ADD CONSTRAINT fk_santri_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL",
    )
    .catch(() => {});
  await pool.query(`
    CREATE TABLE IF NOT EXISTS bills (
      id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      user_id    INT UNSIGNED NOT NULL,
      title      VARCHAR(200) NOT NULL,
      amount     BIGINT UNSIGNED NOT NULL,
      due_date   VARCHAR(20) NOT NULL DEFAULT '',
      status     ENUM('belum','menunggu','lunas') NOT NULL DEFAULT 'belum',
      proof_url  VARCHAR(500) NULL,
      paid_at    DATETIME NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_bills_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS needs_items (
      id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      user_id    INT UNSIGNED NOT NULL,
      title      VARCHAR(200) NOT NULL,
      detail     TEXT NULL,
      status     ENUM('baru','diproses','selesai') NOT NULL DEFAULT 'baru',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_needs_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS page_gallery (
      slot      TINYINT UNSIGNED PRIMARY KEY,
      caption   VARCHAR(255) NOT NULL DEFAULT '',
      image_url VARCHAR(500) NULL
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS page_overrides (
      section VARCHAR(40) NOT NULL,
      slug    VARCHAR(60) NOT NULL,
      title   VARCHAR(200) NOT NULL DEFAULT '',
      summary VARCHAR(500) NOT NULL DEFAULT '',
      blocks  MEDIUMTEXT NULL,
      PRIMARY KEY (section, slug)
    )
  `);
  // Peningkatan skema untuk database lama (aman diulang; gagal → diabaikan).
  await pool.query("ALTER TABLE site_settings MODIFY COLUMN value TEXT NULL").catch(() => {});
  await seedStarterData(pool);
}

/** Data contoh pertama kali (hanya diisi bila tabel masih kosong — bisa dihapus lewat dashboard). */
async function seedStarterData(pool: Pool): Promise<void> {
  const { encodePassword } = await import("@/lib/hash");
  const [userRows] = await pool.query("SELECT COUNT(*) AS n FROM users");
  if (Number((userRows as unknown as Array<{ n: number }>)[0]?.n ?? 0) === 0) {
    await pool.query("INSERT INTO users (name, username, password_hash, role) VALUES (?, ?, ?, ?)", [
      "Admin Pondok",
      "admin",
      await encodePassword("admin123"),
      "admin",
    ]);
    await pool.query("INSERT INTO users (name, username, password_hash, role) VALUES (?, ?, ?, ?)", [
      "Wali Santri Contoh",
      "wali01",
      await encodePassword("wali123"),
      "wali",
    ]);
    await pool.query("INSERT INTO users (name, username, password_hash, role) VALUES (?, ?, ?, ?)", [
      "Alumni Contoh",
      "alumni01",
      await encodePassword("alumni123"),
      "alumni",
    ]);
    // Tagihan contoh untuk wali & alumni
    const [waliRow] = await pool.query("SELECT id FROM users WHERE username = 'wali01' LIMIT 1");
    const [alumniRow] = await pool.query("SELECT id FROM users WHERE username = 'alumni01' LIMIT 1");
    const waliId = (waliRow as unknown as Array<{ id: number }>)[0]?.id;
    const alumniId = (alumniRow as unknown as Array<{ id: number }>)[0]?.id;
    if (waliId) {
      await pool.query(
        "INSERT INTO bills (user_id, title, amount, due_date) VALUES (?, ?, ?, ?)",
        [waliId, "SPP Bulan November 2026", 350000, "2026-11-25"],
      );
    }
    if (alumniId) {
      await pool.query(
        "INSERT INTO bills (user_id, title, amount, due_date) VALUES (?, ?, ?, ?)",
        [alumniId, "Iuran Pengembangan Alumni 2026", 100000, "2026-12-15"],
      );
    }
  }
  const [alumniRows] = await pool.query("SELECT COUNT(*) AS n FROM alumni_list");
  if (Number((alumniRows as unknown as Array<{ n: number }>)[0]?.n ?? 0) === 0) {
    await pool.query(
      "INSERT INTO alumni_list (name, angkatan, now_status) VALUES (?, ?, ?), (?, ?, ?), (?, ?, ?)",
      ["Ahmad Fauzi", "2019", "Kuliah UIN Yogyakarta", "Siti Maryam", "2020", "Guru MTs di Cilacap", "Muhammad Rifqi", "2021", "Mahasiswa Kedokteran"],
    );
  }
  const [santriRows] = await pool.query("SELECT COUNT(*) AS n FROM santri_list");
  if (Number((santriRows as unknown as Array<{ n: number }>)[0]?.n ?? 0) === 0) {
    await pool.query(
      "INSERT INTO santri_list (name, kelas, angkatan, wali_name) VALUES (?, ?, ?, ?), (?, ?, ?, ?), (?, ?, ?, ?)",
      ["Abdul Hakim", "MTs 2A", "2026", "Bpk. Sutrisno", "Nur Aisyah", "MTs 1B", "2026", "Bpk. Rahmat", "Zaid Alifi", "MA 3A", "2024", "Bpk. Hamid"],
    );
  }
  // Akun santri contoh (idempoten): santri01 / santri123 tertaut ke profil "Abdul Hakim" + tagihan contoh.
  const [santriUserRows] = await pool.query("SELECT id FROM users WHERE username = 'santri01' LIMIT 1");
  if ((santriUserRows as unknown as Array<{ id: number }>).length === 0) {
    const [hakimRows] = await pool.query("SELECT id FROM santri_list WHERE name = 'Abdul Hakim' LIMIT 1");
    const hakimId = (hakimRows as unknown as Array<{ id: number }>)[0]?.id;
    if (hakimId) {
      const [res] = await pool.query(
        "INSERT INTO users (name, username, password_hash, role) VALUES (?, ?, ?, 'santri')",
        ["Abdul Hakim", "santri01", await encodePassword("santri123")],
      );
      const santriUserId = (res as unknown as { insertId: number }).insertId;
      await pool.query("UPDATE santri_list SET user_id = ? WHERE id = ? AND user_id IS NULL", [santriUserId, hakimId]);
      await pool.query("INSERT INTO bills (user_id, title, amount, due_date) VALUES (?, ?, ?, ?)", [
        santriUserId,
        "SPP Bulan November 2026",
        350000,
        "2026-11-25",
      ]);
    }
  }
}
