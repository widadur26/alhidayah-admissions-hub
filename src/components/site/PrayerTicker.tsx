import { useEffect, useState } from "react";
import { CalendarDays, Clock, MoonStar } from "lucide-react";

import { cn } from "@/lib/utils";

/** Jadwal cadangan (estimasi) bila layanan jadwal sholat tidak dapat diakses. */
const FALLBACK: [string, string][] = [
  ["Subuh", "04:26"],
  ["Duha", "08:03"],
  ["Dzuhur", "11:44"],
  ["Ashar", "15:07"],
  ["Maghrib", "17:53"],
  ["Isya", "19:03"],
];

const DAYS = ["Ahad", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function dateLabel(d: Date) {
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function toMinutes(hhmm: string) {
  const [h = 0, m = 0] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

type Timings = [string, string][];

export function PrayerTicker({ className }: { className?: string | undefined }) {
  const [now, setNow] = useState<Date | null>(null);
  const [times, setTimes] = useState<Timings>(FALLBACK);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    let alive = true;
    fetch("https://api.aladhan.com/v1/timingsByCity?city=Cilacap&country=Indonesia&method=20")
      .then((res) => res.json())
      .then((json: { data?: { timings?: Record<string, string> } }) => {
        if (!alive) return;
        const t = json?.data?.timings;
        const fajr = t?.["Fajr"];
        const sunrise = t?.["Sunrise"];
        const dhuhr = t?.["Dhuhr"];
        const asr = t?.["Asr"];
        const maghrib = t?.["Maghrib"];
        const isha = t?.["Isha"];
        if (!fajr || !sunrise || !dhuhr || !asr || !maghrib || !isha) return;
        const clean = (v: string) => v.slice(0, 5);
        setTimes([
          ["Subuh", clean(fajr)],
          ["Duha", clean(sunrise)],
          ["Dzuhur", clean(dhuhr)],
          ["Ashar", clean(asr)],
          ["Maghrib", clean(maghrib)],
          ["Isya", clean(isha)],
        ]);
        setIsLive(true);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  // Nama sholat berikutnya (untuk ditandai emas di ticker)
  const nowStr = now
    ? now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })
    : "--:--:--";
  let nextName: string | null = null;
  if (now && isLive) {
    const mins = now.getHours() * 60 + now.getMinutes();
    const next = times.find(([, t]) => toMinutes(t) > mins);
    nextName = (next?.[0] ?? times[0]?.[0]) ?? null;
  }

  const pieces = [
    <span key="date" className="inline-flex items-center gap-1.5">
      <CalendarDays className="h-3.5 w-3.5 text-gold" />
      {now ? dateLabel(now) : "—"}
    </span>,
    <span key="clock" className="inline-flex items-center gap-1.5">
      <Clock className="h-3.5 w-3.5 text-gold" />
      Jam: <strong className="font-semibold tabular-nums text-nav-foreground">{nowStr}</strong>
    </span>,
    <span key="loc" className="inline-flex items-center gap-1.5">
      <MoonStar className="h-3.5 w-3.5 text-gold" />
      Jadwal Sholat {isLive ? "" : "(estimasi)"} Kesugihan–Cilacap:
    </span>,
    ...times.map(([name, t]) => (
      <span key={name} className="inline-flex items-baseline gap-1.5">
        {name}{" "}
        <strong
          className={cn(
            "font-semibold tabular-nums",
            name === nextName ? "text-gold" : "text-nav-foreground",
          )}
        >
          {t}
        </strong>
      </span>
    )),
    nextName && isLive ? (
      <span key="next" className="inline-flex items-baseline gap-1 text-gold">
        · sholat {nextName.toLowerCase()} tinggal sebentar lagi
      </span>
    ) : null,
  ];

  return (
    <div
      className={cn(
        "group relative overflow-hidden border-y border-nav-foreground/10 bg-nav-scrolled backdrop-blur",
        className,
      )}
      aria-label="Jam dan jadwal sholat berjalan"
    >
      <div className="ticker-fade flex overflow-hidden py-2 text-nav-foreground/90">
        <div className="flex w-max shrink-0 animate-marquee items-center gap-10 px-5 group-hover:[animation-play-state:paused]">
          {pieces}
        </div>
        <div
          aria-hidden
          className="flex w-max shrink-0 animate-marquee items-center gap-10 px-5 group-hover:[animation-play-state:paused]"
        >
          {pieces}
        </div>
      </div>
    </div>
  );
}
