"use client";

import { useState, type CSSProperties } from "react";
import Image from "next/image";
import type { Persona, Pillar } from "@/lib/identity/personas";
import { cn } from "@/components/ui";

/** Pillar → colour family (Identity-only tokens; warrior red/purple untouched). */
const PILLAR_COLOR: Record<Pillar, { base: string; bright: string; deep: string }> = {
  soul: { base: "var(--teal)", bright: "var(--teal-2)", deep: "var(--teal-3)" },
  body: { base: "var(--copper)", bright: "var(--copper-2)", deep: "var(--copper-3)" },
  mind: { base: "var(--steel)", bright: "var(--steel-2)", deep: "var(--steel-3)" },
};

export interface PersonaTicketProps {
  persona: Persona;
  className?: string;
  style?: CSSProperties;
}

/**
 * Minimal portrait-orientation persona card (3:4): portrait + veil + frame,
 * archetype and title only. Not interactive by itself.
 */
export function PersonaTicket({ persona, className, style }: PersonaTicketProps) {
  const colors = PILLAR_COLOR[persona.pillar];
  const [src, setSrc] = useState(persona.portrait);

  return (
    <article
      className={cn("hero-card persona-ticket relative shrink-0 overflow-hidden", className)}
      style={{ "--family": colors.base, "--family-2": colors.bright, "--family-3": colors.deep, ...style } as CSSProperties}
    >
      {src ? (
        <Image
          src={src}
          alt=""
          fill
          sizes="200px"
          loading="eager"
          className="object-cover object-top"
          onError={() => {
            if (src !== persona.portraitFallback && persona.portraitFallback) setSrc(persona.portraitFallback);
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-bg-3" />
      )}
      <div aria-hidden className="hero-card-veil absolute inset-0" />
      <div aria-hidden className="hero-card-frame absolute inset-2 rounded-xl" />

      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-1 px-3 pb-4 text-center">
        <h3 className="font-display text-gild text-xl leading-none">{persona.archetype}</h3>
        <span
          className="font-display text-[9px] uppercase tracking-[0.25em]"
          style={{ color: colors.bright, textShadow: "0 0 12px color-mix(in srgb, var(--family) 70%, transparent)" }}
        >
          {persona.title}
        </span>
      </div>
    </article>
  );
}
