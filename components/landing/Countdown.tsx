"use client";

import { useEffect, useRef, useState } from "react";
import { useT } from "@/lib/i18n/useT";
import { cn } from "@/components/ui";

/** How long the countdown stays on screen before it dissolves (ms). */
const HOLD_MS = 4000;
/** Must match the `fade-out` keyframe duration in tailwind.config.ts. */
const FADE_MS = 900;

interface Parts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/** Local-time Dec 31 23:59:59 of the current year. */
function yearEnd(now: Date): Date {
  return new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
}

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

export interface CountdownProps {
  onDone: () => void;
}

/**
 * Cinematic full-screen countdown to the end of the current year.
 * Client-only clock: renders a skeleton until mounted so SSR markup never
 * disagrees with the client. Holds ~4s, fades out, then calls onDone().
 */
export function Countdown({ onDone }: CountdownProps) {
  const { t } = useT();
  const [parts, setParts] = useState<Parts | null>(null);
  const [fading, setFading] = useState(false);
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  /* clock — starts only on the client */
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setParts(partsUntil(yearEnd(now), now));
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  /* hold → fade → done */
  useEffect(() => {
    const fadeId = window.setTimeout(() => setFading(true), HOLD_MS);
    const doneId = window.setTimeout(() => onDoneRef.current(), HOLD_MS + FADE_MS);
    return () => {
      window.clearTimeout(fadeId);
      window.clearTimeout(doneId);
    };
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
    <div
      aria-live="polite"
      className={cn(
        "fixed inset-0 z-50 flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 text-center",
        fading ? "animate-fade-out pointer-events-none" : "animate-fade-in",
      )}
      style={{ background: "var(--bg)" }}
    >
      {/* vignette + ember glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 45% at 50% 42%, color-mix(in srgb, var(--gold) 14%, transparent), transparent 70%), radial-gradient(120% 90% at 50% 50%, transparent 40%, rgba(0,0,0,0.75) 100%)",
        }}
      />

      <div className="relative flex w-full max-w-md flex-col items-center gap-8">
        <header className="animate-rise-in flex flex-col items-center gap-2">
          <p className="text-[11px] uppercase tracking-[0.35em] text-fg-faint">{t("app.name")}</p>
          <h1 className="font-display text-gild text-3xl leading-tight xs:text-4xl">{t("countdown.title")}</h1>
          <p className="text-sm text-fg-muted">{t("countdown.subtitle")}</p>
        </header>

        <div
          className="animate-rise-in grid w-full grid-cols-4 gap-2"
          style={{ animationDelay: "180ms" }}
          dir="ltr"
        >
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
          className="animate-rise-in h-px w-40"
          style={{
            animationDelay: "360ms",
            background: "linear-gradient(90deg, transparent, var(--gold), transparent)",
          }}
        />
      </div>
    </div>
  );
}
