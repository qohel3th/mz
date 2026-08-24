"use client";

import Link from "next/link";
import { Button, Panel } from "@/components/ui";
import { useT } from "@/lib/i18n/useT";
import { useActiveWarrior, useHydrated } from "@/lib/store";
import { HeroCard } from "./HeroCard";
import { TodayTasks } from "./TodayTasks";
import { HexagonPanel } from "./HexagonPanel";
import { QuarterlyFocusPanel } from "./QuarterlyFocusPanel";
import { MvwCard } from "./MvwCard";
import { ReflectionGateCard } from "@/components/reflections/ReflectionGateCard";

function Skeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy>
      <div className="skeleton h-44" />
      <div className="skeleton h-32" />
      <div className="skeleton h-32" />
      <div className="skeleton h-72" />
    </div>
  );
}

export function DashboardView() {
  const { t } = useT();
  const hydrated = useHydrated();
  const warrior = useActiveWarrior();

  if (!hydrated) return <Skeleton />;

  if (!warrior) {
    return (
      <Panel variant="accent" rivets className="text-center">
        <p className="mb-3 text-sm text-fg-muted">{t("dashboard.noWarrior")}</p>
        <Link href="/">
          <Button variant="gold">{t("dashboard.chooseWarrior")}</Button>
        </Link>
      </Panel>
    );
  }

  return (
    <div className="flex flex-col gap-4" key={warrior.id}>
      <HeroCard warrior={warrior} />

      <ReflectionGateCard />

      <TodayTasks warrior={warrior} />
      <HexagonPanel warrior={warrior} />
      <QuarterlyFocusPanel warrior={warrior} />
      <MvwCard warrior={warrior} />
    </div>
  );
}
