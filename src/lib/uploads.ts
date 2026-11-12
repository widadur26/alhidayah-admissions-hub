/**
 * Simpan berkas gambar (data URL base64) ke folder public/uploads → dilayani sebagai /uploads/<nama>.
 * Dipakai bersama oleh unggahan dashboard dan unggahan bukti pembayaran.
 * Hanya berjalan di server (dynamic import).
 */

export const saveUploadFile = async (name: string, dataUrl: string): Promise<string> => {
  const match = /^data:(image\/(?:png|jpe?g|webp|avif));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl ?? "");
  if (!match) throw new Error("Berkas harus berupa gambar (JPG, PNG, WebP, atau AVIF).");
  const mime = match[1] ?? "";
  const base64 = match[2] ?? "";
  if (base64.length > 14_500_000) throw new Error("Ukuran gambar terlalu besar (maksimal 10 MB).");
  const ext =
    mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : mime === "image/avif" ? "avif" : "jpg";
  const base =
    (name ?? "gambar")
      .replace(/\.[a-z0-9]+$/i, "")
      .replace(/[^a-z0-9-]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase() || "gambar";
  const { writeFile, mkdir } = await import("node:fs/promises");
  const path = await import("node:path");
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const filename = `${Date.now()}-${base}.${ext}`;
  await writeFile(path.join(dir, filename), Buffer.from(base64, "base64"));
  return `/uploads/${filename}`;
};
