"use client";

import Link from "next/link";
import { useActiveWarrior, useHydrated } from "@/lib/store";
import { useT } from "@/lib/i18n/useT";
import { personasFor } from "@/lib/identity/personas";
import { NoWarriorCard } from "@/components/onboarding/NoWarriorCard";
import { UserText } from "@/components/ui";
import { PersonaTicket } from "./PersonaTicket";

/** Creed banner + the active warrior's three persona tickets (horizontal snap scroller). */
export function IdentityView() {
  const { t } = useT();
  const hydrated = useHydrated();
  const warrior = useActiveWarrior();

  if (!hydrated) {
    return (
      <div className="flex flex-col gap-4" aria-busy>
        <div className="skeleton h-24" />
        <div className="skeleton h-96" />
      </div>
    );
  }
  if (!warrior) return <NoWarriorCard />;

  const personas = personasFor(warrior.id);

  return (
    <div className="-mx-4 flex flex-col gap-5">
      {/* creed banner */}
      <section className="panel panel-accent rivets mx-4 px-5 py-6 text-center">
        <p className="text-[10px] uppercase tracking-[0.35em] text-fg-faint">{t("identity.title")}</p>
        <h1 className="font-display text-gild mt-2 text-2xl leading-snug xs:text-[1.7rem]">{t("identity.creed")}</h1>
        <p className="mt-3 flex items-center justify-center gap-2 text-xs text-fg-muted">
          <UserText text={warrior.name} className="text-fg" />
          <span aria-hidden>·</span>
          <span>{t("identity.subtitle")}</span>
        </p>
      </section>

      {/* tickets */}
      <div className="snap-x-mandatory flex w-full gap-5 overflow-x-auto px-[9vw] py-3" style={{ scrollPaddingInline: "9vw" }}>
        {personas.map((p) => (
          <PersonaTicket key={p.pillar} persona={p} />
        ))}
      </div>

      <div className="mx-4 flex items-center justify-between gap-3 text-xs text-fg-muted">
        <span>{t("identity.swipeHint")}</span>
        <Link
          href="/onboarding"
          className="inline-flex h-9 items-center gap-2 rounded-full border border-gold/50 bg-panel px-4 text-xs font-semibold uppercase tracking-widest text-gold-2 hover:bg-panel-strong"
        >
          {t("identity.workshopLink")}
        </Link>
      </div>
    </div>
  );
}
