/**
 * Simpan gambar ke Vercel Blob saat deploy dan ke public/uploads saat lokal.
 * Hanya berjalan di server.
 */

export const saveUploadFile = async (name: string, dataUrl: string): Promise<string> => {
  const match = /^data:(image\/(?:png|jpe?g|webp|avif));base64,([A-Za-z0-9+/=]+)$/.exec(
    dataUrl ?? "",
  );
  if (!match) throw new Error("Berkas harus berupa gambar (JPG, PNG, WebP, atau AVIF).");
  const mime = match[1] ?? "";
  const base64 = match[2] ?? "";
  if (base64.length > 14_500_000) throw new Error("Ukuran gambar terlalu besar (maksimal 10 MB).");
  const ext =
    mime === "image/png"
      ? "png"
      : mime === "image/webp"
        ? "webp"
        : mime === "image/avif"
          ? "avif"
          : "jpg";
  const base =
    (name ?? "gambar")
      .replace(/\.[a-z0-9]+$/i, "")
      .replace(/[^a-z0-9-]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase() || "gambar";
  const filename = `${Date.now()}-${base}.${ext}`;
  const file = Buffer.from(base64, "base64");
  if (process.env.VERCEL === "1" || process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`uploads/${filename}`, file, {
      access: "public",
      contentType: mime,
      addRandomSuffix: true,
    });
    return blob.url;
  }

  const { writeFile, mkdir } = await import("node:fs/promises");
  const path = await import("node:path");
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), file);
  return `/uploads/${filename}`;
};
