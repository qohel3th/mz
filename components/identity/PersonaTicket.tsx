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

/** Pillar sign — inline SVG, same 24×24 / 1.6 stroke system as the nav icons. */
function PillarGlyph({ pillar }: { pillar: Pillar }) {
  const common = {
    viewBox: "0 0 24 24",
    width: 14,
    height: 14,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (pillar === "soul")
    return (
      <svg {...common}>
        <path d="M12 3c1.2 3.2 3.8 4.6 3.8 8.2a3.8 3.8 0 0 1-7.6 0c0-1.5.6-2.5 1.3-3.3.3 1.1.9 1.7 1.6 2C11.6 8 11.4 5.4 12 3Z" />
        <path d="M8 20h8" />
      </svg>
    );
  if (pillar === "body")
    return (
      <svg {...common}>
        <circle cx="12" cy="4.5" r="1.6" />
        <path d="M9 9.5l3-1.5 3 1.5M12 8v5M12 13l-2.5 6M12 13l2.5 6M7 12l5-1M17 12l-5-1" />
      </svg>
    );
  return (
    <svg {...common}>
      <path d="M12 3.5a6.5 6.5 0 0 1 3.5 12v2h-7v-2a6.5 6.5 0 0 1 3.5-12Z" />
      <path d="M9.5 20.5h5M10 9.5c.6-1 1.3-1.5 2-1.5s1.4.5 2 1.5" />
    </svg>
  );
}

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

      {/* pillar sign */}
      <span
        className="absolute start-3.5 top-3.5 grid h-7 w-7 place-items-center rounded-full border bg-bg/60 backdrop-blur-sm"
        style={{ color: colors.bright, borderColor: "color-mix(in srgb, var(--family-2) 55%, transparent)", boxShadow: "0 0 10px -2px var(--family)" }}
        title={persona.pillar}
      >
        <PillarGlyph pillar={persona.pillar} />
      </span>

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
