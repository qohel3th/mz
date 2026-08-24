"use client";

import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n/useT";

interface Parts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/** Fixed target: 2027-01-01 00:00:00 local time. */
const TARGET = new Date(2027, 0, 1, 0, 0, 0, 0);

/** Clamped at zero once the target has passed. */
function partsUntil(target: Date, now: Date): Parts {
  const total = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000));
  return {
    days: Math.floor(total / 86_400),
    hours: Math.floor((total % 86_400) / 3_600),
    minutes: Math.floor((total % 3_600) / 60),
    seconds: total % 60,
  };
}

const pad2 = (n: number) => String(n).padStart(2, "0");

/**
 * Permanent landing countdown to 2027-01-01 (local).
 * Client-only clock: renders a skeleton until mounted so SSR markup never
 * disagrees with the client. In-flow block — no overlay, no fade.
 */
export function Countdown() {
  const { t } = useT();
  const [parts, setParts] = useState<Parts | null>(null);

  /* clock — starts only on the client */
  useEffect(() => {
    const tick = () => setParts(partsUntil(TARGET, new Date()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const cells: { key: keyof Parts; value: string }[] = parts
    ? [
        { key: "days", value: String(parts.days) },
        { key: "hours", value: pad2(parts.hours) },
        { key: "minutes", value: pad2(parts.minutes) },
        { key: "seconds", value: pad2(parts.seconds) },
      ]
    : [];

  return (
    <section
      aria-live="polite"
      className="relative flex w-full flex-col items-center gap-5 overflow-hidden px-6 py-8 text-center"
    >
      {/* ember glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 70% at 50% 50%, color-mix(in srgb, var(--gold) 12%, transparent), transparent 70%)",
        }}
      />

      <header className="relative flex flex-col items-center gap-1">
        <h2 className="font-display text-gild text-2xl leading-tight xs:text-3xl">{t("countdown.title")}</h2>
        <p className="text-sm text-fg-muted">{t("countdown.subtitle")}</p>
      </header>

      <div className="relative grid w-full max-w-sm grid-cols-4 gap-2" dir="ltr">
        {parts
          ? cells.map(({ key, value }) => (
              <div key={key} className="flex flex-col items-center gap-1">
                <span
                  className="font-display text-gild animate-flicker text-4xl tabular-nums leading-none xs:text-5xl"
                  style={{ textShadow: "0 0 24px color-mix(in srgb, var(--gold) 55%, transparent)" }}
                >
                  {value}
                </span>
                <span className="text-[10px] uppercase tracking-[0.25em] text-fg-faint">{t(`countdown.${key}`)}</span>
              </div>
            ))
          : Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="skeleton h-11 w-14 xs:h-12" />
                <div className="skeleton h-2.5 w-10" />
              </div>
            ))}
      </div>

      <div
        aria-hidden
        className="relative h-px w-40"
        style={{ background: "linear-gradient(90deg, transparent, var(--gold), transparent)" }}
      />
    </section>
  );
}
