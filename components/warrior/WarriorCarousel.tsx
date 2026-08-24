"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import type { ThemeId, Warrior } from "@/lib/domain/types";
import { useStore, useWarriors, useXpEvents } from "@/lib/store";
import { useT } from "@/lib/i18n/useT";
import { Button, UserText, cn } from "@/components/ui";

/** Each warrior glows in its own family colour — never the page accent. */
const FAMILY_COLOR: Record<ThemeId, string> = {
  ember: "var(--red)",
  arcane: "var(--purple)",
  gilded: "var(--gold)",
};
const FAMILY_COLOR_BRIGHT: Record<ThemeId, string> = {
  ember: "var(--red-2)",
  arcane: "var(--purple-2)",
  gilded: "var(--gold-2)",
};

const MAX_LEVEL = 33;
/** Simple placeholder curve; the real progression lives in the game layer. */
export const levelFromXp = (xp: number) => Math.min(MAX_LEVEL, 1 + Math.floor(Math.max(0, xp) / 100));

function WarriorCard({
  warrior,
  active,
  onSelect,
}: {
  warrior: Warrior;
  active: boolean;
  onSelect: (w: Warrior) => void;
}) {
  const { t } = useT();
  const events = useXpEvents(warrior.id);
  const xp = events.reduce((sum, e) => sum + e.amount, 0);
  const level = levelFromXp(xp);
  const color = FAMILY_COLOR[warrior.theme] ?? FAMILY_COLOR.arcane;
  const bright = FAMILY_COLOR_BRIGHT[warrior.theme] ?? FAMILY_COLOR_BRIGHT.arcane;
  const archetypeKey = `warriors.archetypes.${warrior.archetype}`;
  const archetypeLabel = t(archetypeKey);

  return (
    <article
      className={cn(
        "snap-child panel rivets relative flex w-[80vw] max-w-[340px] shrink-0 flex-col items-center gap-4 px-5 pb-5 pt-7 text-center transition-shadow duration-500",
      )}
      style={
        {
          "--family": color,
          "--family-2": bright,
          borderColor: active ? "color-mix(in srgb, var(--family) 70%, transparent)" : undefined,
          boxShadow: active
            ? "0 0 0 1px color-mix(in srgb, var(--family) 45%, transparent), 0 20px 50px -20px var(--family)"
            : "0 20px 40px -28px rgba(0,0,0,0.9)",
          background:
            "linear-gradient(170deg, color-mix(in srgb, var(--family) 16%, transparent), transparent 55%), var(--panel)",
        } as CSSProperties
      }
      aria-current={active ? "true" : undefined}
    >
      {/* sigil in a glowing ring */}
      <div
        className={cn("flex h-24 w-24 items-center justify-center rounded-full text-5xl", active && "animate-flicker")}
        style={{
          background: "radial-gradient(circle, color-mix(in srgb, var(--family) 35%, transparent), transparent 70%)",
          boxShadow:
            "0 0 0 2px color-mix(in srgb, var(--family-2) 70%, transparent), 0 0 32px color-mix(in srgb, var(--family) 55%, transparent)",
        }}
        aria-hidden
      >
        <span className="drop-shadow-[0_0_12px_var(--family-2)]">{warrior.sigil}</span>
      </div>

      <div className="flex flex-col items-center gap-1">
        <UserText as="h2" text={warrior.name} className="font-display text-2xl leading-tight text-fg" />
        <UserText as="p" text={warrior.epithet} className="text-sm italic text-fg-muted" />
        <span
          className="mt-1 rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-[0.25em]"
          style={{ borderColor: "color-mix(in srgb, var(--family-2) 60%, transparent)", color: bright }}
        >
          {archetypeLabel === archetypeKey ? <UserText text={warrior.archetype} /> : archetypeLabel}
        </span>
      </div>

      <dl className="grid w-full grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-bg-2/60 px-1 py-2">
          <dt className="text-[10px] uppercase tracking-widest text-fg-faint">{t("warriors.levelLabel")}</dt>
          <dd className="font-display text-lg tabular-nums" style={{ color: bright }}>
            {level}
          </dd>
        </div>
        <div className="rounded-xl bg-bg-2/60 px-1 py-2">
          <dt className="text-[10px] uppercase tracking-widest text-fg-faint">{t("warriors.xpLabel")}</dt>
          <dd className="font-display text-lg tabular-nums text-fg">{xp}</dd>
        </div>
        <div className="rounded-xl bg-bg-2/60 px-1 py-2">
          <dt className="text-[10px] uppercase tracking-widest text-fg-faint">{t("warriors.streakLabel")}</dt>
          <dd className="font-display text-lg tabular-nums text-fg">{warrior.streak.current}</dd>
        </div>
      </dl>
      <p className="-mt-2 text-xs text-fg-faint">{t("warriors.level", { level })}</p>

      <Button
        variant="primary"
        block
        onClick={() => onSelect(warrior)}
        className="hover:brightness-110"
        style={{ background: color, color: warrior.theme === "gilded" ? "var(--bg-2)" : "#fff", boxShadow: `0 8px 24px -10px ${color}` }}
        aria-pressed={active}
      >
        {active ? t("warriors.selected") : t("warriors.select")}
      </Button>
    </article>
  );
}

/**
 * Horizontal, swipeable warrior picker (CSS scroll-snap, RTL-safe).
 * Selecting a warrior makes it active and routes to /dashboard or /onboarding.
 */
export function WarriorCarousel() {
  const { t } = useT();
  const router = useRouter();
  const warriors = useWarriors();
  const { state, actions } = useStore();
  const activeId = state.settings.activeWarriorId;
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  /* nearest card to the viewport centre — works for negative (RTL) scrollLeft too */
  const syncIndex = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const center = Math.abs(el.scrollLeft) + el.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    Array.from(el.children).forEach((child, i) => {
      const c = child as HTMLElement;
      const childCenter = Math.abs(c.offsetLeft) + c.offsetWidth / 2;
      const d = Math.abs(childCenter - center);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    setIndex(best);
  }, []);

  useEffect(() => {
    syncIndex();
  }, [syncIndex, warriors.length]);

  const scrollTo = (i: number) => {
    const child = scrollerRef.current?.children[i] as HTMLElement | undefined;
    child?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  const onboardingMap = state.onboarding;
  const select = async (w: Warrior) => {
    await actions.setActiveWarrior(w.id);
    const done = Boolean(onboardingMap[w.id]?.completedAt);
    router.push(done ? "/dashboard" : "/onboarding");
  };

  return (
    <section className="flex w-full flex-col items-center gap-4" aria-label={t("warriors.choose")}>
      <div
        ref={scrollerRef}
        onScroll={syncIndex}
        className="snap-x-mandatory flex w-full gap-4 overflow-x-auto px-[10vw] py-3"
        style={{ scrollPaddingInline: "10vw" }}
      >
        {warriors.map((w) => (
          <WarriorCard key={w.id} warrior={w} active={w.id === activeId} onSelect={select} />
        ))}
      </div>

      {warriors.length > 1 && (
        <div className="flex items-center gap-2" role="tablist" aria-label={t("warriors.pagination")}>
          {warriors.map((w, i) => (
            <button
              key={w.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={t("warriors.goTo", { index: i + 1 })}
              onClick={() => scrollTo(i)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                i === index ? "w-6" : "w-2 bg-fg-faint/50 hover:bg-fg-faint",
              )}
              style={i === index ? { background: FAMILY_COLOR_BRIGHT[w.theme] ?? "var(--gold-2)" } : undefined}
            />
          ))}
        </div>
      )}
    </section>
  );
}
