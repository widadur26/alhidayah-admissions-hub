import { describe, expect, it } from "vitest";

import { DEFAULT_LISTS, normalizeLists } from "./site-settings";
import { normalizeBlocks, blocksToEditable, iconFromName, nameFromIcon, iconNames } from "./block-icons";
import { normalizeSettings, DEFAULT_SETTINGS } from "./site-settings";

describe("normalizeSettings", () => {
  it("fallback ke bawaan saat kosong", () => {
    const s = normalizeSettings({});
    expect(s.brandTitle).toBe(DEFAULT_SETTINGS.brandTitle);
    expect(s.whatsapp).toBe(DEFAULT_SETTINGS.whatsapp);
    expect(s.socials.length).toBeGreaterThan(0);
  });

  it("mengambil nilai dari database", () => {
    const s = normalizeSettings({ brandTitle: "UjiBrand", whatsapp: "628999" });
    expect(s.brandTitle).toBe("UjiBrand");
    expect(s.whatsapp).toBe("628999");
    expect(s.name).toBe(DEFAULT_SETTINGS.name);
  });
});

describe("normalizeLists", () => {
  it("fallback ke bawaan saat kosong", () => {
    const l = normalizeLists({});
    expect(l.stats.length).toBe(3);
    expect(l.programs.length).toBe(4);
    expect(l.agenda.length).toBe(DEFAULT_LISTS.agenda.length);
    expect(l.psb.waves.length).toBeGreaterThan(0);
  });

  it("mengambil nilai PSB & agenda dari database", () => {
    const l = normalizeLists({
      psb: { year: "2028/2029", quota: "99 uji", waves: [{ name: "Gelombang Uji", period: "1 Des", test: "10 Mar" }] },
      agenda: [{ date: "2026-12-01", title: "Agenda Uji", place: "Tempat", time: "09.00" }],
      partners: ["Mitra Uji"],
    });
    expect(l.psb.year).toBe("2028/2029");
    expect(l.psb.waves[0]?.name).toBe("Gelombang Uji");
    expect(l.agenda[0]?.title).toBe("Agenda Uji");
    expect(l.partners).toEqual(["Mitra Uji"]);
    // daftar yang tidak dikirim → bawaan
    expect(l.notices.length).toBe(DEFAULT_LISTS.notices.length);
  });
});

describe("blok ikon", () => {
  it("mengubah nama ikon jadi komponen dan sebaliknya", () => {
    const blocks = [{ type: "features", items: [{ icon: "trophy", title: "Uji", text: "Teks" }] }];
    const normalized = normalizeBlocks(blocks);
    const icon = (normalized[0] as { items: { icon: unknown }[] }).items[0]!.icon;
    expect(typeof icon).not.toBe("string"); // sudah jadi komponen Lucide
    const editable = blocksToEditable(normalized);
    expect((editable[0] as { items: { icon: string }[] }).items[0]!.icon).toBe("trophy");
    expect(iconFromName("tidak-ada")).toBe(iconFromName("book-open"));
    expect(nameFromIcon(iconFromName("trophy"))).toBe("trophy");
    expect(iconNames().length).toBeGreaterThan(10);
  });
});
