/**
 * Hash password untuk akun (admin/wali/alumni) — SHA-256 dengan salt acak per akun.
 * Format tersimpan: "<salt>$<hash-hex>". Hanya berjalan di server (dynamic import).
 */

const loadCrypto = () => import("node:crypto");

export const encodePassword = async (password: string): Promise<string> => {
  const { randomBytes, createHash } = await loadCrypto();
  const salt = randomBytes(8).toString("hex");
  const hash = createHash("sha256").update(`${salt}:${password}`).digest("hex");
  return `${salt}$${hash}`;
};

export const verifyPassword = async (password: string, stored: string): Promise<boolean> => {
  const [salt, hash] = stored.split("$");
  if (!salt || !hash) return false;
  const { createHash, timingSafeEqual } = await loadCrypto();
  const expected = createHash("sha256").update(`${salt}:${password}`).digest("hex");
  return hash.length === expected.length && timingSafeEqual(Buffer.from(hash), Buffer.from(expected));
};
