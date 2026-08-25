"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { ThemeId, Warrior } from "@/lib/domain/types";
import { useStore, useWarriors, useXpEvents } from "@/lib/store";
import { useT } from "@/lib/i18n/useT";
import { Button, UserText, cn } from "@/components/ui";
import { levelFor, levelTitle } from "@/lib/game/progression";
import { PORTRAITS } from "./portraits";

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
  const level = levelFor(xp).level;
  const color = FAMILY_COLOR[warrior.theme] ?? FAMILY_COLOR.arcane;
  const bright = FAMILY_COLOR_BRIGHT[warrior.theme] ?? FAMILY_COLOR_BRIGHT.arcane;

  const portrait = PORTRAITS[warrior.id];

  return (
    <article
      className="snap-child relative my-3 w-[78vw] max-w-[320px] shrink-0"
      style={{ "--family": color, "--family-2": bright } as CSSProperties}
      aria-current={active ? "true" : undefined}
    >
      {/* top scroll rod */}
      <div aria-hidden className="scroll-rod -top-2.5" />

      {/* parchment body */}
      <div
        className={cn("scroll-parchment relative flex flex-col items-center gap-2 px-4 pb-4 pt-5 text-center", active && "scroll-parchment-active")}
      >
        {/* portrait in a gilded frame */}
        <div className="scroll-frame relative h-32 w-[6.4rem] overflow-hidden">
          {portrait ? (
            <Image
              src={portrait}
              alt=""
              fill
              sizes="120px"
              priority={active}
              className="object-cover"
            />
          ) : (
            <span className="grid h-full w-full place-items-center text-5xl">{warrior.sigil}</span>
          )}
        </div>

        <UserText as="h2" text={warrior.name} className="scroll-ink font-display text-2xl leading-none" />

        {/* rank ribbon in the warrior's family colour */}
        <span
          className="scroll-ribbon font-display text-[11px] uppercase tracking-[0.25em]"
          style={{ background: "var(--family)" }}
        >
          {levelTitle(level)}
        </span>

        <dl className="grid w-full grid-cols-3 gap-1.5 text-center">
          {[
            { k: t("warriors.levelLabel"), v: level },
            { k: t("warriors.xpLabel"), v: xp },
            { k: t("warriors.streakLabel"), v: warrior.streak.current },
          ].map(({ k, v }) => (
            <div key={k} className="scroll-stat">
              <dt className="text-[9px] uppercase tracking-[0.2em] opacity-70">{k}</dt>
              <dd className="font-display text-lg leading-tight tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>

        <Button
          variant="primary"
          block
          size="sm"
          onClick={() => onSelect(warrior)}
          className="mt-1 hover:brightness-110"
          style={{
            background: color,
            color: warrior.theme === "gilded" ? "var(--bg-2)" : "#fff",
            boxShadow: `0 6px 18px -8px ${color}`,
          }}
          aria-pressed={active}
        >
          {active ? t("warriors.selected") : t("warriors.select")}
        </Button>
      </div>

      {/* bottom scroll rod */}
      <div aria-hidden className="scroll-rod -bottom-2.5" />
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
    <section className="flex w-full flex-col items-center gap-2" aria-label={t("warriors.choose")}>
      <div
        ref={scrollerRef}
        onScroll={syncIndex}
        className="snap-x-mandatory flex w-full gap-4 overflow-x-auto px-[10vw] py-2"
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
