"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { ThemeId, Warrior } from "@/lib/domain/types";
import { useStore, useWarriors, useXpEvents } from "@/lib/store";
import { useT } from "@/lib/i18n/useT";
import { UserText, cn } from "@/components/ui";
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
  focused,
  onSelect,
}: {
  warrior: Warrior;
  active: boolean;
  focused: boolean;
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
      className={cn(
        "hero-card snap-child relative my-3 h-[min(24rem,53dvh)] w-[76vw] max-w-[320px] shrink-0 overflow-hidden",
        focused ? "hero-card-focused" : "hero-card-idle",
        active && "hero-card-active",
      )}
      style={{ "--family": color, "--family-2": bright } as CSSProperties}
      aria-current={active ? "true" : undefined}
    >
      {/* portrait, full bleed */}
      {portrait ? (
        <Image src={portrait} alt="" fill sizes="320px" loading="eager" className="object-cover object-top" />
      ) : (
        <div className="absolute inset-0 grid place-items-center text-7xl">{warrior.sigil}</div>
      )}
      {/* fade into the base + family tint */}
      <div aria-hidden className="hero-card-veil absolute inset-0" />
      {/* gilded inner frame with corner marks */}
      <div aria-hidden className="hero-card-frame absolute inset-2 rounded-xl" />

      {/* level crest */}
      <div className="hero-crest absolute start-4 top-4 grid h-10 w-10 place-items-center font-display text-base tabular-nums">
        {level}
      </div>

      {/* content anchored to the bottom */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 px-4 pb-4 text-center">
        <UserText as="h2" text={warrior.name} className="hero-name font-display text-3xl leading-none" />
        <span
          className="font-display text-[11px] uppercase tracking-[0.3em]"
          style={{ color: bright, textShadow: "0 0 12px color-mix(in srgb, var(--family) 70%, transparent)" }}
        >
          {levelTitle(level)}
        </span>

        <dl className="hero-stats grid w-full grid-cols-3 text-center">
          {[
            { k: t("warriors.levelLabel"), v: level },
            { k: t("warriors.xpLabel"), v: xp },
            { k: t("warriors.streakLabel"), v: warrior.streak.current },
          ].map(({ k, v }) => (
            <div key={k} className="flex flex-col py-1.5">
              <dt className="text-[9px] uppercase tracking-[0.2em] text-fg-faint">{k}</dt>
              <dd className="font-display text-lg leading-tight tabular-nums text-fg">{v}</dd>
            </div>
          ))}
        </dl>

        <button
          type="button"
          onClick={() => onSelect(warrior)}
          className={cn("hero-btn font-display", active && "hero-btn-active")}
          aria-pressed={active}
        >
          {active ? t("warriors.selected") : t("warriors.select")}
        </button>
      </div>
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

  /* live theme preview: the focused card's family colours drive the page accent */
  useEffect(() => {
    const focusedWarrior = warriors[index];
    if (focusedWarrior) document.documentElement.dataset.theme = focusedWarrior.theme;
  }, [index, warriors]);

  const scrollTo = (i: number) => {
    const child = scrollerRef.current?.children[i] as HTMLElement | undefined;
    child?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  /* selection always lands on the dashboard; it shows an identity nudge if onboarding is unfinished */
  const select = async (w: Warrior) => {
    await actions.setActiveWarrior(w.id);
    router.push("/dashboard");
  };

  return (
    <section className="flex w-full flex-col items-center gap-2" aria-label={t("warriors.choose")}>
      <div
        ref={scrollerRef}
        onScroll={syncIndex}
        className="snap-x-mandatory flex w-full gap-7 overflow-x-auto px-[12vw] py-2"
        style={{ scrollPaddingInline: "12vw" }}
      >
        {warriors.map((w, i) => (
          <WarriorCard key={w.id} warrior={w} active={w.id === activeId} focused={i === index} onSelect={select} />
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
