"use client";

import Link from "next/link";
import { Panel } from "@/components/ui";
import { useT } from "@/lib/i18n/useT";

/** Shown when no active warrior is selected — the workshop is namespaced per warrior. */
export function NoWarriorCard() {
  const { t } = useT();
  return (
    <Panel variant="strong" rivets className="animate-rise-in text-center">
      <div className="mb-2 text-3xl">⚔️</div>
      <h2 className="font-display text-lg text-gild">{t("onboarding.noWarrior.title")}</h2>
      <p className="mt-2 text-sm text-fg-muted">{t("onboarding.noWarrior.body")}</p>
      <Link
        href="/"
        className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-gold px-5 text-sm font-semibold text-bg hover:bg-gold-2"
      >
        {t("onboarding.noWarrior.cta")}
      </Link>
    </Panel>
  );
}
