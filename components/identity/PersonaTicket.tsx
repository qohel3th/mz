"use client";

import { useState, type CSSProperties } from "react";
import Image from "next/image";
import type { Persona, Pillar } from "@/lib/identity/personas";
import { useT } from "@/lib/i18n/useT";
import { UserText, cn } from "@/components/ui";

/** Pillar → family colour, from the existing token set. */
const PILLAR_COLOR: Record<Pillar, { base: string; bright: string; deep: string }> = {
  soul: { base: "var(--purple)", bright: "var(--purple-2)", deep: "var(--purple-3)" },
  body: { base: "var(--red)", bright: "var(--red-2)", deep: "var(--red-3)" },
  mind: { base: "var(--gold)", bright: "var(--gold-2)", deep: "var(--gold-3)" },
};

/** Pillar crest glyphs — inline SVG, same 24×24 / 1.6 stroke system as the nav icons. */
function PillarGlyph({ pillar }: { pillar: Pillar }) {
  const common = {
    viewBox: "0 0 24 24",
    width: 16,
    height: 16,
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
}

/**
 * Portrait-orientation persona card (~3:4). Sibling of the warrior hero card:
 * same veil / frame / crest language, taller and more rectangular.
 */
export function PersonaTicket({ persona, className }: PersonaTicketProps) {
  const { t } = useT();
  const colors = PILLAR_COLOR[persona.pillar];
  const [src, setSrc] = useState(persona.portrait);

  return (
    <article
      className={cn("hero-card persona-ticket snap-child relative shrink-0 overflow-hidden", className)}
      style={{ "--family": colors.base, "--family-2": colors.bright, "--family-3": colors.deep } as CSSProperties}
    >
      {src ? (
        <Image
          src={src}
          alt=""
          fill
          sizes="300px"
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

      {/* pillar crest */}
      <div className="hero-crest absolute start-4 top-4 flex h-10 items-center gap-1.5 rounded-full px-3 text-[10px] uppercase tracking-[0.25em]">
        <PillarGlyph pillar={persona.pillar} />
        {t(`identity.pillars.${persona.pillar}`)}
      </div>

      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 px-4 pb-4 text-center">
        <h3 className="font-display text-gild text-3xl leading-none">{persona.archetype}</h3>
        <span
          className="font-display text-[11px] uppercase tracking-[0.3em]"
          style={{ color: colors.bright, textShadow: "0 0 12px color-mix(in srgb, var(--family) 70%, transparent)" }}
        >
          {persona.title}
        </span>
        <UserText as="p" text={persona.essence} className="text-sm leading-snug text-fg-muted" />
        <ul className="mt-1 flex flex-wrap justify-center gap-1.5">
          {persona.traits.map((tr) => (
            <li key={tr} className="persona-trait text-[10px] uppercase tracking-[0.18em]">
              {tr}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
