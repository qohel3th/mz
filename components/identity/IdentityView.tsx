"use client";

import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { useActiveWarrior, useHydrated } from "@/lib/store";
import { useT } from "@/lib/i18n/useT";
import { personasFor, PILLARS } from "@/lib/identity/personas";
import { NoWarriorCard } from "@/components/onboarding/NoWarriorCard";
import { PersonaTicket } from "./PersonaTicket";

/** header 3.5rem + 1px border, main pt-4 (1rem), nav pad 5rem (+ safe-bottom), per AppShell. */
const WRAPPER = "relative flex h-[calc(100dvh-3.5rem-1px-1rem-5rem-var(--safe-bottom))] flex-col items-center justify-center gap-6 overflow-hidden";

const SWIPE_PX = 40;
const wrap = (i: number, n: number) => ((i % n) + n) % n;

/** Three handwriting creed lines + a swipeable overlapping Soul/Body/Mind card stack. One screen, no scroll. */
export function IdentityView() {
  const { t } = useT();
  const hydrated = useHydrated();
  const warrior = useActiveWarrior();
  const [active, setActive] = useState(1); // Body in the middle, on top
  const downX = useRef<number | null>(null);
  const swiped = useRef(false); // a drag ends with a synthetic click — swallow it so it doesn't re-select a side card

  if (!hydrated) {
    return (
      <div className={WRAPPER} aria-busy>
        <div className="skeleton h-24 w-48" />
        <div className="persona-ticket skeleton" />
      </div>
    );
  }
  if (!warrior) return <NoWarriorCard />;

  const personas = personasFor(warrior.id);
  const n = personas.length;
  const step = (dir: 1 | -1) => setActive((a) => wrap(a + dir, n));

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    downX.current = e.clientX;
  };
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (downX.current === null) return;
    let dx = e.clientX - downX.current;
    downX.current = null;
    if (Math.abs(dx) <= SWIPE_PX) return;
    if (document.dir === "rtl") dx = -dx;
    swiped.current = true;
    step(dx < 0 ? 1 : -1); // swipe left → next card
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const rtl = document.dir === "rtl";
    if (e.key === "ArrowRight") step(rtl ? -1 : 1);
    else if (e.key === "ArrowLeft") step(rtl ? 1 : -1);
    else return;
    e.preventDefault();
  };

  return (
    <div className={WRAPPER}>
      {/* creed sits high, out of flow, so the card stack keeps its centred position */}
      <div className="absolute inset-x-0 top-6 flex flex-col items-center gap-1.5 text-center">
        {(["creedSoul", "creedBody", "creedMind"] as const).map((k) => (
          <p key={k} className="font-script text-5xl leading-tight text-gold drop-shadow-[0_0_10px_rgba(138,106,31,0.35)]">
            {t(`identity.${k}`)}
          </p>
        ))}
      </div>
      <div aria-hidden className="h-32" />

      <div
        role="group"
        aria-roledescription="carousel"
        aria-label={t(`identity.pillars.${PILLARS[active] ?? "body"}`)}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (downX.current = null)}
        onClickCapture={(e) => {
          if (swiped.current) {
            swiped.current = false;
            e.stopPropagation();
          }
        }}
        onKeyDown={onKeyDown}
        className="persona-ticket relative select-none touch-pan-y outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
        style={{ boxShadow: "none", aspectRatio: "3 / 4" }}
      >
        {personas.map((p, i) => {
          let offset = i - active;
          if (offset > 1) offset -= n;
          if (offset < -1) offset += n;
          const isActive = offset === 0;
          return (
            <div
              key={p.pillar}
              className={isActive ? "absolute inset-0 z-30" : "absolute inset-0 z-10 cursor-pointer opacity-80"}
              style={{
                transform: isActive ? "translateX(0) scale(1)" : `translateX(${offset * 34}%) scale(0.88)`,
                transition: "transform 400ms ease, opacity 400ms ease",
              }}
              onClick={isActive ? undefined : () => setActive(i)}
            >
              <PersonaTicket persona={p} className="h-full w-full" style={{ maxWidth: "none" }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
